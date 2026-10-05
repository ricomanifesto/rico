export interface HeroContent {
  readonly headline: string;
  readonly introduction: string;
  readonly body: string;
}

export const heroContent: HeroContent = {
  headline: "I build security systems that show their work.",
  introduction: "I'm Michael Rico, a Staff Threat Hunter building tools for threat intelligence, incident readiness, and detection engineering.",
  body: "I turn noisy security data into decisions analysts can verify and leaders can act on, with the sources, evaluation boundaries, and operating history left visible.",
};
