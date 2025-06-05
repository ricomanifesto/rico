import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer 
      className="py-8 px-4 border-t border-border bg-background/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <p className="opacity-75">
          © {currentYear} Rico. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
