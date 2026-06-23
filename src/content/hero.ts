export interface HeroContent {
  readonly headline: string;
  readonly subtitle: string;
  readonly body: string;
  readonly ctaLabel: string;
}

export interface HeroBehavior {
  readonly typewriterIntervalMs: number;
  readonly containerMotion: {
    readonly duration: number;
    readonly ease: "easeOut";
  };
  readonly subtitleMotion: {
    readonly delay: number;
    readonly duration: number;
  };
  readonly bodyMotion: {
    readonly delay: number;
    readonly duration: number;
  };
  readonly ctaMotion: {
    readonly delay: number;
    readonly duration: number;
  };
}

export const heroContent: HeroContent = {
  headline: "Hi, I'm Rico",
  subtitle: "I build things when inspiration strikes.",
  body: "I'm a Staff Threat Hunter from Chicago, Illinois. I'm passionate about sharpening my skills in high-stake environments. I have contributed to designing systems that automate incident detection, response, and threat intelligence that are fast, accurate, and scalable.",
  ctaLabel: "Say hi!",
};

export const heroBehavior: HeroBehavior = {
  typewriterIntervalMs: 150,
  containerMotion: {
    duration: 0.8,
    ease: "easeOut",
  },
  subtitleMotion: {
    delay: 0.5,
    duration: 0.8,
  },
  bodyMotion: {
    delay: 0.7,
    duration: 0.8,
  },
  ctaMotion: {
    delay: 0.9,
    duration: 0.8,
  },
};
