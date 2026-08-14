import { ArrowRight } from "lucide-react";
import type { WritingSummary } from "@/lib/writing";

interface LatestWritingSectionProps {
  readonly posts: readonly WritingSummary[];
}

export default function LatestWritingSection({ posts }: LatestWritingSectionProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section id="writing" aria-labelledby="writing-heading" className="portfolio-section writing-preview-section">
      <div className="writing-preview-content">
        <div className="writing-preview-heading-row">
          <h2 id="writing-heading" className="section-title writing-preview-title">
            Writing
          </h2>
          <a href="/writing/" className="writing-view-all-link">
            All writing
            <ArrowRight aria-hidden="true" focusable="false" size={17} />
          </a>
        </div>
        <div className="writing-preview-grid">
          {posts.map((post) => (
            <article key={post.href} className="writing-preview-card">
              <div className="writing-preview-meta">
                <time dateTime={post.publishedAt}>{post.publishedLabel}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readingMinutes} min read</span>
              </div>
              <h3>
                <a href={post.href}>{post.title}</a>
              </h3>
              <p>{post.description}</p>
              <a href={post.href} className="writing-read-link" aria-label={`Read ${post.title}`}>
                Read the article
                <ArrowRight aria-hidden="true" focusable="false" size={17} />
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
