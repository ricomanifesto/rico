export interface HeroContent {
  readonly headline: string;
  readonly subtitle: string;
  readonly body: string;
  readonly ctaLabel: string;
}

export interface HeroBehavior {
  readonly typewriterIntervalMs: number;
}

export const heroContent: HeroContent = {
  headline: "Hi, I'm Rico",
  subtitle: "I build things when inspiration strikes.",
  body: "I'm a Staff Threat Hunter from Chicago, Illinois. I'm passionate about sharpening my skills in high-stake environments. I have contributed to designing systems that automate incident detection, response, and threat intelligence that are fast, accurate, and scalable.",
  ctaLabel: "Say hi!",
};

export const heroBehavior: HeroBehavior = {
  typewriterIntervalMs: 150,
};
