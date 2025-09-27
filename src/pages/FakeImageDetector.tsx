import React, { useState, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface DetectionResult {
  label: "AI-generated" | "Real" | "Uncertain";
  confidence: number;
  isFake: boolean;
  clues: string[];
}

const FakeImageDetector: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload with validation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleClear = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // === ENHANCED ACCURACY FUNCTIONS ===

  // 1. Advanced Metadata Analysis
  const analyzeMetadata = (file: File, img: HTMLImageElement): { score: number; clues: string[] } => {
    let score = 0;
    const clues: string[] = [];

    // Check file size vs resolution ratio (AI images often have optimized sizes)
    const megapixels = (img.width * img.height) / 1000000;
    const sizePerMP = file.size / megapixels;

    if (sizePerMP < 100000 && megapixels > 1) {
      score += 0.3;
      clues.push("Low compression for high resolution (common in AI images)");
    }

    // Check for common AI training dimensions
    const aiDimensions = [
      [512, 512], [768, 768], [1024, 1024], 
      [512, 768], [768, 512], [1024, 1024],
      [1024, 768], [768, 1024], [896, 1152], [1152, 896]
    ];
    
    const isAIDimension = aiDimensions.some(([w, h]) => 
      Math.abs(img.width - w) <= 5 && Math.abs(img.height - h) <= 5
    );
    
    if (isAIDimension) {
      score += 0.4;
      clues.push(`Common AI training dimension detected (${img.width}×${img.height})`);
    }

    // Check aspect ratio patterns
    const aspectRatio = img.width / img.height;
    const commonAIAspectRatios = [1, 1.33, 0.75, 1.78, 0.56, 1.5, 0.67];
    const hasCommonAspectRatio = commonAIAspectRatios.some(ratio => 
      Math.abs(aspectRatio - ratio) < 0.02
    );

    if (hasCommonAspectRatio) {
      score += 0.2;
      clues.push(`Common AI aspect ratio (${aspectRatio.toFixed(2)})`);
    }

    return { score: Math.min(score, 1), clues };
  };

  // 2. Advanced Pattern Recognition
  const analyzeImagePatterns = (img: HTMLImageElement): { score: number; clues: string[] } => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = Math.min(img.width, 400); // Scale down for performance
    canvas.height = Math.min(img.height, 400);
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    let score = 0;
    const clues: string[] = [];

    // Analyze color distribution
    const colorAnalysis = analyzeColorDistribution(imageData);
    if (colorAnalysis.unusual) {
      score += 0.2;
      clues.push("Unusual color distribution pattern");
    }

    // Analyze edge consistency
    const edgeAnalysis = analyzeEdgeConsistency(imageData);
    if (edgeAnalysis.unnatural) {
      score += 0.3;
      clues.push("Inconsistent edge patterns detected");
    }

    // Check for overly perfect symmetry
    const symmetry = analyzeSymmetry(imageData);
    if (symmetry > 0.85) {
      score += 0.25;
      clues.push("Unnaturally high symmetry");
    }

    // Check for texture repetition (common AI artifact)
    const repetition = analyzeTextureRepetition(imageData);
    if (repetition > 0.6) {
      score += 0.25;
      clues.push("Texture repetition patterns detected");
    }

    return { score: Math.min(score, 1), clues };
  };

  // Color distribution analysis
  const analyzeColorDistribution = (imageData: ImageData): { unusual: boolean } => {
    const data = imageData.data;
    const channelSums = [0, 0, 0];
    const channelSquares = [0, 0, 0];
    
    for (let i = 0; i < data.length; i += 4) {
      for (let channel = 0; channel < 3; channel++) {
        const value = data[i + channel];
        channelSums[channel] += value;
        channelSquares[channel] += value * value;
      }
    }
    
    const pixelCount = data.length / 4;
    const variances = channelSquares.map((sumSq, i) => 
      (sumSq / pixelCount) - Math.pow(channelSums[i] / pixelCount, 2)
    );
    
    // AI images often have unusual color variances
    const avgVariance = variances.reduce((a, b) => a + b) / 3;
    return { unusual: avgVariance < 500 || avgVariance > 3000 };
  };

  // Edge consistency analysis
  const analyzeEdgeConsistency = (imageData: ImageData): { unnatural: boolean } => {
    const data = imageData.data;
    const width = imageData.width;
    let edgeStrengths: number[] = [];
    
    for (let y = 1; y < imageData.height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4;
        
        // Simple Sobel-like edge detection
        const gradX = (
          -data[index - 4] + data[index + 4] +
          -2 * data[index - 4 + width * 4] + 2 * data[index + 4 + width * 4] +
          -data[index - 4 + width * 8] + data[index + 4 + width * 8]
        );
        
        const gradY = (
          data[index - 4 + width * 8] + 2 * data[index + width * 8] + data[index + 4 + width * 8] +
          -data[index - 4] - 2 * data[index] - data[index + 4]
        );
        
        const edgeStrength = Math.sqrt(gradX * gradX + gradY * gradY);
        if (edgeStrength > 50) {
          edgeStrengths.push(edgeStrength);
        }
      }
    }
    
    // Calculate coefficient of variation
    if (edgeStrengths.length === 0) return { unnatural: false };
    
    const mean = edgeStrengths.reduce((a, b) => a + b) / edgeStrengths.length;
    const variance = edgeStrengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / edgeStrengths.length;
    const cv = Math.sqrt(variance) / mean;
    
    // AI images often have inconsistent edge strengths
    return { unnatural: cv > 1.2 || cv < 0.3 };
  };

  // Symmetry analysis
  const analyzeSymmetry = (imageData: ImageData): number => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    let totalDifference = 0;
    let maxPossibleDifference = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < Math.floor(width / 2); x++) {
        const leftIndex = (y * width + x) * 4;
        const rightIndex = (y * width + (width - x - 1)) * 4;
        
        const leftBrightness = (data[leftIndex] + data[leftIndex + 1] + data[leftIndex + 2]) / 3;
        const rightBrightness = (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;
        
        totalDifference += Math.abs(leftBrightness - rightBrightness);
        maxPossibleDifference += 255;
      }
    }
    
    return 1 - (totalDifference / maxPossibleDifference);
  };

  // Texture repetition analysis
  const analyzeTextureRepetition = (imageData: ImageData): number => {
    // Simplified texture analysis - look for repeating patterns
    const data = imageData.data;
    const width = imageData.width;
    const blockSize = 16;
    let similarBlocks = 0;
    let totalComparisons = 0;
    
    for (let y1 = 0; y1 < imageData.height - blockSize; y1 += blockSize) {
      for (let x1 = 0; x1 < width - blockSize; x1 += blockSize) {
        for (let y2 = y1 + blockSize; y2 < imageData.height - blockSize; y2 += blockSize) {
          for (let x2 = x1 + blockSize; x2 < width - blockSize; x2 += blockSize) {
            const similarity = compareBlocks(data, x1, y1, x2, y2, width, blockSize);
            if (similarity > 0.8) similarBlocks++;
            totalComparisons++;
          }
        }
      }
    }
    
    return totalComparisons > 0 ? similarBlocks / totalComparisons : 0;
  };

  const compareBlocks = (data: Uint8ClampedArray, x1: number, y1: number, x2: number, y2: number, width: number, size: number): number => {
    let difference = 0;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx1 = ((y1 + y) * width + (x1 + x)) * 4;
        const idx2 = ((y2 + y) * width + (x2 + x)) * 4;
        
        const brightness1 = (data[idx1] + data[idx1 + 1] + data[idx1 + 2]) / 3;
        const brightness2 = (data[idx2] + data[idx2 + 1] + data[idx2 + 2]) / 3;
        
        difference += Math.abs(brightness1 - brightness2);
      }
    }
    return 1 - (difference / (size * size * 255));
  };

  // 3. Enhanced Main Analysis Function
  const analyzeImageCharacteristics = (img: HTMLImageElement, file: File): DetectionResult => {
    const metadataAnalysis = analyzeMetadata(file, img);
    const patternAnalysis = analyzeImagePatterns(img);
    
    // Weighted scoring
    const metadataWeight = 0.4;  // Metadata is very reliable
    const patternWeight = 0.6;   // Pattern analysis is most important
    
    const totalScore = 
      (metadataAnalysis.score * metadataWeight) + 
      (patternAnalysis.score * patternWeight);
    
    const confidence = Math.max(0.1, Math.min(0.95, totalScore));
    
    // Combine clues from both analyses
    const allClues = [...metadataAnalysis.clues, ...patternAnalysis.clues];
    
    let label: "AI-generated" | "Real" | "Uncertain";
    let isFake = false;

    if (confidence > 0.7) {
      label = "AI-generated";
      isFake = true;
    } else if (confidence < 0.3) {
      label = "Real";
      isFake = false;
    } else {
      label = "Uncertain";
      isFake = confidence > 0.5;
    }

    return { label, confidence, isFake, clues: allClues.slice(0, 3) }; // Show top 3 clues
  };

  // Main analysis function
  const analyzeImage = async () => {
    if (!image) {
      toast.error("Please upload an image first!");
      return;
    }

    try {
      setLoading(true);
      toast.info("🔍 Analyzing image patterns...");

      const img = new Image();
      img.src = URL.createObjectURL(image);
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const result = analyzeImageCharacteristics(img, image);
      setResult(result);

      // Show appropriate message
      if (result.label === "AI-generated") {
        toast.warning("🤖 AI patterns detected!");
      } else if (result.label === "Real") {
        toast.success("✅ Likely authentic image");
      } else {
        toast.info("❓ Analysis inconclusive");
      }

    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Analysis failed. Please try a different image.");
    } finally {
      setLoading(false);
    }
  };

  // Get color based on result
  const getResultColor = () => {
    if (!result) return "gray";
    return result.isFake ? "red" : result.label === "Uncertain" ? "yellow" : "green";
  };

  const getResultIcon = () => {
    if (!result) return "🔍";
    return result.isFake ? "🤖" : result.label === "Uncertain" ? "❓" : "✅";
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        🔍 Advanced Fake Image Detector
      </h2>

      {/* File Upload */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="block w-full bg-blue-500 text-white text-center py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition duration-200"
        >
          📁 Choose Image
        </label>
        <p className="text-xs text-gray-500 text-center mt-2">
          Supports JPG, PNG, WebP (Max 5MB)
        </p>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="mb-4">
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
          <div className="flex justify-between mt-2">
            <button
              onClick={handleClear}
              className="text-red-500 text-sm hover:text-red-700"
            >
              🗑️ Remove
            </button>
            <span className="text-xs text-gray-500">
              {image?.name} ({(image?.size || 0) / 1024} KB)
            </span>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {preview && (
        <button
          onClick={analyzeImage}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold transition duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          } text-white`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing Patterns...
            </span>
          ) : (
            "🔍 Analyze Image"
          )}
        </button>
      )}

      {/* Enhanced Results Display */}
      {result && (
        <div className={`mt-6 p-4 rounded-lg border-2 ${
          result.isFake ? 'border-red-300 bg-red-50' : 
          result.label === 'Uncertain' ? 'border-yellow-300 bg-yellow-50' : 
          'border-green-300 bg-green-50'
        }`}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">{getResultIcon()}</span>
            <h3 className="text-lg font-bold">Advanced Analysis Result</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <strong>Status:</strong>{" "}
              <span className={`font-bold ${
                result.isFake ? 'text-red-600' : 
                result.label === 'Uncertain' ? 'text-yellow-600' : 
                'text-green-600'
              }`}>
                {result.label}
              </span>
            </div>
            
            <div>
              <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
            </div>
            
            {/* Confidence Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  result.isFake ? 'bg-red-500' : 
                  result.label === 'Uncertain' ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${result.confidence * 100}%` }}
              ></div>
            </div>

            {/* Detection Clues */}
            {result.clues.length > 0 && (
              <div className="mt-3">
                <strong>Detection Clues:</strong>
                <ul className="text-sm mt-1 space-y-1">
                  {result.clues.map((clue, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-xs mr-1">•</span>
                      {clue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-sm text-gray-600 italic">
              {result.confidence > 0.7 && result.isFake
                ? "Multiple AI generation patterns detected"
                : result.confidence < 0.3 && !result.isFake
                ? "Consistent with authentic photography patterns"
                : "Mixed signals - consider additional verification"}
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Instructions */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Advanced Detection Features:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Metadata pattern analysis</li>
          <li>• AI training dimension detection</li>
          <li>• Color distribution analysis</li>
          <li>• Edge consistency checking</li>
          <li>• Texture pattern recognition</li>
        </ul>
      </div>

      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default FakeImageDetector;