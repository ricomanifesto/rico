import { Github, Linkedin, Mail } from "lucide-react";
import type { ReactNode } from "react";
import type { SocialLink as SocialLinkData, SocialLinkKind } from "@/content/navigation";
import { socialLinkBehavior } from "@/content/navigation";

interface SocialLinkProps {
  link: SocialLinkData;
}

interface SocialLinkAnchorBehavior {
  readonly target?: "_blank";
  readonly rel?: "noopener noreferrer";
}

type SocialIconRenderer = () => ReactNode;

const socialIconRegistry: Record<SocialLinkKind, SocialIconRenderer> = {
  email: () => <Mail size={20} aria-hidden="true" focusable="false" />,
  github: () => <Github size={20} aria-hidden="true" focusable="false" />,
  linkedin: () => <Linkedin size={20} aria-hidden="true" focusable="false" />,
};

const getSocialLinkAnchorBehavior = (isExternal: boolean): SocialLinkAnchorBehavior => ({
  target: isExternal ? socialLinkBehavior.externalTarget : undefined,
  rel: isExternal ? socialLinkBehavior.externalRel : undefined,
});

export default function SocialLink({ link }: SocialLinkProps) {
  const anchorBehavior = getSocialLinkAnchorBehavior(link.external);

  return (
    <a
      href={link.href}
      target={anchorBehavior.target}
      rel={anchorBehavior.rel}
      aria-label={link.label}
      className="header-social-link"
    >
      <SocialIcon kind={link.kind} />
    </a>
  );
}

function SocialIcon({ kind }: { kind: SocialLinkKind }) {
  const Icon = socialIconRegistry[kind];
  return <Icon />;
}
