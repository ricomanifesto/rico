import { motion } from "framer-motion";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <motion.footer 
      className="py-8 px-4 border-t border-gray-700 bg-slate-900 text-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-gray-300">
          © {currentYear} Rico. All rights reserved.
        </p>
      </div>
    </motion.footer>
  );
}
