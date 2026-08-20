# Site Launch Runbook

The site (PR #6) is built and verified, but has never deployed: GitHub Pages
cannot be enabled on a private free-plan repo. Launch = making the repo
public + enabling Pages. Both are deliberate, irreversible-ish decisions —
the repo's full history goes public. Order matters.

## Pre-flight (once, before the flip)

- [ ] Merge PR #6 if not already merged.
- [ ] Re-read the public-history audit (final review, 2026-08-20): no secrets,
      no real emails, `.superpowers/` never tracked. Two deliberate exposures
      to be comfortable with: `docs/superpowers/**` (plans/specs go public)
      and the registry's on-the-record vendor critiques (Forrester, Anthropic
      trends report, the Spec Kit figure). Both are the repo's posture; just
      confirm it consciously.
- [ ] Absolute `/Users/jazz/...` paths appear in the two plan docs. Cosmetic;
      tidy or accept.

## Launch sequence

1. Make the repo public (Settings → General → Danger Zone).
2. Enable Pages: Settings → Pages → Source: **GitHub Actions**. Do this
   BEFORE the next push to main.
3. Delete `continue-on-error: true` (and its comment block) from the deploy
   job in `.github/workflows/deploy.yml`; commit via PR.
4. That merge triggers the first real deploy — the push path has never run.
   Watch it. Then verify live:
   - `/ai-native-sdlc/` and one position page
   - `/ai-native-sdlc/sources/#dora-2025` (deep link highlights the row)
   - `/ai-native-sdlc/llms.txt` and one raw `.md` (renders, not force-download)
   - `/ai-native-sdlc/nope` → branded 404
5. Add required status checks on `main`: `site-build` and `linkChecker`
   (branch protection or ruleset). Until this, "failed build blocks merge"
   is aspiration, not mechanism.

## Post-launch

- Weekly lychee cron now files public issues on link rot — expected.
- Optional, skipped deliberately: sitemap.xml (11 pages, llms.txt covers
  agents), robots.txt (project pages can't serve one; absence = allow-all).
- Consider og:image later if link sharing matters.
