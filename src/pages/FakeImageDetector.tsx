import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
const anime = require('animejs');
import { Eye, Shield, Scan, AlertCircle } from 'lucide-react';

const FakeImageDetector = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Anime.js animations
    if (titleRef.current) {
      anime({
        targets: titleRef.current,
        translateY: [60, 0],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutQuint',
        delay: 200
      });
    }

    if (cardsRef.current) {
      anime({
        targets: cardsRef.current.children,
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 600,
        delay: anime.stagger(150, { start: 500 }),
        easing: 'easeOutBack'
      });
    }
  }, []);

  const capabilities = [
    {
      icon: <Eye className="w-8 h-8 text-primary" />,
      title: "Deep Learning Analysis",
      description: "Advanced neural networks trained on millions of images to detect subtle manipulation patterns."
    },
    {
      icon: <Scan className="w-8 h-8 text-primary" />,
      title: "Metadata Verification",
      description: "Comprehensive analysis of image metadata, compression artifacts, and digital fingerprints."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Real-time Processing",
      description: "Instant fraud detection with high accuracy rates and minimal processing time."
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-primary" />,
      title: "Confidence Scoring",
      description: "Detailed confidence scores and explanations for every detection result."
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bima-hero-gradient opacity-20"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <Eye className="w-10 h-10 text-primary" />
            </div>
          </motion.div>

          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold font-jakarta mb-8 opacity-0"
          >
            <span className="bima-text-gradient">Fake Image</span>
            <br />
            <span className="text-foreground">Detector</span>
          </h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            State-of-the-art AI technology that identifies manipulated, deepfake, and fraudulent images 
            with unprecedented accuracy. Protect your business from visual fraud and ensure claim authenticity.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bima-button-primary px-8 py-4 text-lg font-semibold"
            >
              Try Demo
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bima-button-secondary px-8 py-4 text-lg font-semibold"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 bg-accent/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-jakarta mb-6 text-foreground">
              Advanced Detection Capabilities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered system uses multiple detection methods to identify even the most 
              sophisticated image manipulations and deepfakes.
            </p>
          </motion.div>

          <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.02 }}
                className="bima-card p-8 text-center opacity-0"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  {capability.icon}
                </div>
                <h3 className="text-xl font-semibold font-jakarta mb-4 text-foreground">
                  {capability.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {capability.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold font-jakarta mb-6 text-foreground">
              Interactive Demo
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience our fake image detection technology in action. Upload images and see 
              real-time analysis results.
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bima-card p-12 text-center"
          >
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-16 mb-8">
              <Scan className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-semibold font-jakarta mb-4 text-foreground">
                Upload Image for Analysis
              </h3>
              <p className="text-muted-foreground mb-8">
                Drag and drop an image here or click to browse your files
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bima-button-primary px-8 py-3 font-semibold"
              >
                Choose File
              </motion.button>
            </div>
            <p className="text-sm text-muted-foreground">
              Demo will be available soon. We're putting the finishing touches on this feature.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bima-card p-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-jakarta mb-6 text-foreground">
              Enterprise Solutions Coming Soon
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Advanced API integrations, bulk processing capabilities, and custom model training 
              for enterprise customers. Join our waitlist for early access.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bima-button-primary px-8 py-3 font-semibold"
            >
              Join Waitlist
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FakeImageDetector;