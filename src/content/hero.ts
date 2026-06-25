export interface HeroContent {
  readonly headline: string;
  readonly subtitle: string;
  readonly body: string;
  readonly ctaLabel: string;
}

export interface HeroBehavior {
  readonly typewriterIntervalMs: number;
  readonly roomyVisualViewportQuery: string;
  readonly compactLandscapeViewportQuery: string;
  readonly compactLandscapePaddingTop: "4.5rem";
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

export interface NetworkAnimationBehavior {
  readonly maxNodes: number;
  readonly connectionThresholdPx: number;
  readonly resizeDebounceMs: number;
  readonly nodeSizePx: {
    readonly min: number;
    readonly variance: number;
  };
  readonly nodeOpacity: {
    readonly min: number;
    readonly variance: number;
  };
  readonly nodeVelocity: {
    readonly range: number;
    readonly offset: number;
  };
  readonly bounceDamping: {
    readonly min: number;
    readonly variance: number;
  };
  readonly colors: readonly string[];
}

export const heroContent: HeroContent = {
  headline: "Hi, I'm Rico",
  subtitle: "I build things when inspiration strikes.",
  body: "I'm a Staff Threat Hunter from Chicago, Illinois. I'm passionate about sharpening my skills in high-stakes environments. I have contributed to designing systems that automate incident detection, response, and threat intelligence that are fast, accurate, and scalable.",
  ctaLabel: "Say hi!",
};

export const heroBehavior: HeroBehavior = {
  typewriterIntervalMs: 150,
  roomyVisualViewportQuery: "(min-width: 768px) and (min-height: 640px)",
  compactLandscapeViewportQuery: "(min-width: 768px) and (max-height: 639px)",
  compactLandscapePaddingTop: "4.5rem",
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

export const networkAnimationBehavior: NetworkAnimationBehavior = {
  maxNodes: 15,
  connectionThresholdPx: 200,
  resizeDebounceMs: 250,
  nodeSizePx: {
    min: 4,
    variance: 6,
  },
  nodeOpacity: {
    min: 0.3,
    variance: 0.6,
  },
  nodeVelocity: {
    range: 0.4,
    offset: 0.2,
  },
  bounceDamping: {
    min: 0.9,
    variance: 0.2,
  },
  colors: [
    "rgba(0, 123, 255, 0.7)",
    "rgba(30, 144, 255, 0.6)",
    "rgba(65, 105, 225, 0.7)",
    "rgba(0, 191, 255, 0.6)",
    "rgba(32, 201, 151, 0.6)",
  ],
};
