# Prompt-07 — Phase 5 Docs Alignment and Local Guidance

## Objective

Align the repo documentation and local app guidance with the new Phase 5 operator-console shell.

This prompt should make the repo readable for the next implementation waves.

## Important execution rules

- Do not re-read files still in active context unless needed.
- Preserve good existing documentation where it is already right.
- Update only what is necessary to remove contradiction or major omission.

## Inputs

Use:
- all implemented Phase 5 artifacts from Prompts 01–06
- `apps/admin/README.md`
- relevant Admin docs under `docs/architecture/plans/MASTER/spfx/admin/`
- directly affected reference docs
- `docs/architecture/blueprint/current-state-map.md` only if a small present-truth correction is justified

## Required work

### A. Create or update Phase 5 docs
Ensure the repo contains, at minimum:
- Phase 5 operator-console baseline
- route/lane taxonomy
- page ownership map

### B. Update local app guidance
Update `apps/admin/README.md` so it explains:
- current lane model
- current main routes
- current landing posture
- which lanes are real vs scaffolded
- how the existing preserved pages map into the new IA

### C. Update directly affected reference docs
Only update docs that are truly touched by the new shell/route model.
Examples may include:
- route or surface references
- cross-app navigation docs
- Admin surface docs

### D. Present-truth update only if justified
If `current-state-map.md` materially misstates the current Admin app shell after Phase 5, make the smallest present-truth update required.
If not needed, do not touch it.

## Validation

Before finishing:
- verify all links and paths are correct,
- verify docs do not claim later-phase functionality already exists,
- verify app README and canonical Phase 5 docs agree,
- verify any `current-state-map.md` edits remain strictly present truth.

## Completion condition

Stop when the docs and local guidance consistently describe the Phase 5 shell.
Do not produce final exit reconciliation here.
