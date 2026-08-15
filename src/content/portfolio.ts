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

export interface ProjectPageLink {
  readonly href: string;
  readonly label: string;
  readonly external: boolean;
}

export interface ProjectPageDetails {
  readonly slug: string;
  readonly name: string;
  readonly metaDescription: string;
  readonly techStack: readonly string[];
  readonly programmingLanguages: string | readonly string[];
  readonly evidence: ProjectPageLink;
}

export interface PortfolioProject {
  readonly title: string;
  readonly description: string;
  readonly techStack: readonly string[];
  readonly links: {
    readonly repository: ProjectActionLink;
    readonly demo: ProjectActionLink | null;
  };
  readonly bgGradient: string;
  readonly image: ProjectImage | null;
  readonly page: ProjectPageDetails;
}

export interface AboutContent {
  readonly technologies: readonly string[];
}

export interface ExperienceItem {
  readonly company: string;
  readonly displayCompany: string;
  readonly title: string;
  readonly period: string;
  readonly highlights: readonly string[];
}

export const aboutContent: AboutContent = {
  technologies: ["Python", "TypeScript", "Next.js", "FastAPI", "Go", "LangGraph"],
};

export const projectActionLinkBehavior: ProjectActionLinkBehavior = {
  externalTarget: "_blank",
  externalRel: "noopener noreferrer",
};

export const projects: readonly PortfolioProject[] = [
  {
    title: "Threat Intelligence Research Workspace",
    description: "SentrySearch turns scattered threat research into source-backed security profiles with persistent reports, authenticated report-library search, detection guidance, and explicit evaluation status when a section could not be scored.",
    techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Supabase", "AWS S3"],
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
    page: {
      slug: "sentrysearch",
      name: "SentrySearch",
      metaDescription: "SentrySearch builds source-backed security profiles with persistent reports, authenticated report-library search, detection guidance, and explicit evaluation status.",
      techStack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Supabase", "AWS S3"],
      programmingLanguages: ["TypeScript", "Python"],
      evidence: {
        href: "/projects/sentrysearch/llm-evaluation/",
        label: "Read the LLM evaluation case study",
        external: false,
      },
    },
  },
  {
    title: "Analyst-Ready Security Briefings",
    description: "SentryDigest turns noisy security feeds into a scheduled three-hour briefing with UTC freshness, source health, retained issues, and stable handoffs you can inspect before sharing.",
    techStack: ["Node.js", "RSS", "GitHub Actions"],
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
    page: {
      slug: "sentrydigest",
      name: "SentryDigest",
      metaDescription: "SentryDigest publishes scheduled three-hour security briefings with UTC freshness, source health, retained issues, and stable handoffs.",
      techStack: ["Node.js", "RSS", "GitHub Actions"],
      programmingLanguages: "JavaScript",
      evidence: {
        href: "https://ricomanifesto.github.io/SentryDigest/archive/",
        label: "Browse retained digest issues",
        external: true,
      },
    },
  },
  {
    title: "Exploitation Intelligence Reports",
    description: "SentryInsight publishes exploitation-focused reports with CVE evidence, affected systems, dated archives, and fail-closed retention of the last verified report when a new run is not trustworthy.",
    techStack: ["Python", "LangGraph", "Pydantic", "OpenRouter"],
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
    page: {
      slug: "sentryinsight",
      name: "SentryInsight",
      metaDescription: "SentryInsight publishes CVE-backed exploitation reports, dated archives, and fail-closed retention of the last verified report.",
      techStack: ["Python", "LangGraph", "Pydantic", "OpenRouter"],
      programmingLanguages: "Python",
      evidence: {
        href: "https://ricomanifesto.github.io/SentryInsight/reports/",
        label: "Browse dated exploitation reports",
        external: true,
      },
    },
  },
  {
    title: "Audit-Ready GRC Intelligence",
    description: "GRCInsight publishes audit-ready reports with framework mapping, evidence manifests, and a machine-readable outcome journal for published, retained, and refused runs.",
    techStack: ["Go", "Python", "AWS Lambda", "DynamoDB", "FastAPI"],
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
    page: {
      slug: "grcinsight",
      name: "GRCInsight",
      metaDescription: "GRCInsight publishes audit-ready reports with framework mapping, evidence manifests, and machine-readable publication outcomes.",
      techStack: ["Go", "Python", "AWS Lambda", "DynamoDB", "FastAPI"],
      programmingLanguages: ["Go", "Python"],
      evidence: {
        href: "https://ricomanifesto.github.io/GRCInsight/publication-history/",
        label: "Inspect the publication outcome journal",
        external: true,
      },
    },
  }
];

export const experiences: readonly ExperienceItem[] = [
  {
    company: "SentinelOne",
    displayCompany: "SentinelOne",
    title: "Staff Threat Hunter",
    period: "December 2024 — present",
    highlights: [
      "Lead proactive threat hunting work across incident readiness and response workflows",
      "Build tooling, detection logic, and analyst-facing systems that make threat activity easier to investigate, validate, and communicate"
    ]
  },
  {
    company: "Uber",
    displayCompany: "Uber",
    title: "Threat Detection Engineer II",
    period: "October 2023 — July 2024",
    highlights: [
      "Built and refined threat detections using large-scale data and real-time streaming systems",
      "Combined multiple detection signals into higher-fidelity alerting patterns for security operations"
    ]
  },
  {
    company: "Dell Secureworks",
    displayCompany: "Dell Secureworks",
    title: "Information Security Researcher",
    period: "August 2013 — August 2023",
    highlights: [
      "Tracked threat actors, analyzed anomalous activity, and identified emerging attack techniques",
      "Wrote and deployed countermeasures quickly to improve detection and response coverage"
    ]
  }
];
