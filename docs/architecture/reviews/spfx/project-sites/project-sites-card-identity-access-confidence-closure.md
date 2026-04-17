# Project Sites Card Identity and Access Confidence — Closure

## Prompt-02 outcome
Project Sites cards now provide stronger identity discrimination and explicit, non-deceptive launch-confidence cues for faster and safer project selection.

## Final card hierarchy
- Header: project number and stage badge remain prominent for quick scan.
- Primary title: project name remains the dominant identity anchor.
- Identity chips: year, office division, and department are surfaced directly under title.
- Launch-confidence statement: explicit per-state message clarifies what is and is not guaranteed.
- Metadata list: client, location, and type remain available without turning cards into dense admin sheets.

## Launch/access confidence treatment
- Live site: "Site link is available" plus explicit permissions dependency wording.
- Archived site: same non-speculative permissions dependency wording.
- Provisioning: explicitly not launchable yet.
- Attention-needed: explicitly blocked pending data correction.

This avoids overclaiming access while preserving primary launch clarity.

## Validation evidence
- Updated `ProjectSiteCard` tests for:
  - identity chip rendering and launch-confidence messaging,
  - structured location preference (city/state over legacy location text),
  - provisioning blocked-confidence message,
  - compact-mode card launch affordance continuity.
