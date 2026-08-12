export interface WritingSummary {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly publishedAt: string;
  readonly publishedLabel: string;
  readonly readingMinutes: number;
  readonly topics: readonly string[];
}

const wordsPerMinute = 220;

export function formatPublishedDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

export function getReadingMinutes(markdown: string): number {
  const prose = markdown
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, " ")
    .replace(/!?(\[[^\]]*\])\([^)]*\)/g, "$1")
    .replace(/[#>*_~|-]/g, " ");
  const wordCount = prose.trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
