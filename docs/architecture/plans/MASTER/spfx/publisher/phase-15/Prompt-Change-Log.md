# Prompt change log — Wave 02 structural rebuild revision

## What changed
- Reframed the entire wave to match the **Wave 01 structural rebuild posture**.
- Split the original media prompt into:
  - single-image acquisition rebuild
  - gallery/supporting-media acquisition rebuild
- Split the original autosave prompt into:
  - local draft resilience / autosave / recovery contract
  - navigation-loss protection / save-state trust loop
- Rewrote the story-editor prompt so it assumes TipTap already exists and focuses on editorial-grade closure.
- Rewrote the preview/guidance prompt so it assumes preview and readiness diagnostics already exist and focuses on trust-bridge closure.
- Expanded hardening into explicit accessibility / host-fit / instance-safety work.
- Added a final regression-and-evidence prompt.

## Why
The earlier package was directionally correct but too incremental for the current repo state. The live implementation already contains partial closure work, so the revised prompts now target the real remaining structural weaknesses rather than restating already-landed foundations.
