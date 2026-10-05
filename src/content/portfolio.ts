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

export interface ProjectProof {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly facts: readonly string[];
  readonly href: string;
  readonly linkLabel: string;
  readonly boundary: string;
}

export interface ProjectStory {
  readonly decision: string;
  readonly tradeoff: string;
  readonly proof: ProjectProof;
}

export interface ProjectPageDetails {
  readonly slug: string;
  readonly name: string;
  readonly metaDescription: string;
  readonly techStack: readonly string[];
  readonly programmingLanguages: string | readonly string[];
  readonly caseStudy: ProjectCaseStudy;
  readonly story: ProjectStory;
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
      story: {
        decision: "Keep evidence admissibility and handoff eligibility in application code. The model can propose sources, claims, and scores; it cannot decide that evidence is safe to reuse.",
        tradeoff: "A polished report can remain unassessed or blocked until its evidence and analyst disposition are complete. The workflow favors defensible reuse over a higher apparent completion rate.",
        proof: {
          eyebrow: "Evidence review",
          title: "A 4.57 score still failed the reuse test.",
          body: "A production canary initially passed its automated evidence assessment. Reader review then found a training artifact supporting ten high-risk claims, showing why a quality score could not own evidence admissibility.",
          facts: [
            "Evaluation: 4.57 and reviewable",
            "Review finding: one training source supported ten high-risk claims",
            "Contract response: captured source content, fingerprints, and exact support excerpts",
          ],
          href: "https://github.com/ricomanifesto/SentrySearch/blob/8eca6272a18d554484ee9bfa2f5bdcf21e9dd44e/docs/evidence-admissibility-decision-2026-08-15.md",
          linkLabel: "Inspect this result",
          boundary: "This proves the evidence review caught a specific failure and changed the contract. It does not establish production accuracy across reports.",
        },
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
      story: {
        decision: "Make the dated issue and stable article identity the contract. Downstream reports link back to the exact digest context instead of depending on a changing homepage.",
        tradeoff: "The current view is intentionally bounded to four configured feeds and 30 items. It does not claim complete coverage; quiet sources remain visible as a coverage signal.",
        proof: {
          eyebrow: "Source-health snapshot",
          title: "A quiet feed stays visible instead of disappearing.",
          body: "The October 5 source-health record shows both the current briefing mix and the source that contributed nothing. That imbalance is part of the output, not hidden operational detail.",
          facts: [
            "Current view: 30 items",
            "Active contribution: 15 Bleeping Computer, 12 The Hacker News, 3 Dark Reading",
            "Coverage signal: Krebs on Security was quiet for seven days with no current items",
          ],
          href: "https://github.com/ricomanifesto/SentryDigest/blob/323394fa081c32ba3bc04541b15059764310e6d5/feed-info.json",
          linkLabel: "Inspect this result",
          boundary: "This is a dated source-health snapshot, not a claim that four feeds provide complete threat coverage.",
        },
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
      story: {
        decision: "Normalize each finding into explicit severity, exploitation status, action, and reporting links, then validate that structure before publishing.",
        tradeoff: "The report preserves source uncertainty instead of filling gaps. If reporting does not name a CVE or confirm exploitation, the output must say so.",
        proof: {
          eyebrow: "Dated report example",
          title: "One report separated active exploitation from patch-only urgency.",
          body: "The October 4 report kept two critical patching decisions distinct: one vulnerability had confirmed active exploitation, while the other did not. Both retained their source links and explicit action labels.",
          facts: [
            "October 4 report: 10 findings and 2 named CVEs",
            "FortiMail CVE-2026-104286: active exploitation, patch",
            "Dell CSM CVE-2026-63688: exploitation not observed, patch",
          ],
          href: "https://github.com/ricomanifesto/SentryInsight/blob/ac95f7c5ea5dde3115e5e43e188736ae171e43bb/reports/2026-10-04.md",
          linkLabel: "Inspect this result",
          boundary: "This shows the report structure and a dated generated artifact. It does not measure analyst time saved or guarantee the underlying reporting is complete.",
        },
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
      story: {
        decision: "Treat the publication outcome and evidence-manifest hash as first-class records. A report is published only when source, model, and citation provenance agree.",
        tradeoff: "Freshness yields to provenance. Provider or model-identity failures retain the last verified report and record the refusal instead of replacing it.",
        proof: {
          eyebrow: "Publication-history snapshot",
          title: "The publication journal records refusal, not just success.",
          body: "At the October 5 evidence revision, the bounded journal contained both accepted publications and refused attempts. A provider failure remained visible without overwriting the latest verified report.",
          facts: [
            "Journal snapshot: 30 terminal events",
            "Published: 22",
            "Retained after a refused attempt: 8",
          ],
          href: "https://github.com/ricomanifesto/GRCInsight/blob/cfe7ba6056cfa064ede78f045049ee7ace8b6b59/site/publication-history.json",
          linkLabel: "Inspect this result",
          boundary: "The journal proves how publication decisions were recorded. It does not establish report accuracy or business impact.",
        },
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
