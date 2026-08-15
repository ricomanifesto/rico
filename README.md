# ricomanifesto.com

This is Michael Rico's public portfolio for security, AI, and systems work.

**[Visit ricomanifesto.com](https://ricomanifesto.com)**

## What Is Here

The home page introduces Michael's work and links to four public projects:

- [SentrySearch](https://github.com/ricomanifesto/SentrySearch): source-backed threat research and saved report review.
- [SentryDigest](https://github.com/ricomanifesto/SentryDigest): scheduled security-news briefings and dated issues.
- [SentryInsight](https://github.com/ricomanifesto/SentryInsight): exploitation reports with CVE and source evidence.
- [GRCInsight](https://github.com/ricomanifesto/GRCInsight): GRC reports with framework mapping and publication history.

Each project has its own page with a plain-language description, stack, repository, live demo, and evidence link. The shared project data lives in `src/content/portfolio.ts`.

First-party articles live in `src/content/writing/`. Astro turns them into the writing archive, permanent article pages, RSS feed, sitemap entries, and structured metadata.

## Run It Locally

Use Node.js 22.12 or newer:

```bash
npm ci
npm run dev
```

Astro prints the local URL when the development server starts.

## Stack

- Astro 7 for static pages, content collections, RSS, and sitemap generation.
- React 18 for the interactive portfolio sections.
- TypeScript 6 and Tailwind CSS 3.
- Playwright for desktop and mobile browser checks.

## Validation

```bash
npm run check
```

The full check runs linting, Astro type checks, source-level accessibility and navigation guards, image and icon checks, browser tests, a production build, and validation of the generated `dist/` directory.

Run a local production preview with:

```bash
npm run build
npm run preview
```

## Deployment

GitHub Actions runs the full check for pull requests and pushes to `main`. A successful `main` build uploads `dist/` to GitHub Pages.

The public domain is served by Cloudflare. GitHub Pages remains a separately deployed rollback, and `public/CNAME` preserves its custom-domain configuration.
