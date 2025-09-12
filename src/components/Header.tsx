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
    <header className={`fixed top-0 left-0 right-0 bg-slate-900 bg-opacity-95 backdrop-blur-sm z-50 ${isScrolled ? 'shadow-sm' : ''} transition-shadow duration-300`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-xl font-bold" style={{color: '#007bff'}}>rico</div>
          <nav className="flex items-center ml-8">
            <a href="#intro" className="mr-6 text-sm text-gray-200 transition duration-300" onMouseEnter={(e) => e.target.style.color = '#007bff'} onMouseLeave={(e) => e.target.style.color = ''}>Home</a>
            <a href="#about" className="mr-6 text-sm text-gray-200 transition duration-300" onMouseEnter={(e) => e.target.style.color = '#007bff'} onMouseLeave={(e) => e.target.style.color = ''}>About</a>
            <a href="#experience" className="mr-6 text-sm text-gray-200 transition duration-300" onMouseEnter={(e) => e.target.style.color = '#007bff'} onMouseLeave={(e) => e.target.style.color = ''}>Experience</a>
            <a href="#projects" className="mr-6 text-sm text-gray-200 transition duration-300" onMouseEnter={(e) => e.target.style.color = '#007bff'} onMouseLeave={(e) => e.target.style.color = ''}>Projects</a>
            <a href="mailto:michaelrico124@gmail.com" className="text-sm text-gray-200 transition duration-300" onMouseEnter={(e) => e.target.style.color = '#007bff'} onMouseLeave={(e) => e.target.style.color = ''}>Contact</a>
          </nav>
        </div>
        
        {/* Social Links */}
        <div className="flex items-center space-x-3">
          <a href="mailto:michaelrico124@gmail.com" aria-label="Email" 
             className="transition duration-300 transform hover:scale-110" style={{color: '#007bff'}} onMouseEnter={(e) => e.target.style.color = '#0056b3'} onMouseLeave={(e) => e.target.style.color = '#007bff'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
          </a>
          <a href="https://github.com/ricomanifesto" target="_blank" rel="noopener noreferrer" aria-label="GitHub" 
             className="transition duration-300 transform hover:scale-110" style={{color: '#007bff'}} onMouseEnter={(e) => e.target.style.color = '#0056b3'} onMouseLeave={(e) => e.target.style.color = '#007bff'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/michael-rico-19600314a" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" 
             className="transition duration-300 transform hover:scale-110" style={{color: '#007bff'}} onMouseEnter={(e) => e.target.style.color = '#0056b3'} onMouseLeave={(e) => e.target.style.color = '#007bff'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="https://medium.com/@ricomanifesto" target="_blank" rel="noopener noreferrer" aria-label="Medium" 
             className="transition duration-300 transform hover:scale-110" style={{color: '#007bff'}} onMouseEnter={(e) => e.target.style.color = '#0056b3'} onMouseLeave={(e) => e.target.style.color = '#007bff'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}