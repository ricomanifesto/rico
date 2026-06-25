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
  technologies: ["Python", "Next.js", "FastAPI", "Go", "scikit-learn", "LangGraph"],
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
    title: "AI-Powered Threat Intelligence Platform",
    description: "Leverages Anthropic's Claude with web search capabilities to generate comprehensive threat intelligence profiles for malware, attack tools, and targeted technologies.",
    techStack: ["PYTHON", "FASTAPI", "NEXT.JS"],
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
      width: 1898,
      height: 1210,
      decorative: true,
    },
  },
  {
    title: "Cybersecurity News Aggregator",
    description: "A low-maintenance website that automatically pulls in the day's top cybersecurity stories using GitHub Actions.",
    techStack: ["NODE.JS"],
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
      width: 2444,
      height: 1454,
      decorative: true,
    },
  },
  {
    title: "Cybersecurity Exploit Reporter",
    description: "An AI-powered tool that doesn't just collect security news but analyzes it to identify active threats, vulnerabilities, and attack patterns, turning news feeds into actionable threat intelligence.",
    techStack: ["PYTHON", "LANGGRAPH", "LANGCHAIN", "FASTMCP"],
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
      width: 2366,
      height: 1434,
      decorative: true,
    },
  },
  {
    title: "Cybersecurity GRC Reporter",
    description: "Automated governance, risk & compliance intelligence that monitors RSS feeds and generates GRC reports using AI analysis.",
    techStack: ["GO", "PYTHON", "LANGGRAPH", "FASTAPI"],
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
      width: 2104,
      height: 1360,
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
      "Conduct proactive threat hunting services",
      "Build, evolve, and expand hunting tooling, techniques and use-cases"
    ]
  },
  {
    company: "UBER",
    displayCompany: "Uber",
    title: "Threat Detection Engineer II",
    period: "OCTOBER 2023 - JULY 2024",
    highlights: [
      "Used big data and real-time streaming technologies to build and refine threat detections",
      "Built mechanisms that combined multiple detection signals to create higher fidelity threat detections"
    ]
  },
  {
    company: "DELL SECUREWORKS",
    displayCompany: "Dell Secureworks",
    title: "Information Security Researcher",
    period: "AUGUST 2013 - AUGUST 2023",
    highlights: [
      "Tracked threat actors and analyzed anomalous activity, uncovering new attack techniques and threats",
      "Wrote and deployed new countermeasures rapidly"
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
