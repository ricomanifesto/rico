# ricomanifesto.com

Rico turns Michael's technical work into a public proof surface, showing security, AI, and systems projects through concise positioning, live demos, and inspectable artifacts.

**Live site:** [ricomanifesto.com](https://ricomanifesto.com)

## What It Shows

The site is a personal portfolio for security, AI, and systems projects. It is designed to make each project easier to understand quickly: what it does, why it matters, what stack it uses, and where to inspect the repository or live demo.

## Project Surface

The portfolio highlights projects such as:

- **SentrySearch:** searchable threat intelligence profiles
- **SentryDigest:** analyst-ready security feed briefings
- **SentryInsight:** exploitation-focused threat reports
- **GRCInsight:** audit-ready GRC intelligence reports

Project metadata lives in `src/content/portfolio.ts`, keeping public positioning, repository links, demo links, tech stacks, and carousel assets in one typed content surface.

## Stack

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Vite
- GitHub Pages

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Validation

Use the repo's configured checks before publishing changes:

```bash
npm run check
```

## Deployment

The site deploys to GitHub Pages.
