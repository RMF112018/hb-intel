# Phase 3 Wave 2 — Repo Truth and Update Summary

## Current Understanding

This package is based on the repo-truth and user decisions established before Wave 2 implementation begins.

### Confirmed Current Direction

- PCC Phase 3 Wave 1 created the shared PCC model foundation under `packages/models/src/pcc/`.
- Wave 1 exposes read-model contracts for surfaces, work centers, project profile, personas, capabilities, priority actions, workflow modules, launch links, Document Control sources, Site Health summaries, repair requests, settings scopes, feature/module flags, fixtures, and guard utilities.
- Wave 2 is the first serious **UI/UX shell-frame** wave for PCC.
- Wave 2 should create a dedicated PCC SPFx app target, subject to fresh repo-truth verification in Prompt 01.
- The saved basis-of-design image lives at:

```text
docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png
```

### Homepage Layout Lesson Learned

The previously developed `hb-intel-homepage` is a full-page SPFx composition with embedded apps. It uses a row-and-column paired layout pattern that can force lane occupants to share row height or leave unused white space.

PCC must not inherit that limitation. PCC is an operating dashboard, not a curated homepage lane. Its cards and module previews must be allowed to use unique widths/heights and tight placement.

### Updated Product Decision

PCC shall use a controlled **flexible bento / masonry-style dashboard layout** for Project Home and related preview cards. This is a foundational UI/UX decision for Wave 2 and must be reflected in shell layout, card contracts, tests, and documentation.

## Must-Verify in Prompt 01

The implementation agent must verify these repo facts before writing code:

1. `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-1/Wave_1_Closeout.md` exists on `main` and confirms Wave 1 closure.
2. `packages/models/src/pcc/index.ts` exports the Wave 1 shared surface.
3. `PCC_MVP_SURFACE_IDS` and `PCC_MVP_SURFACES` exist and contain the eight MVP surfaces.
4. `PCC_FIXTURES` and supporting `SAMPLE_*` constants exist for preview-mode shell work.
5. The basis-of-design image exists at `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`.
6. `apps/project-control-center/` does not already exist, or if it does, its current contents are audited before any change.
7. Existing SPFx app patterns are checked, especially `apps/project-sites/` and `packages/spfx/src/webparts/projectSites/`.
8. No implementation prompt should re-read files that remain in its current context unless the file may have changed or the prompt specifically asks for a freshness check.

## Update Summary Since Original Package

This updated package adds:

- full decision closure register;
- formal UI/UX basis-of-design document;
- desktop/tablet/mobile wireframe;
- flexible bento/masonry layout contract;
- explicit instruction not to copy homepage paired-row layout;
- basis image repo-path reference;
- revised prompts reflecting UI/UX scope;
- stricter no-runtime and no-live-integration guardrails;
- tests and documentation expectations for the layout decision.
