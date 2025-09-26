import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { Car, Shield, Zap, AlertTriangle } from 'lucide-react';

const CrashDetection = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Anime.js animations
    if (titleRef.current) {
      animate(titleRef.current, {
        translateY: [50, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        delay: 300
      });
    }

    if (cardsRef.current) {
      animate(cardsRef.current.children, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        delay: stagger(200, { start: 600 }),
        easing: 'easeOutQuad'
      });
    }
  }, []);

  const features = [
    {
      icon: <Car className="w-8 h-8 text-primary" />,
      title: "Real-time Monitoring",
      description: "Advanced sensors detect impact patterns and vehicle behavior anomalies instantly."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Automatic Emergency Response",
      description: "Immediate notification to emergency services and designated contacts when accidents occur."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "AI-Powered Analysis",
      description: "Machine learning algorithms differentiate between minor bumps and serious crashes."
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-primary" />,
      title: "Preventive Alerts",
      description: "Proactive warnings about dangerous driving conditions and potential risks."
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bima-hero-gradient opacity-30"></div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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

          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold font-jakarta mb-8 opacity-0"
          >
            <span className="bima-text-gradient">Crash Detection</span>
            <br />
            <span className="text-foreground">System</span>
          </h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Revolutionary AI-powered crash detection technology that provides instant emergency response, 
            real-time monitoring, and proactive safety measures to protect you and your loved ones on every journey.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bima-button-primary px-8 py-4 text-lg font-semibold"
            >
              Learn More
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bima-button-secondary px-8 py-4 text-lg font-semibold"
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-jakarta mb-6 text-foreground">
              Advanced Protection Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our crash detection system combines cutting-edge technology with intelligent algorithms 
              to provide comprehensive safety coverage.
            </p>
          </motion.div>

          <div ref={cardsRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -8 }}
                className="bima-card p-8 text-center opacity-0"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold font-jakarta mb-4 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bima-card p-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold font-jakarta mb-6 text-foreground">
              More Features Coming Soon
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We're continuously developing new features to enhance your safety experience. 
              Stay tuned for exciting updates and advanced capabilities.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bima-button-primary px-8 py-3 font-semibold"
            >
              Notify Me
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CrashDetection;