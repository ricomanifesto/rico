import { useState, useEffect } from "react";
import HeaderNavLink from "@/components/HeaderNavLink";
import SocialLink from "@/components/SocialLink";
import { headerNavItems, socialLinks } from "@/content/navigation";

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
          <a
            href="#intro"
            aria-label="Back to home"
            className="text-xl font-bold text-[#007bff] transition-colors duration-300 hover:text-[#0056b3]"
          >
            rico
          </a>
          <nav className="hidden md:flex items-center ml-8">
            {headerNavItems.map((item, index) => (
              <HeaderNavLink
                key={item.href}
                item={item}
                isLast={index === headerNavItems.length - 1}
              />
            ))}
          </nav>
        </div>
        
        {/* Social Links */}
        <div className="flex items-center space-x-3">
          {socialLinks.map((link) => (
            <SocialLink key={link.href} link={link} />
          ))}
        </div>
      </div>
    </header>
  );
}
