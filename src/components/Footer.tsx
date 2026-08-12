import { motion } from "framer-motion";
import { footerBehavior } from "../content/portfolio";

interface FooterProps {
  readonly animated?: boolean;
}

export default function Footer({ animated = true }: FooterProps) {
  if (!animated) {
    return (
      <footer className="footer-shell">
        <FooterContent />
      </footer>
    );
  }

  return (
    <motion.footer
      className="footer-shell"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: footerBehavior.containerMotion.duration }}
    >
      <FooterContent />
    </motion.footer>
  );
}

function FooterContent() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer-content">
      <p className="footer-copy">
        © <time dateTime={String(currentYear)}>{currentYear}</time> Rico. All rights reserved.
      </p>
    </div>
  );
}
