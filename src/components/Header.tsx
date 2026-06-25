import { useState, useEffect } from "react";
import HeaderNavLink from "@/components/HeaderNavLink";
import SocialLink from "@/components/SocialLink";
import { headerNavItems, headerNavigationBehavior, siteBrand, socialLinks } from "@/content/navigation";

function getSectionElement(hash: string) {
  if (!hash.startsWith("#")) {
    return null;
  }

  return document.getElementById(hash.slice(1));
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState(headerNavigationBehavior.defaultActiveHref);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > headerNavigationBehavior.scrolledShadowThresholdPx);

      const sectionLinks = headerNavItems.filter((item) => item.href.startsWith("#"));
      const activeSection = sectionLinks.reduce((current, item) => {
        const section = getSectionElement(item.href);

        if (!section) {
          return current;
        }

        const { top } = section.getBoundingClientRect();

        return top <= headerNavigationBehavior.activeSectionOffsetPx ? item.href : current;
      }, sectionLinks[0]?.href ?? headerNavigationBehavior.defaultActiveHref);

      setActiveHref(activeSection);
    };

    handleScroll();
    const alignInitialHash = window.requestAnimationFrame(() => {
      if (!window.location.hash) {
        return;
      }

      const target = getSectionElement(window.location.hash);

      if (target) {
        target.scrollIntoView();
        handleScroll();
      }
    });

    window.addEventListener("scroll", handleScroll, headerNavigationBehavior.scrollListenerOptions);
    return () => {
      window.cancelAnimationFrame(alignInitialHash);
      window.removeEventListener("scroll", handleScroll, headerNavigationBehavior.scrollListenerOptions);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 bg-slate-900 bg-opacity-95 backdrop-blur-sm z-50 ${isScrolled ? 'shadow-sm' : ''} transition-shadow duration-300`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <a
            href={siteBrand.href}
            className="text-xl font-bold text-[#007bff] transition-colors duration-300 hover:text-[#66b2ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]"
          >
            {siteBrand.label}
          </a>
          <nav aria-label="Primary" className="hidden md:flex items-center ml-8">
            {headerNavItems.map((item, index) => (
              <HeaderNavLink
                key={item.href}
                item={item}
                isLast={index === headerNavItems.length - 1}
                isActive={item.href === activeHref}
              />
            ))}
          </nav>
        </div>
        
        <nav aria-label="Social links">
          <ul role="list" className="flex items-center space-x-3">
            {socialLinks.map((link) => (
              <li key={link.href} role="listitem">
                <SocialLink link={link} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <nav
        aria-label="Mobile primary"
        className="md:hidden border-t border-white/10 px-4 pb-3"
      >
        <ul role="list" className="flex gap-4 overflow-x-auto whitespace-nowrap pt-3">
          {headerNavItems.map((item) => (
            <li key={item.href} role="listitem" className="flex-shrink-0">
              <a
                href={item.href}
                aria-current={item.href === activeHref ? "location" : undefined}
                className={`inline-flex min-h-11 min-w-11 items-center justify-center text-sm transition-colors duration-300 hover:text-[#007bff] focus-visible:text-[#66b2ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff] ${
                  item.href === activeHref ? "font-semibold text-[#66b2ff]" : "font-medium text-gray-200"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
