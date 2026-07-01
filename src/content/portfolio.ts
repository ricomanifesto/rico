export interface ProjectImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  readonly decorative: true;
}

export interface ProjectActionLink {
  readonly href: string;
  readonly external: true;
}

export interface ProjectActionLinkBehavior {
  readonly externalTarget: "_blank";
  readonly externalRel: "noopener noreferrer";
}

export interface ProjectSummary {
  readonly title: string;
  readonly description: string;
  readonly techStack: readonly string[];
  readonly links: {
    readonly repository: ProjectActionLink;
    readonly demo: ProjectActionLink | null;
  };
  readonly bgGradient: string;
  readonly image: ProjectImage | null;
}

export interface FooterBehavior {
  readonly containerMotion: {
    readonly duration: number;
  };
}

export interface ProjectCarouselBehavior {
  readonly autoRotationIntervalMs: number;
  readonly keyboardActivationKeys: readonly string[];
  readonly slideStepPercent: number;
  readonly sectionHeadingMotion: {
    readonly duration: number;
  };
  readonly slideMotion: {
    readonly duration: number;
    readonly staggerDelay: number;
  };
  readonly hoverMotion: {
    readonly scale: number;
  };
}

export interface AboutContent {
  readonly technologies: readonly string[];
}

export interface AboutBehavior {
  readonly technologyGrid: {
    readonly rowCount: number;
  };
  readonly sectionHeadingMotion: {
    readonly duration: number;
  };
  readonly introMotion: {
    readonly delay: number;
    readonly duration: number;
  };
  readonly technologiesMotion: {
    readonly delay: number;
    readonly duration: number;
  };
  readonly technologyItemMotion: {
    readonly baseDelay: number;
    readonly staggerDelay: number;
    readonly duration: number;
    readonly leadingColumnOffsetX: number;
    readonly trailingColumnOffsetX: number;
  };
  readonly interestsMotion: {
    readonly delay: number;
    readonly duration: number;
  };
  readonly imageMotion: {
    readonly delay: number;
    readonly duration: number;
  };
}

export interface ExperienceItem {
  readonly company: string;
  readonly displayCompany: string;
  readonly title: string;
  readonly period: string;
  readonly highlights: readonly string[];
}

export interface ExperienceBehavior {
  readonly keyboardNavigationKeys: {
    readonly next: readonly string[];
    readonly previous: readonly string[];
    readonly first: string;
    readonly last: string;
  };
  readonly sectionHeadingMotion: {
    readonly duration: number;
  };
  readonly tabMotion: {
    readonly duration: number;
    readonly staggerDelay: number;
  };
  readonly panelMotion: {
    readonly duration: number;
  };
  readonly highlightMotion: {
    readonly duration: number;
    readonly staggerDelay: number;
    readonly baseDelay: number;
  };
}

export const aboutContent: AboutContent = {
  technologies: ["Python", "TypeScript", "Next.js", "FastAPI", "Go", "LangGraph"],
};

export const aboutBehavior: AboutBehavior = {
  technologyGrid: {
    rowCount: 3,
  },
  sectionHeadingMotion: {
    duration: 0.6,
  },
  introMotion: {
    delay: 0.2,
    duration: 0.8,
  },
  technologiesMotion: {
    delay: 0.4,
    duration: 0.8,
  },
  technologyItemMotion: {
    baseDelay: 0.6,
    staggerDelay: 0.1,
    duration: 0.6,
    leadingColumnOffsetX: -20,
    trailingColumnOffsetX: 20,
  },
  interestsMotion: {
    delay: 1.0,
    duration: 0.8,
  },
  imageMotion: {
    delay: 0.8,
    duration: 0.8,
  },
};

export const footerBehavior: FooterBehavior = {
  containerMotion: {
    duration: 0.5,
  },
};

export const projectCarouselBehavior: ProjectCarouselBehavior = {
  autoRotationIntervalMs: 10000,
  keyboardActivationKeys: ["Enter", " "],
  slideStepPercent: 100,
  sectionHeadingMotion: {
    duration: 0.6,
  },
  slideMotion: {
    duration: 0.6,
    staggerDelay: 0.1,
  },
  hoverMotion: {
    scale: 1.02,
  },
};

export const projectActionLinkBehavior: ProjectActionLinkBehavior = {
  externalTarget: "_blank",
  externalRel: "noopener noreferrer",
};

export const projects: readonly ProjectSummary[] = [
  {
    title: "Threat Intelligence Research Workspace",
    description: "SentrySearch turns scattered threat research into searchable security profiles for malware, attack tools, and targeted technologies, with persistent reports, hybrid search, and detection guidance in one workspace.",
    techStack: ["NEXT.JS", "TYPESCRIPT", "FASTAPI", "PINECONE", "SUPABASE"],
    links: {
      repository: {
        href: "https://github.com/ricomanifesto/SentrySearch",
        external: true,
      },
      demo: {
        href: "https://sentry-search.vercel.app/",
        external: true,
      },
    },
    bgGradient: "from-purple-600 via-blue-600 to-cyan-600",
    image: {
      src: "/images/SentrySearch.jpg",
      width: 2048,
      height: 1280,
      decorative: true,
    },
  },
  {
    title: "Analyst-Ready Security Briefings",
    description: "SentryDigest turns noisy security feeds into a daily analyst-ready briefing, with source links, severity cues, and clean HTML output you can inspect before sharing.",
    techStack: ["NODE.JS", "RSS", "GITHUB ACTIONS"],
    links: {
      repository: {
        href: "https://github.com/ricomanifesto/SentryDigest",
        external: true,
      },
      demo: {
        href: "https://ricomanifesto.github.io/SentryDigest/",
        external: true,
      },
    },
    bgGradient: "from-green-600 via-teal-600 to-blue-600",
    image: {
      src: "/images/SentryDigest.jpg",
      width: 2048,
      height: 1280,
      decorative: true,
    },
  },
  {
    title: "Exploitation Intelligence Reports",
    description: "SentryInsight turns security RSS feeds into exploitation-focused threat reports, with CVE correlation, affected systems, attack vectors, and executive summaries ready for review.",
    techStack: ["PYTHON", "LANGGRAPH", "PYDANTIC", "OPENROUTER"],
    links: {
      repository: {
        href: "https://github.com/ricomanifesto/SentryInsight",
        external: true,
      },
      demo: {
        href: "https://ricomanifesto.github.io/SentryInsight/",
        external: true,
      },
    },
    bgGradient: "from-red-600 via-pink-600 to-purple-600",
    image: {
      src: "/images/SentryInsight.jpg",
      width: 2048,
      height: 1280,
      decorative: true,
    },
  },
  {
    title: "Audit-Ready GRC Intelligence",
    description: "GRCInsight turns regulatory and security feeds into audit-ready GRC intelligence, with framework mapping, agency signals, industry relevance, and concise action-oriented reports.",
    techStack: ["GO", "PYTHON", "AWS LAMBDA", "DYNAMODB", "FASTAPI"],
    links: {
      repository: {
        href: "https://github.com/ricomanifesto/GRCInsight",
        external: true,
      },
      demo: {
        href: "https://ricomanifesto.github.io/GRCInsight/",
        external: true,
      },
    },
    bgGradient: "from-orange-600 via-red-600 to-pink-600",
    image: {
      src: "/images/GRCInsight.jpg",
      width: 2048,
      height: 1280,
      decorative: true,
    },
  }
];

export const experiences: readonly ExperienceItem[] = [
  {
    company: "SENTINELONE",
    displayCompany: "SentinelOne",
    title: "Staff Threat Hunter",
    period: "DECEMBER 2024 - PRESENT",
    highlights: [
      "Lead proactive threat hunting work across incident readiness and response workflows",
      "Build tooling, detection logic, and analyst-facing systems that make threat activity easier to investigate, validate, and communicate"
    ]
  },
  {
    company: "UBER",
    displayCompany: "Uber",
    title: "Threat Detection Engineer II",
    period: "OCTOBER 2023 - JULY 2024",
    highlights: [
      "Built and refined threat detections using large-scale data and real-time streaming systems",
      "Combined multiple detection signals into higher-fidelity alerting patterns for security operations"
    ]
  },
  {
    company: "DELL SECUREWORKS",
    displayCompany: "Dell Secureworks",
    title: "Information Security Researcher",
    period: "AUGUST 2013 - AUGUST 2023",
    highlights: [
      "Tracked threat actors, analyzed anomalous activity, and identified emerging attack techniques",
      "Wrote and deployed countermeasures quickly to improve detection and response coverage"
    ]
  }
];

export const experienceBehavior: ExperienceBehavior = {
  keyboardNavigationKeys: {
    next: ["ArrowDown", "ArrowRight"],
    previous: ["ArrowUp", "ArrowLeft"],
    first: "Home",
    last: "End",
  },
  sectionHeadingMotion: {
    duration: 0.6,
  },
  tabMotion: {
    duration: 0.6,
    staggerDelay: 0.1,
  },
  panelMotion: {
    duration: 0.6,
  },
  highlightMotion: {
    duration: 0.6,
    staggerDelay: 0.1,
    baseDelay: 0.2,
  },
};
