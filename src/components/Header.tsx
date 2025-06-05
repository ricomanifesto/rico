import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-sm z-50 ${isScrolled ? 'shadow-sm' : ''} transition-shadow duration-300`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-primary">rico</div>
        <nav>
          <a href="#projects" className="ml-4 text-dark-text hover:text-secondary transition duration-300">Projects</a>
          <a href="mailto:michaelrico124@gmail.com" className="ml-4 text-dark-text hover:text-secondary transition duration-300">Contact</a>
        </nav>
      </div>
    </header>
  );
}