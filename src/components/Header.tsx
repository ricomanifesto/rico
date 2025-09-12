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
        <nav className="flex items-center">
          <a href="#projects" className="ml-4 text-dark-text hover:text-secondary transition duration-300">Projects</a>
          <a href="mailto:michaelrico124@gmail.com" className="ml-4 text-dark-text hover:text-secondary transition duration-300">Contact</a>
          
          {/* Social Links */}
          <div className="flex items-center space-x-3 ml-6">
            <a href="https://github.com/ricomanifesto" target="_blank" rel="noopener noreferrer" aria-label="GitHub" 
               className="text-primary hover:text-secondary transition duration-300 transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.44-1-3.46 0 0-1.02-.35-3.36 1.38A13.37 13.37 0 0 0 9 3c-1.03 0-2.14.15-3.36.87C2.35 4.96 1.33 5.31 1.33 5.31A4.8 4.8 0 0 0 0 8.8c0 3.5 3 5.5 6 5.5-.39 1.39-.72 2.69-.72 4.2V22"></path>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/michael-rico-19600314a" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" 
               className="text-primary hover:text-secondary transition duration-300 transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a href="https://medium.com/@ricomanifesto" target="_blank" rel="noopener noreferrer" aria-label="Medium" 
               className="text-primary hover:text-secondary transition duration-300 transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 2 1.88 1.88"></path>
                <path d="M14.12 3.88 16 2"></path>
                <path d="M9 7.13v-1a3.5 3.5 0 1 1 7 0v1"></path>
                <path d="m7.63 13.27-2.88 2.88"></path>
                <path d="m18.37 13.27 2.88 2.88"></path>
                <path d="M9 10h1.8a2.2 2.2 0 1 1 0 4.4H9"></path>
                <path d="M15 10v4.4"></path>
              </svg>
            </a>
            <a href="mailto:michaelrico124@gmail.com" aria-label="Email" 
               className="text-primary hover:text-secondary transition duration-300 transform hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}