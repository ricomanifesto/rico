<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <title><xsl:value-of select="rss/channel/title" /> | RSS</title>
        <script>
          (function () {
            var stored = null;
            try { stored = localStorage.getItem("theme"); } catch (e) {}
            if (stored === "dark" || stored === "light") {
              document.documentElement.dataset.theme = stored;
            }
          })();
        </script>
        <style>
          :root {
            color-scheme: light dark;
            font-family: "Open Sans", system-ui, sans-serif;
            --rss-bg: #f3efe5;
            --rss-ink: #1a2637;
            --rss-copy: #3c495b;
            --rss-muted: #546072;
            --rss-accent: #075caa;
            --rss-accent-strong: #03457f;
            --rss-rule: #d1c9bc;
            --rss-sep: #7a8494;
            --rss-focus: #075caa;
          }
          @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) {
              --rss-bg: #11151b;
              --rss-ink: #f1eee7;
              --rss-copy: #bac2cc;
              --rss-muted: #8f99a6;
              --rss-accent: #8db7df;
              --rss-accent-strong: #c0dbf2;
              --rss-rule: #303741;
              --rss-sep: #68727e;
              --rss-focus: #b9d9f5;
            }
          }
          html[data-theme="dark"] {
            color-scheme: dark;
            --rss-bg: #11151b;
            --rss-ink: #f1eee7;
            --rss-copy: #bac2cc;
            --rss-muted: #8f99a6;
            --rss-accent: #8db7df;
            --rss-accent-strong: #c0dbf2;
            --rss-rule: #303741;
            --rss-sep: #68727e;
            --rss-focus: #b9d9f5;
          }
          html[data-theme="light"] { color-scheme: light; }
          * { box-sizing: border-box; }
          body { min-width: 320px; margin: 0; background: var(--rss-bg); color: var(--rss-ink); }
          a { color: var(--rss-accent); text-underline-offset: .22em; }
          a:hover { color: var(--rss-accent-strong); }
          a:focus-visible, button:focus-visible { outline: 2px solid var(--rss-focus); outline-offset: 4px; border-radius: .15rem; }
          .shell { width: min(100% - 2rem, 56rem); margin: 0 auto; padding: 2.5rem 0 5rem; }
          .topbar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
          .brand { display: inline-flex; min-height: 44px; align-items: center; color: var(--rss-ink); font: 600 1rem/1.4 Georgia, serif; text-decoration: none; }
          .theme-toggle { display: inline-flex; min-width: 44px; min-height: 44px; align-items: center; justify-content: center; padding: 0; border: 0; background: transparent; color: var(--rss-copy); cursor: pointer; }
          .theme-toggle:hover { color: var(--rss-accent-strong); }
          .theme-icon-sun { display: none; }
          .theme-icon-moon { display: block; }
          @media (prefers-color-scheme: dark) {
            :root:not([data-theme="light"]) .theme-icon-sun { display: block; }
            :root:not([data-theme="light"]) .theme-icon-moon { display: none; }
          }
          html[data-theme="dark"] .theme-icon-sun { display: block; }
          html[data-theme="dark"] .theme-icon-moon { display: none; }
          .eyebrow { margin: 3.5rem 0 .75rem; color: var(--rss-accent); font-size: .85rem; font-weight: 700; }
          h1 { max-width: 44rem; margin: 0; font: 500 clamp(2.4rem, 8vw, 4.75rem)/1.04 Georgia, serif; letter-spacing: -.035em; }
          .intro { max-width: 42rem; color: var(--rss-copy); font-size: 1.1rem; line-height: 1.75; }
          .feed-url { display: block; width: fit-content; max-width: 100%; overflow-wrap: anywhere; margin: 1.5rem 0 0; color: var(--rss-copy); font: .85rem/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
          .archive { margin-top: 3rem; border-top: 1px solid var(--rss-rule); }
          article { padding: 2.25rem 0; border-bottom: 1px solid var(--rss-rule); }
          article h2 { margin: 0; font: 500 clamp(1.6rem, 5vw, 2.35rem)/1.2 Georgia, serif; }
          article p { max-width: 44rem; margin: .85rem 0 0; color: var(--rss-copy); font-size: 1rem; line-height: 1.7; }
          .meta { color: var(--rss-muted); font-size: .78rem; line-height: 1.5; }
          .topics { margin-top: 1rem; color: var(--rss-accent); font-size: .78rem; line-height: 1.5; }
          .topics span + span::before { margin: 0 .5rem; color: var(--rss-sep); content: "·"; }
          .article-link { display: inline-flex; min-height: 44px; align-items: center; margin-top: .5rem; font-weight: 700; }
          footer { margin-top: 3rem; color: var(--rss-muted); font-size: .85rem; }
        </style>
      </head>
      <body>
        <main class="shell">
          <header class="topbar">
            <a class="brand" href="https://ricomanifesto.com/">Rico Manifesto</a>
            <button id="theme-toggle" type="button" aria-label="Toggle color theme" class="theme-toggle">
              <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
              <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </button>
          </header>
          <p class="eyebrow">RSS feed</p>
          <h1>Subscribe to <xsl:value-of select="rss/channel/title" /></h1>
          <p class="intro">
            This is the first-party feed for Michael Rico's writing. Add the address below to any RSS reader, or browse the latest articles here.
          </p>
          <code class="feed-url">https://ricomanifesto.com/rss.xml</code>

          <section class="archive" aria-label="Latest articles">
            <xsl:for-each select="rss/channel/item">
              <article>
                <p class="meta"><xsl:value-of select="substring(pubDate, 6, 11)" /></p>
                <h2><a href="{link}"><xsl:value-of select="title" /></a></h2>
                <p><xsl:value-of select="description" /></p>
                <p class="topics">
                  <xsl:for-each select="category">
                    <span><xsl:value-of select="." /></span>
                  </xsl:for-each>
                </p>
                <a class="article-link" href="{link}">Read the article →</a>
              </article>
            </xsl:for-each>
          </section>

          <footer>RSS stays portable: feed readers use the XML; browsers use this presentation layer.</footer>
        </main>
        <script>
          (function () {
            var btn = document.getElementById("theme-toggle");
            if (!btn) return;
            btn.addEventListener("click", function () {
              var current = document.documentElement.dataset.theme
                || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
              var next = current === "dark" ? "light" : "dark";
              document.documentElement.dataset.theme = next;
              try { localStorage.setItem("theme", next); } catch (e) {}
            });
          })();
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
