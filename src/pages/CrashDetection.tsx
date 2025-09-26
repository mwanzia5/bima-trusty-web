import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { animate, stagger } from "animejs";
import { Car, Shield, Zap, AlertTriangle } from "lucide-react";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";

// ==============================
// TYPES
// ==============================
type CrashData = {
  id?: number;
  timestamp: number;
  acceleration: { x: number; y: number; z: number };
  totalGForce: number;
  sensitivity: number;
  synced: boolean;
};

const CrashDetectionSystem: React.FC = () => {
  // STATE
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [crashDetected, setCrashDetected] = useState(false);
  const [sensitivity] = useState(2.5);
  const [crashCount, setCrashCount] = useState(0);
  const [lastCrashTime, setLastCrashTime] = useState("");
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "failed" | "offline">("idle");
  const [queuedItems, setQueuedItems] = useState(0);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // ==============================
  // ANIMATIONS
  // ==============================
  useEffect(() => {
    if (titleRef.current) {
      animate(titleRef.current, {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: "easeOutQuad",
        delay: 300,
      });
    }
    if (cardsRef.current) {
      animate(cardsRef.current.children, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        delay: stagger(200, { start: 600 }),
        easing: "easeOutQuad",
      });
    }
  }, []);

  // ==============================
  // DB + NETWORK
  // ==============================
  const checkQueuedItems = (database: IDBDatabase) => {
    const transaction = database.transaction(["crashes"], "readonly");
    const store = transaction.objectStore("crashes");
    const index = store.index("synced");
    const request = index.count(IDBKeyRange.only(false));
    request.onsuccess = () => setQueuedItems(request.result);
  };

  const loadCrashCount = (database: IDBDatabase) => {
    const transaction = database.transaction(["crashes"], "readonly");
    const store = transaction.objectStore("crashes");
    const countRequest = store.count();
    countRequest.onsuccess = () => setCrashCount(countRequest.result);
  };

  const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered");
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }
  };

  const syncCrashes = useCallback(async () => {
    if (!db || !isOnline) return;
    setSyncStatus("syncing");

    try {
      const transaction = db.transaction(["crashes"], "readwrite");
      const store = transaction.objectStore("crashes");
      const index = store.index("synced");
      const request = index.getAll(IDBKeyRange.only(false));

      const unsynced = await new Promise<CrashData[]>((resolve) => {
        request.onsuccess = () => resolve(request.result as CrashData[]);
      });

      for (const crash of unsynced) {
        try {
          const response = await fetch("https://your-backend-api.com/crashes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(crash),
          });

          if (response.ok) {
            crash.synced = true;
            store.put(crash);
          }
        } catch (err) {
          console.error("Sync failed:", err);
        }
      }

      setSyncStatus("synced");
      setQueuedItems(0);
    } catch (error) {
      setSyncStatus("failed");
    }
  }, [db, isOnline]);

  const triggerBackgroundSync = useCallback(async () => {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register("sync-crashes");
        console.log("Background sync registered");
      } catch (error) {
        console.error("Background sync failed:", error);
      }
    } else {
      syncCrashes();
    }
  }, [syncCrashes]);

  // ==============================
  // INIT EFFECT
  // ==============================
  useEffect(() => {
    const initDB = async () => {
      try {
        const request = indexedDB.open("CrashDetectionDB", 2);
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains("crashes")) {
            const store = db.createObjectStore("crashes", {
              keyPath: "id",
              autoIncrement: true,
            });
            store.createIndex("timestamp", "timestamp", { unique: false });
            store.createIndex("synced", "synced", { unique: false });
          }
        };
        request.onsuccess = (event) => {
          const database = (event.target as IDBOpenDBRequest).result;
          setDb(database);
          loadCrashCount(database);
          checkQueuedItems(database);
        };
      } catch (error) {
        console.error("DB init failed:", error);
      }
    };

    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus("syncing");
      triggerBackgroundSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    initDB();
    registerServiceWorker();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [triggerBackgroundSync]);

  // ==============================
  // CRASH HANDLING
  // ==============================
  const saveCrashData = (acceleration: { x: number; y: number; z: number }, timestamp: number) => {
    if (!db) return;
    const transaction = db.transaction(["crashes"], "readwrite");
    const store = transaction.objectStore("crashes");
    const crashData: CrashData = {
      timestamp,
      acceleration,
      totalGForce: Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2),
      sensitivity,
      synced: false,
    };
    store.add(crashData);

    transaction.oncomplete = () => {
      setCrashCount((prev) => prev + 1);
      setQueuedItems((prev) => prev + 1);
      setLastCrashTime(new Date(timestamp).toLocaleString());
      if (isOnline) triggerBackgroundSync();
    };
  };

  const handleDeviceMotion = (event: DeviceMotionEvent) => {
    if (!event.accelerationIncludingGravity) return;
    const { x, y, z } = event.accelerationIncludingGravity;
    const timestamp = Date.now();
    const gForce = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);

    if (gForce > sensitivity) {
      setCrashDetected(true);
      saveCrashData({ x: x || 0, y: y || 0, z: z || 0 }, timestamp);
      setTimeout(() => setCrashDetected(false), 5000);
    }
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      window.removeEventListener("devicemotion", handleDeviceMotion as EventListener);
      setIsMonitoring(false);
    } else {
      Notification.requestPermission();
      window.addEventListener("devicemotion", handleDeviceMotion as EventListener);
      setIsMonitoring(true);
    }
  };

  // ==============================
  // UI
  // ==============================
  const features = [
    {
      icon: <Car className="w-8 h-8 text-primary" />,
      title: "Real-time Monitoring",
      description: "Advanced sensors detect impact patterns instantly.",
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Emergency Response",
      description: "Immediate notification to emergency services and contacts.",
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Machine learning separates minor bumps from crashes.",
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-primary" />,
      title: "Preventive Alerts",
      description: "Proactive warnings about risky conditions.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <Car className="w-10 h-10 text-primary" />
            </div>
          </motion.div>
          <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold mb-8 opacity-0">
            Crash Detection <span className="text-foreground">System</span>
          </h1>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Features</h2>
          <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="p-8 text-center opacity-0 border rounded-lg bg-card"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{f.title}</h3>
                <p className="text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Crash Detection Dashboard</CardTitle>
            <CardDescription>Monitor motion, detect crashes, and sync evidence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap mb-4">
              <Button
                onClick={toggleMonitoring}
                variant={isMonitoring ? "destructive" : "default"}
              >
                {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
              </Button>
              <Button
                onClick={() => syncCrashes()}
                disabled={!isOnline || queuedItems === 0}
              >
                Sync Now ({queuedItems})
              </Button>
            </div>
            {crashDetected && (
              <Alert variant="destructive">
                <AlertTitle>Crash Detected!</AlertTitle>
                <AlertDescription>
                  Crash evidence saved {isOnline ? "and queued for sync" : "locally"}.
                </AlertDescription>
              </Alert>
            )}
            <div className="mt-4 space-y-2">
              <p>
                Total Crashes: <strong>{crashCount}</strong>
              </p>
              {lastCrashTime && (
                <p>
                  Last Crash: <strong>{lastCrashTime}</strong>
                </p>
              )}
              <p>
                Sync Status: <Badge>{syncStatus}</Badge>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrashDetectionSystem;
