---
title: The Deploy Wasn’t the Proof
description: Why a successful deploy became only one checkpoint between a source change and what a visitor can actually see.
publishedAt: 2026-08-13
topics:
  - Delivery systems
  - Verification
  - Cloudflare
image:
  path: /images/writing/the-deploy-wasnt-the-proof.png
  alt: A source commit, deployment control plane, and public edge shown as three separate verification checkpoints.
featured: true
draft: false
---

I removed a blinking cursor from this site. It was an intentionally small change: delete the character, delete the animation, and update the check that covered it. [The diff](https://github.com/ricomanifesto/rico/commit/e45e6ee361acfa24cbad65cc3c19885cb9ce8e50) was clean. The local suite passed. The deployment completed.

Then I opened the public site and the cursor was still there.

Nothing had failed in the way a dashboard usually defines failure. The build was green, the provider had accepted the artifact, and the hostname returned a page. Every signal was technically true, but together they supported the wrong conclusion: that the change had shipped.

That tiny release clarified a distinction I now try to keep explicit. There is source proof: the intended change exists in the commit. There is provider proof: the platform built and accepted that commit. And there is edge proof: a fresh request to the public hostname returns the intended behavior.

Those are three different claims. An HTTP 200 only proves that something answered. A successful deployment only proves that a control plane completed its work. Neither tells me, by itself, what a visitor can see.

The useful release check was behavioral. Request the real hostname without relying on an old browser session, identify the asset being served, and verify that the removed behavior is actually absent. If the public edge and the source commit disagree, the release is not done, no matter how many upstream checks are green.

A portfolio is a low-stakes place to learn this, which makes it a good forcing function. The system is small enough that I should be able to trace one visual decision from source to deployment to the page a stranger receives. If I cannot do that here, I should not trust myself to infer it inside a more complicated delivery pipeline.

The question I ask now is no longer “Did it deploy?” It is “What can a stranger observe right now?”

That is the boundary where a release becomes real.
