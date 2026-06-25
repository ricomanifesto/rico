import { Github, Linkedin, Mail } from "lucide-react";
import type { SocialLink as SocialLinkData, SocialLinkKind } from "@/content/navigation";
import { socialLinkBehavior } from "@/content/navigation";

interface SocialLinkProps {
  link: SocialLinkData;
}

export default function SocialLink({ link }: SocialLinkProps) {
  return (
    <a
      href={link.href}
      target={link.external ? socialLinkBehavior.externalTarget : undefined}
      rel={link.external ? socialLinkBehavior.externalRel : undefined}
      aria-label={link.label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center text-[#007bff] transition duration-300 transform hover:scale-110 hover:text-[#0056b3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66b2ff]"
    >
      <SocialIcon kind={link.kind} />
    </a>
  );
}

function SocialIcon({ kind }: { kind: SocialLinkKind }) {
  if (kind === "email") {
    return <Mail size={20} aria-hidden="true" focusable="false" />;
  }

  if (kind === "github") {
    return <Github size={20} aria-hidden="true" focusable="false" />;
  }

  if (kind === "linkedin") {
    return <Linkedin size={20} aria-hidden="true" focusable="false" />;
  }

  if (kind === "medium") {
    return <MediumIcon />;
  }

  return null;
}

function MediumIcon() {
  return (
    <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
    </svg>
  );
}
