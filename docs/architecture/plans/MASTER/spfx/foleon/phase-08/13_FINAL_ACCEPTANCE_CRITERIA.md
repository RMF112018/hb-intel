# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Final Acceptance Criteria

## Hard-stop failures

Do not accept the implementation if any of the following are true:

- `Leadership Message reader` appears as visible production/preview heading.
- `Sample executive byline`, `Sample role`, `Sample pull quote`, `Sample audience`, or `Sample message body` appears in the rendered reader.
- `Executive byline not provided.` appears in production/ready state.
- `Cadence` or `Archive group` appears as employee-facing metadata.
- The reader renders a fake article body instead of a teaser/access point.
- There is no visible CTA in live state.
- Blocked/unavailable state looks broken or unexplained.
- External-open-only state appears as an error.
- Full-window viewer behavior, origin policy, or focus return is weakened.
- Project Spotlight or Company Pulse regress.
- Hosted package proof cannot show source truth made it into the `.sppkg`.

## Minimum acceptance

- Clear employee-facing headline.
- One concise summary/teaser.
- Visible CTA.
- No fake or internal metadata.
- Accessible launch and disabled states.
- Stable desktop/mobile layout.
- Tests pass.

## Homepage-grade acceptance

- Reads as a premium HB Central access point.
- Works in paired row and single-column homepage contexts.
- Preview, empty, blocked, external-only, and live states are all professional.
- CTA and status remain understandable at 100%, 75%, mobile/narrow, and short-height.
- Package proof and hosted screenshots are captured.

## Flagship target

- Calm, credible, executive-grade editorial composition.
- Distinct from Company Pulse and Project Spotlight.
- Supports rich-media/video messages without overbuilding text.
- Data model supports real executive/source metadata when available.
- Equivalent quality discipline to the homepage benchmark standard without copying hbKudos.

## Recommended scorecard target

Using the homepage UI/UX scorecard:

- minimum: 40/56 with no hard-stop failures;
- target: 48+/56;
- no category below 2;
- purpose-fit, hierarchy, accessibility, and host-runtime resilience should score 3 or 4.
