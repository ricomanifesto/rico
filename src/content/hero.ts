export interface HeroContent {
  readonly headline: string;
  readonly subtitle: string;
  readonly body: string;
  readonly ctaLabel: string;
}

export interface HeroBehavior {
  readonly roomyVisualViewportQuery: string;
  readonly compactLandscapeViewportQuery: string;
  readonly compactLandscapeNarrowViewportQuery: string;
  readonly compactLandscapePaddingTop: "4.5rem";
  readonly compactLandscapeNarrowPaddingTop: "9rem";
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

export interface SignalPoint {
  readonly noiseX: number;
  readonly noiseY: number;
  readonly signalX: number;
  readonly signalY: number;
  readonly delaySeconds: number;
}

export interface SignalAnimationBehavior {
  readonly cycleDurationSeconds: number;
  readonly points: readonly SignalPoint[];
}

export const heroContent: HeroContent = {
  headline: "Hi, I'm Michael Rico",
  subtitle: "I build security systems that turn noisy signals into clear, inspectable decisions.",
  body: "I'm a Staff Threat Hunter focused on threat intelligence, incident readiness, and detection engineering. I build tools that make security work easier to inspect, validate, and act on.",
  ctaLabel: "Say hi!",
};

export const heroBehavior: HeroBehavior = {
  roomyVisualViewportQuery: "(min-width: 768px) and (min-height: 640px)",
  compactLandscapeViewportQuery: "(min-width: 768px) and (max-height: 639px)",
  compactLandscapeNarrowViewportQuery: "(min-width: 768px) and (max-width: 899px) and (max-height: 639px)",
  compactLandscapePaddingTop: "4.5rem",
  compactLandscapeNarrowPaddingTop: "9rem",
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

export const signalAnimationBehavior: SignalAnimationBehavior = {
  cycleDurationSeconds: 9,
  points: [
    { noiseX: 52, noiseY: 54, signalX: 174, signalY: 180, delaySeconds: -0.18 },
    { noiseX: 102, noiseY: 84, signalX: 198, signalY: 180, delaySeconds: -0.12 },
    { noiseX: 68, noiseY: 116, signalX: 222, signalY: 180, delaySeconds: -0.06 },
    { noiseX: 126, noiseY: 138, signalX: 246, signalY: 180, delaySeconds: 0 },
    { noiseX: 44, noiseY: 166, signalX: 270, signalY: 180, delaySeconds: 0.06 },
    { noiseX: 112, noiseY: 194, signalX: 294, signalY: 180, delaySeconds: 0.12 },
    { noiseX: 72, noiseY: 218, signalX: 318, signalY: 180, delaySeconds: 0.18 },
    { noiseX: 136, noiseY: 242, signalX: 342, signalY: 180, delaySeconds: 0.24 },
    { noiseX: 54, noiseY: 270, signalX: 366, signalY: 180, delaySeconds: 0.3 },
    { noiseX: 104, noiseY: 300, signalX: 390, signalY: 180, delaySeconds: 0.36 },
    { noiseX: 148, noiseY: 318, signalX: 414, signalY: 180, delaySeconds: 0.42 },
    { noiseX: 42, noiseY: 330, signalX: 438, signalY: 180, delaySeconds: 0.48 },
  ],
};
