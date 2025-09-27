import React, { useState, useEffect, useRef } from 'react';

interface CrashEvent {
  id: string;
  timestamp: string;
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  magnitude: number;
  type: 'impact' | 'sudden-stop' | 'rollover';
  confidence: number;
}

const App: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [crashDetected, setCrashDetected] = useState(false);
  const [events, setEvents] = useState<CrashEvent[]>([]);
  const [sensitivity, setSensitivity] = useState(2); // 1-5 scale
  const [lastAcceleration, setLastAcceleration] = useState({ x: 0, y: 0, z: 0, timestamp: 0 });
  const motionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sensitivity thresholds (lower values = more sensitive)
  const sensitivityLevels = {
    1: { impact: 5, jerk: 20, duration: 100 },   // Very sensitive
    2: { impact: 8, jerk: 30, duration: 150 },   // Sensitive
    3: { impact: 12, jerk: 40, duration: 200 },  // Medium
    4: { impact: 15, jerk: 50, duration: 250 },  // Less sensitive
    5: { impact: 20, jerk: 60, duration: 300 }   // Least sensitive
  };

  const currentThresholds = sensitivityLevels[sensitivity as keyof typeof sensitivityLevels];

  // Save events to localStorage
  const saveEvents = (newEvents: CrashEvent[]) => {
    try {
      localStorage.setItem('crashEvents', JSON.stringify(newEvents));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  };

  // Load events from localStorage
  const loadEvents = () => {
    try {
      const savedEvents = localStorage.getItem('crashEvents');
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents);
        setEvents(parsedEvents.slice(0, 15)); // Show last 15 events
      }
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  const detectCrash = (currentAccel: { x: number; y: number; z: number }, timestamp: number): boolean => {
    const magnitude = Math.sqrt(
      Math.pow(currentAccel.x, 2) + 
      Math.pow(currentAccel.y, 2) + 
      Math.pow(currentAccel.z, 2)
    );

    // Method 1: Simple magnitude threshold (impact detection)
    if (magnitude > currentThresholds.impact) {
      return true;
    }

    // Method 2: Jerk detection (rate of change of acceleration)
    if (lastAcceleration.timestamp > 0) {
      const timeDiff = timestamp - lastAcceleration.timestamp;
      if (timeDiff > 0) {
        const jerkX = Math.abs(currentAccel.x - lastAcceleration.x) / (timeDiff / 1000);
        const jerkY = Math.abs(currentAccel.y - lastAcceleration.y) / (timeDiff / 1000);
        const jerkZ = Math.abs(currentAccel.z - lastAcceleration.z) / (timeDiff / 1000);
        
        const maxJerk = Math.max(jerkX, jerkY, jerkZ);
        if (maxJerk > currentThresholds.jerk) {
          return true;
        }
      }
    }

    // Method 3: Sudden stop detection (rapid deceleration)
    const previousMagnitude = Math.sqrt(
      Math.pow(lastAcceleration.x, 2) + 
      Math.pow(lastAcceleration.y, 2) + 
      Math.pow(lastAcceleration.z, 2)
    );

    if (previousMagnitude > 5 && magnitude < 2 && timestamp - lastAcceleration.timestamp < currentThresholds.duration) {
      return true;
    }

    return false;
  };

  const determineCrashType = (currentAccel: { x: number; y: number; z: number }, lastAccel: { x: number; y: number; z: number }): { type: string, confidence: number } => {
    const magnitude = Math.sqrt(
      Math.pow(currentAccel.x, 2) + 
      Math.pow(currentAccel.y, 2) + 
      Math.pow(currentAccel.z, 2)
    );

    // High magnitude suggests impact
    if (magnitude > 12) {
      return { type: 'impact', confidence: 0.8 };
    }

    // Check for rollover (sideways acceleration)
    const lateralForce = Math.sqrt(Math.pow(currentAccel.x, 2) + Math.pow(currentAccel.y, 2));
    if (lateralForce > 8 && Math.abs(currentAccel.z) < 5) {
      return { type: 'rollover', confidence: 0.7 };
    }

    // Check for sudden stop
    const previousMagnitude = Math.sqrt(
      Math.pow(lastAccel.x, 2) + 
      Math.pow(lastAccel.y, 2) + 
      Math.pow(lastAccel.z, 2)
    );
    
    if (previousMagnitude > 6 && magnitude < 3) {
      return { type: 'sudden-stop', confidence: 0.6 };
    }

    return { type: 'impact', confidence: 0.5 };
  };

  const logCrashEvent = (currentAccel: { x: number; y: number; z: number }, lastAccel: { x: number; y: number; z: number }) => {
    const timestamp = new Date().toISOString();
    const magnitude = Math.sqrt(
      Math.pow(currentAccel.x, 2) + 
      Math.pow(currentAccel.y, 2) + 
      Math.pow(currentAccel.z, 2)
    );

    const { type, confidence } = determineCrashType(currentAccel, lastAccel);

    const newEvent: CrashEvent = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp,
      acceleration: { 
        x: Math.round(currentAccel.x * 100) / 100, 
        y: Math.round(currentAccel.y * 100) / 100, 
        z: Math.round(currentAccel.z * 100) / 100 
      },
      magnitude: Math.round(magnitude * 100) / 100,
      type: type as 'impact' | 'sudden-stop' | 'rollover',
      confidence: Math.round(confidence * 100) / 100
    };
    
    const updatedEvents = [newEvent, ...events.slice(0, 14)]; // Keep last 15 events
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    console.log('Crash event logged:', newEvent);
  };

  const requestPermission = async (): Promise<boolean> => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Permission request failed:', error);
        return false;
      }
    }
    return true;
  };

  const startMonitoring = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      alert('Sensor access denied. Cannot monitor crashes.');
      return;
    }

    setIsMonitoring(true);
    setCrashDetected(false);
    setLastAcceleration({ x: 0, y: 0, z: 0, timestamp: 0 });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setCrashDetected(false);
    if (motionIntervalRef.current) {
      clearInterval(motionIntervalRef.current);
      motionIntervalRef.current = null;
    }
  };

  const clearEvents = () => {
    setEvents([]);
    localStorage.removeItem('crashEvents');
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (!isMonitoring) return;

    const handleMotionEvent = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const currentTime = Date.now();
      const currentAccel = {
        x: event.accelerationIncludingGravity.x || 0,
        y: event.accelerationIncludingGravity.y || 0,
        z: event.accelerationIncludingGravity.z || 0
      };

      setAcceleration({
        x: Math.round(currentAccel.x * 100) / 100,
        y: Math.round(currentAccel.y * 100) / 100,
        z: Math.round(currentAccel.z * 100) / 100
      });

      // Detect crash using multiple methods
      if (detectCrash(currentAccel, currentTime) && !crashDetected) {
        logCrashEvent(currentAccel, lastAcceleration);
        setCrashDetected(true);
        setTimeout(() => setCrashDetected(false), 3000);
      }

      // Update last acceleration for jerk calculation
      setLastAcceleration({
        x: currentAccel.x,
        y: currentAccel.y,
        z: currentAccel.z,
        timestamp: currentTime
      });
    };

    window.addEventListener('devicemotion', handleMotionEvent);

    // Add vibration feedback for testing
    motionIntervalRef.current = setInterval(() => {
      // Optional: Add periodic checks or feedback
    }, 100);

    return () => {
      window.removeEventListener('devicemotion', handleMotionEvent);
      if (motionIntervalRef.current) {
        clearInterval(motionIntervalRef.current);
        motionIntervalRef.current = null;
      }
    };
  }, [isMonitoring, crashDetected, sensitivity, lastAcceleration]);

  const getCrashTypeColor = (type: string) => {
    switch (type) {
      case 'impact': return 'bg-red-100 border-red-300';
      case 'sudden-stop': return 'bg-yellow-100 border-yellow-300';
      case 'rollover': return 'bg-orange-100 border-orange-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getCrashTypeEmoji = (type: string) => {
    switch (type) {
      case 'impact': return '💥';
      case 'sudden-stop': return '🛑';
      case 'rollover': return '🔄';
      default: return '⚠️';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Advanced Crash Detector</h1>
      
      {/* Sensitivity Controls */}
      <div className="bg-white p-4 rounded shadow-md mb-4 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Sensitivity Level: {sensitivity}/5</h2>
        <div className="flex space-x-2 mb-2">
          {[1, 2, 3, 4, 5].map(level => (
            <button
              key={level}
              onClick={() => setSensitivity(level)}
              className={`flex-1 py-2 px-3 rounded text-sm ${
                sensitivity === level 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600">
          {sensitivity === 1 ? 'Very Sensitive' : 
           sensitivity === 2 ? 'Sensitive' : 
           sensitivity === 3 ? 'Medium' : 
           sensitivity === 4 ? 'Less Sensitive' : 'Least Sensitive'}
        </p>
      </div>

      {/* Monitoring Controls */}
      <div className="flex space-x-4 mb-6">
        {!isMonitoring ? (
          <button
            onClick={startMonitoring}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
          >
            Start Monitoring
          </button>
        ) : (
          <button
            onClick={stopMonitoring}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
          >
            Stop Monitoring
          </button>
        )}
        <button
          onClick={clearEvents}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        >
          Clear Events
        </button>
      </div>

      {/* Current Acceleration Display */}
      {isMonitoring && (
        <div className="bg-white p-4 rounded shadow-md mb-4 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-2">Current Acceleration</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-sm text-gray-600">X</div>
              <div className="font-mono">{acceleration.x} m/s²</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Y</div>
              <div className="font-mono">{acceleration.y} m/s²</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Z</div>
              <div className="font-mono">{acceleration.z} m/s²</div>
            </div>
          </div>
        </div>
      )}

      {/* Crash Detection Alert */}
      {crashDetected && (
        <div className="bg-red-200 border border-red-400 text-red-700 px-6 py-4 rounded mb-4 animate-pulse">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🚨</span>
            <span className="font-bold">CRASH DETECTED!</span>
          </div>
          <p className="text-sm">Evidence has been recorded</p>
        </div>
      )}

      {/* Events List */}
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Recent Events ({events.length})</h2>
          <span className="text-sm text-gray-500">Sensitivity: {sensitivity}</span>
        </div>
        
        {events.length === 0 ? (
          <div className="bg-white p-6 rounded shadow-md text-center">
            <p className="text-gray-500">No crashes detected yet</p>
            <p className="text-sm text-gray-400 mt-2">Try shaking your device or changing sensitivity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className={`border rounded p-3 ${getCrashTypeColor(event.type)}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getCrashTypeEmoji(event.type)}</span>
                    <span className="font-medium capitalize">{event.type}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Magnitude: </span>
                    <span className="font-mono">{event.magnitude} m/s²</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence: </span>
                    <span className="font-mono">{event.confidence}</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  Accel: ({event.acceleration.x.toFixed(1)}, {event.acceleration.y.toFixed(1)}, {event.acceleration.z.toFixed(1)})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md">
        <h3 className="font-semibold text-blue-800 mb-2">Testing Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Set sensitivity to 1-2 for light shakes</li>
          <li>• Set sensitivity to 3-4 for moderate impacts</li>
          <li>• Set sensitivity to 5 for severe crashes only</li>
          <li>• Try sudden stops, sharp turns, or phone drops</li>
        </ul>
      </div>
    </div>
  );
};

export default App;