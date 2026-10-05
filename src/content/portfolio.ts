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

export interface ProjectCaseStudy {
  readonly audience: string;
  readonly problem: string;
  readonly outcome: string;
  readonly trust: string;
}

export interface ProjectPageDetails {
  readonly slug: string;
  readonly name: string;
  readonly metaDescription: string;
  readonly techStack: readonly string[];
  readonly programmingLanguages: string | readonly string[];
  readonly caseStudy: ProjectCaseStudy;
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
  technologies: ["Python", "Go", "TypeScript", "PostgreSQL", "AWS", "LangGraph"],
};

export const projectActionLinkBehavior: ProjectActionLinkBehavior = {
  externalTarget: "_blank",
  externalRel: "noopener noreferrer",
};

export const projects: readonly PortfolioProject[] = [
  {
    title: "Threat Intelligence Research Workspace",
    description: "For threat analysts who need research they can defend, SentrySearch turns malware, attack tools, and exposed technologies into source-backed reports with detection guidance, a persistent report library, and explicit evaluation status.",
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
      caseStudy: {
        audience: "Threat analysts and detection engineers who need research they can defend and reuse.",
        problem: "Research about malware, attack tools, and exposed technologies is scattered across sources, easy to lose, and difficult to translate into detection work.",
        outcome: "SentrySearch assembles source-backed profiles with persistent reports, authenticated library search, and detection guidance in one reviewable workspace.",
        trust: "The report keeps source evidence attached and exposes evaluation status when a section could not be scored instead of presenting an unsupported result.",
      },
      evidence: {
        href: "/projects/sentrysearch/llm-evaluation/",
        label: "Read the LLM evaluation case study",
        external: false,
      },
    },
  },
  {
    title: "Analyst-Ready Security Briefings",
    description: "For analysts who need to know what changed without rereading every feed, SentryDigest publishes a scheduled three-hour briefing with source health, UTC freshness, retained history, and stable handoffs for review.",
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
      caseStudy: {
        audience: "Security analysts who need a fast, repeatable view of what changed across monitored feeds.",
        problem: "Important security updates compete with duplicate stories, stale entries, and unreliable sources, making every review start from scratch.",
        outcome: "SentryDigest publishes a scheduled three-hour briefing with UTC freshness and retained issues that can move directly into analyst review.",
        trust: "Source health and stable handoff artifacts stay visible, so a reader can inspect the inputs before sharing the briefing.",
      },
      evidence: {
        href: "https://ricomanifesto.github.io/SentryDigest/archive/",
        label: "Browse retained digest issues",
        external: true,
      },
    },
  },
  {
    title: "Exploitation Intelligence Reports",
    description: "SentryInsight turns CVE and exploitation evidence into dated reports that connect affected systems, attack context, and response priorities. If a new run is not trustworthy, it preserves the last verified report.",
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
      caseStudy: {
        audience: "Threat analysts and incident responders evaluating active exploitation risk.",
        problem: "CVE notices often separate vulnerability details from affected systems, exploitation evidence, and the response context needed to prioritize work.",
        outcome: "SentryInsight publishes dated exploitation reports that connect CVE evidence, affected systems, attack context, and response priorities.",
        trust: "Fail-closed publishing prevents an untrustworthy run from replacing the last verified report, while dated archives preserve what changed.",
      },
      evidence: {
        href: "https://ricomanifesto.github.io/SentryInsight/reports/",
        label: "Browse dated exploitation reports",
        external: true,
      },
    },
  },
  {
    title: "Audit-Ready GRC Intelligence",
    description: "GRCInsight turns regulatory and security feeds into framework-mapped reports with evidence manifests and a visible publication history, so reviewers can see what was published, retained, or refused.",
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
      caseStudy: {
        audience: "Security and compliance teams that need regulatory updates translated into reviewable control context.",
        problem: "Regulatory and security feeds are difficult to connect to framework obligations, audit evidence, and a clear publication decision.",
        outcome: "GRCInsight produces framework-mapped reports with evidence manifests and concise action context for review.",
        trust: "A machine-readable outcome journal records whether each run was published, retained, or refused instead of hiding failed publication states.",
      },
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
      "Lead proactive threat hunts across incident readiness and response workflows, turning ambiguous signals into investigations teams can validate and communicate",
      "Build detections and analyst-facing tooling that make supporting evidence and next actions easier to review"
    ]
  },
  {
    company: "Uber",
    displayCompany: "Uber",
    title: "Threat Detection Engineer II",
    period: "October 2023 — July 2024",
    highlights: [
      "Built detections across large-scale event and streaming data to surface high-signal security behavior",
      "Combined multiple weak signals into higher-confidence alerting patterns for security operations"
    ]
  },
  {
    company: "Dell Secureworks",
    displayCompany: "Dell Secureworks",
    title: "Information Security Researcher",
    period: "August 2013 — August 2023",
    highlights: [
      "Tracked threat actors and emerging techniques across a decade of security research",
      "Translated research into deployable countermeasures that strengthened detection and response coverage"
    ]
  }
];
