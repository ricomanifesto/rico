export interface ProjectImage {
  readonly src: string;
  readonly decorative: true;
}

export interface ProjectSummary {
  readonly title: string;
  readonly description: string;
  readonly techStack: readonly string[];
  readonly repoUrl: string;
  readonly demoUrl: string;
  readonly bgGradient: string;
  readonly image: ProjectImage | null;
}

export interface ExperienceItem {
  readonly company: string;
  readonly displayCompany: string;
  readonly title: string;
  readonly period: string;
  readonly highlights: readonly string[];
}

export const projects: readonly ProjectSummary[] = [
  {
    title: "AI-Powered Threat Intelligence Platform",
    description: "Leverages Anthropic's Claude with web search capabilities to generate comprehensive threat intelligence profiles for malware, attack tools, and targeted technologies.",
    techStack: ["PYTHON", "FASTAPI", "NEXT.JS"],
    repoUrl: "https://github.com/ricomanifesto/SentrySearch",
    demoUrl: "https://sentry-search.vercel.app/",
    bgGradient: "from-purple-600 via-blue-600 to-cyan-600",
    image: {
      src: "/images/SentrySearch.jpg",
      decorative: true,
    },
  },
  {
    title: "Cybersecurity News Aggregator",
    description: "A low-maintenance website that automatically pulls in the day's top cybersecurity stories using GitHub Actions.",
    techStack: ["NODE.JS"],
    repoUrl: "https://github.com/ricomanifesto/SentryDigest",
    demoUrl: "https://ricomanifesto.github.io/SentryDigest/",
    bgGradient: "from-green-600 via-teal-600 to-blue-600",
    image: {
      src: "/images/SentryDigest.jpg",
      decorative: true,
    },
  },
  {
    title: "Cybersecurity Exploit Reporter",
    description: "An AI-powered tool that doesn't just collect security news but analyzes it to identify active threats, vulnerabilities, and attack patterns, turning news feeds into actionable threat intelligence.",
    techStack: ["PYTHON", "LANGGRAPH", "LANGCHAIN", "FASTMCP"],
    repoUrl: "https://github.com/ricomanifesto/SentryInsight",
    demoUrl: "https://ricomanifesto.github.io/SentryInsight/",
    bgGradient: "from-red-600 via-pink-600 to-purple-600",
    image: {
      src: "/images/SentryInsight.jpg",
      decorative: true,
    },
  },
  {
    title: "Cybersecurity GRC Reporter",
    description: "Automated governance, risk & compliance intelligence that monitors RSS feeds and generates GRC reports using AI analysis.",
    techStack: ["GO", "PYTHON", "LANGGRAPH", "FASTAPI"],
    repoUrl: "https://github.com/ricomanifesto/GRCInsight",
    demoUrl: "https://ricomanifesto.github.io/GRCInsight/",
    bgGradient: "from-orange-600 via-red-600 to-pink-600",
    image: {
      src: "/images/GRCInsight.jpg",
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
