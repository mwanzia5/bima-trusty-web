import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-20">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto px-4"
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-destructive/10 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </motion.div>

        <h1 className="text-6xl font-bold font-jakarta mb-4 text-foreground">404</h1>
        <h2 className="text-2xl font-semibold font-jakarta mb-4 text-foreground">Page Not Found</h2>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        
        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bima-button-primary px-8 py-3 font-semibold inline-flex items-center"
        >
          <Home className="w-5 h-5 mr-2" />
          Back to Home
        </motion.a>
      </motion.div>
    </div>
  );
};

export default NotFound;
