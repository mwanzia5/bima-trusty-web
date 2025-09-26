import { motion } from 'framer-motion';
import { Shield, Zap, Clock, Users, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const HomePage = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Smart Protection",
      description: "AI-powered risk assessment and proactive coverage that adapts to your lifestyle."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Instant Claims",
      description: "Lightning-fast claim processing with automated verification and instant payouts."
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance with real human experts, not just chatbots."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Trusted by Thousands",
      description: "Join over 50,000 satisfied customers who trust Bima for their protection needs."
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "99.9%", label: "Uptime" },
    { number: "2 min", label: "Average Claim Time" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bima-hero-gradient opacity-40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6"
              >
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                  <Shield className="w-4 h-4 mr-2" />
                  Smart Insurance Technology
                </div>
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-jakarta mb-8 leading-tight">
                <span className="text-foreground">Your</span>
                <br />
                <span className="bima-text-gradient">Smart Insurance</span>
                <br />
                <span className="text-foreground">Partner</span>
              </h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg"
              >
                Experience the future of insurance with Bima's AI-driven platform. 
                Get intelligent protection, instant claims, and personalized coverage 
                that evolves with your needs.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bima-button-primary px-8 py-4 text-lg font-semibold inline-flex items-center justify-center"
                >
                  Get Your Quote
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bima-button-secondary px-8 py-4 text-lg font-semibold"
                >
                  Learn More
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary font-jakarta">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column - Hero Image */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-[var(--shadow-card)]">
                <img
                  src={heroImage}
                  alt="Bima Smart Insurance Technology"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
              </div>
              
              {/* Floating cards */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="absolute -top-6 -left-6 bima-card p-4 bg-background shadow-[var(--shadow-button)]"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Claims Processed</span>
                </div>
                <div className="text-lg font-bold text-primary">2,847</div>
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="absolute -bottom-4 -right-4 bima-card p-4 bg-background shadow-[var(--shadow-button)]"
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">AI Processing</span>
                </div>
                <div className="text-lg font-bold text-primary">99.9%</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-jakarta mb-6 text-foreground">
              Why Choose Bima?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're revolutionizing insurance with cutting-edge technology, 
              transparent processes, and customer-first approach that puts you in control.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bima-card p-8 text-center"
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bima-card p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bima-hero-gradient opacity-10"></div>
            <div className="relative">
              <h2 className="text-4xl font-bold font-jakarta mb-6 text-foreground">
                Ready to Get Protected?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Join thousands of satisfied customers who trust Bima for their insurance needs. 
                Get your personalized quote in just 60 seconds.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bima-button-primary px-10 py-4 text-lg font-semibold inline-flex items-center"
              >
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;