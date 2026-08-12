import { useState, useEffect } from "react";
import HeaderNavLink from "@/components/HeaderNavLink";
import SocialLink from "@/components/SocialLink";
import { headerNavItems, headerNavigationBehavior, siteBrand, socialLinks } from "@/content/navigation";

interface HeaderShellViewState {
  readonly shadowClass: string;
}

const getHeaderShellViewState = (isScrolled: boolean): HeaderShellViewState => ({
  shadowClass: isScrolled ? "header-shell-scrolled" : "",
});

function getSectionElement(hash: string) {
  if (!hash.startsWith("#")) {
    return null;
  }

  return document.getElementById(hash.slice(1));
}

function normalizePathname(pathname: string) {
  return pathname === "/" ? pathname : `${pathname.replace(/\/$/, "")}/`;
}

function getItemLocation(href: string) {
  const url = new URL(href, window.location.origin);

  return {
    hash: url.hash,
    pathname: normalizePathname(url.pathname),
  };
}

function getInitialActiveHref(currentPath: string) {
  const normalizedCurrentPath = normalizePathname(currentPath);
  const currentPageItem = headerNavItems.find((item) => {
    if (item.href.startsWith("mailto:")) {
      return false;
    }

    const itemPath = normalizePathname(new URL(item.href, "https://ricomanifesto.com").pathname);
    return !new URL(item.href, "https://ricomanifesto.com").hash && itemPath === normalizedCurrentPath;
  });

  return currentPageItem?.href ?? headerNavigationBehavior.defaultActiveHref;
}

interface HeaderProps {
  readonly currentPath?: string;
}

export default function Header({ currentPath = "/" }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState(() => getInitialActiveHref(currentPath));
  const shellViewState = getHeaderShellViewState(isScrolled);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > headerNavigationBehavior.scrolledShadowThresholdPx);

      const currentPathname = normalizePathname(window.location.pathname);
      const sectionLinks = headerNavItems.filter((item) => {
        if (item.href.startsWith("mailto:")) {
          return false;
        }

        const itemLocation = getItemLocation(item.href);
        return itemLocation.pathname === currentPathname && Boolean(itemLocation.hash);
      });

      if (sectionLinks.length === 0) {
        setActiveHref(getInitialActiveHref(currentPathname));
        return;
      }

      const activeSection = sectionLinks.reduce((current, item) => {
        const section = getSectionElement(getItemLocation(item.href).hash);

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
    <header className={`header-shell ${shellViewState.shadowClass}`}>
      <div className="header-container">
        <div className="header-brand-group">
          <a
            href={siteBrand.href}
            className="header-brand-link"
          >
            <img
              src="/favicon.svg"
              width="64"
              height="64"
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="header-brand-mark"
            />
            <span>{siteBrand.label}</span>
          </a>
          <nav aria-label="Primary" className="header-primary-nav">
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
          <ul role="list" className="header-social-list">
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
        className="header-mobile-nav"
      >
        <ul role="list" className="header-mobile-list">
          {headerNavItems.map((item) => (
            <li key={item.href} role="listitem" className="header-mobile-item">
              <HeaderNavLink item={item} isActive={item.href === activeHref} variant="mobile" />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
