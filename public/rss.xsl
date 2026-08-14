<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title><xsl:value-of select="rss/channel/title" /> | RSS</title>
        <style>
          :root { color-scheme: dark; font-family: "Open Sans", system-ui, sans-serif; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #11151b; color: #f1eee7; }
          a { color: #8db7df; text-underline-offset: .22em; }
          a:hover { color: #c0dbf2; }
          .shell { width: min(100% - 2rem, 56rem); margin: 0 auto; padding: 4rem 0 5rem; }
          .brand { color: #f1eee7; font: 600 1rem/1.4 Georgia, serif; text-decoration: none; }
          .eyebrow { margin: 4rem 0 .75rem; color: #8db7df; font-size: .85rem; font-weight: 700; }
          h1 { max-width: 44rem; margin: 0; font: 500 clamp(2.4rem, 8vw, 4.75rem)/1.04 Georgia, serif; letter-spacing: -.035em; }
          .intro { max-width: 42rem; color: #bac2cc; font-size: 1.1rem; line-height: 1.75; }
          .feed-url { display: block; width: fit-content; max-width: 100%; overflow-wrap: anywhere; margin: 1.5rem 0 0; color: #bac2cc; font: .85rem/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
          .archive { margin-top: 3rem; border-top: 1px solid #303741; }
          article { padding: 2.25rem 0; border-bottom: 1px solid #303741; }
          article h2 { margin: 0; font: 500 clamp(1.6rem, 5vw, 2.35rem)/1.2 Georgia, serif; }
          article p { max-width: 44rem; margin: .85rem 0 0; color: #bac2cc; font-size: 1rem; line-height: 1.7; }
          .meta { color: #8f99a6; font-size: .78rem; line-height: 1.5; }
          .topics { margin-top: 1rem; color: #8db7df; font-size: .78rem; line-height: 1.5; }
          .topics span + span::before { margin: 0 .5rem; color: #68727e; content: "·"; }
          .article-link { display: inline-block; margin-top: 1.1rem; font-weight: 700; }
          footer { margin-top: 3rem; color: #8f99a6; font-size: .85rem; }
        </style>
      </head>
      <body>
        <main class="shell">
          <a class="brand" href="https://ricomanifesto.com/">Rico Manifesto</a>
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
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
