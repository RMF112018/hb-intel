# Prompt 07 — Final Audit and Closure for Foleon Reader Composition, Edge Contract, and Full-Window Viewer

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repo.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless you need verification.

Follow all existing repo governance, UI doctrine, package-version authority, SPFx build/package proof standards, and the repo’s existing no-assumption / repo-truth posture.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon accepted-origin / iframe governance, Foleon routes, homepage row placement, shell pairing rules, or the Prompt 01 edge-to-window contract unless this prompt explicitly instructs you to do so.

---

## Controlling Baseline Documents

Before making changes, inspect the latest repo versions of all relevant v2 reports:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04_COMPANY_PULSE_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/05_LEADERSHIP_MESSAGE_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/06_TEST_PACKAGE_HOSTED_PROOF.md
```

Also inspect the full-window viewer reports if present:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04B_CLICKABLE_ARTICLE_CARDS_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04C_FULL_WINDOW_VIEWER_TESTING_PROOF.md
```

Use equivalent repo-truth documents if actual file names differ.

---

## Objective

Conduct a final closure audit of the implemented Foleon reader composition redesign, edge-to-window shell contract, and full-window Foleon viewer interaction model.

The final closure must answer whether the work fully satisfies the updated product direction:

> Each Foleon article/message card on the homepage should allow direct user interaction. Clicking a valid ready-state card opens the selected Foleon document in a shared full-window, immersive viewer.

This prompt is primarily an audit/closure pass. Do not implement new product behavior unless a small documentation/test correction is required and separately justified.

---

## Required Repo-Truth First Step

Inspect:

```text
packages/foleon-reader/src/readers/**
packages/foleon-reader/src/readers/layouts/**
packages/foleon-reader/src/readers/__tests__/**
packages/foleon-reader/src/components/**
packages/foleon-reader/src/types/**
packages/foleon-reader/src/viewer/**

apps/hb-webparts/src/webparts/hbHomepage/**
apps/hb-webparts/src/webparts/hbHomepage/__tests__/**
apps/hb-webparts/src/webparts/hbHomepage/shell/**
apps/hb-homepage/config/package-solution.json
apps/hb-homepage/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json
packages/homepage-launcher/src/constants.ts
dist/sppkg/**
```

Use actual paths and generated artifact locations from repo truth.

---

## Required Closure Checks

Verify and document:

1. Repo-truth implementation matches the approved v2 architecture.
2. Project Spotlight, Company Pulse, and Leadership Message each have distinct composition frames.
3. Preview and production share each lane’s composition frame.
4. Preview remains clearly labeled and does not launch live Foleon documents.
5. Ready-state valid article/message cards launch the shared full-window viewer.
6. Viewer launch behavior is reusable across all three lanes.
7. Full-window viewer uses the existing governed iframe/origin/route path.
8. Viewer close/back control works and focus return is handled or documented.
9. ESC close works where implemented.
10. Mobile-safe viewer behavior is implemented or clearly documented.
11. Foleon iframe governance remains unchanged.
12. SharePoint list schemas remain unchanged.
13. Backend sync behavior remains unchanged.
14. Edge bleed is based on shell visual side, not DOM order.
15. Company Pulse correctly resolves right visual side in right-dominant Row 2.
16. Stacked/mobile layouts resolve both-side edge bleed without horizontal overflow in proof.
17. Default edge-to-window policy remains dormant unless intentionally opted in and proven.
18. Hero edge-to-window behavior is either implemented with proof or documented as not safely implemented in this pass.
19. Tests and package proof are complete.
20. Hosted proof is complete or explicitly marked not run.
21. Safety, HB Kudos, and People & Culture are unaffected.
22. Version/package lockstep is correct.
23. Known pre-existing failures are clearly separated from this work.
24. No deprecated cookie-cutter markers remain in active migrated lane layouts unless intentionally retained for a documented compatibility reason.

---

## Required Output

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/07_CLOSURE_REPORT.md
```

Use this exact final format:

```md
# Closure Report

## Summary

## Files Changed

## Repo-Truth Findings

## Implemented Architecture

## Full-Window Viewer Result

## Project Spotlight Result

## Company Pulse Result

## Leadership Message Result

## Preview Behavior

## Ready-State Interaction Behavior

## Iframe / Origin / Route Governance

## Edge-to-Window Result

## Hero Result

## Accessibility Result

## Tests Run

## Package Proof

## Hosted Proof

## Version / Package Lockstep

## Known Gaps

## Rollback Plan

## Commit Summary

## Commit Description
```

---

## Required Evidence Standards

### Repo-truth evidence

Use exact file paths and, where practical, line references in the report.

### Test evidence

List every command run, including:

- command;
- pass/fail result;
- failing test names if any;
- whether failure is new or pre-existing.

### Package proof evidence

If package proof was run, include:

- artifact path;
- artifact hash;
- strings/markers proven present;
- package version;
- manifest version;
- feature version.

### Hosted proof evidence

If hosted proof was run, include:

- hosted page URL or redacted site context as appropriate;
- browser/viewport;
- proof snippets used;
- results.

If hosted proof was not run, state:

```text
Hosted proof was not run in this pass.
```

and include a precise checklist for whoever will run it.

### Viewer proof evidence

Include proof that valid ready-state cards open the shared viewer for:

- Project Spotlight;
- Company Pulse;
- Leadership Message.

If any lane cannot launch due to missing configured live Foleon content, state whether the code path is proven by tests and whether hosted live proof is pending.

---

## Closure Decision

The final report must provide one of these statuses:

```text
Closed — ready for hosted rollout
Closed with hosted proof pending
Closed with known non-blocking gaps
Not closed — blocking defects remain
```

Do not mark “Closed — ready for hosted rollout” unless:

- tests passed or failures are unrelated/pre-existing and documented;
- package proof passed;
- hosted proof passed;
- viewer interaction proof passed;
- no horizontal overflow proof passed;
- version lockstep is correct.

---

## Validation Commands

Use repo-approved scripts after inspecting `package.json`.

Minimum expected validation if not already captured in Prompt 06:

```text
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
pnpm --filter @hbc/spfx-hb-webparts check-types
```

If Prompt 06 already captured current results and no source changed in Prompt 07, cite those results and do not rerun unless repo policy requires it.

---

## Versioning / Package Authority

If Prompt 07 is documentation-only, do not bump versions.

If source changes are required, follow repo version authority and update lockstep versions.

Do not invent versioning rules.

---

## Commit Summary / Description Template

Use this if Prompt 07 produces source or closure-doc changes:

```text
Summary:
HB Homepage Foleon reader composition v2: final closure for lane layouts, edge contract, and full-window viewer

Description:
Completes the final closure audit for the Foleon reader composition v2 workstream. Verifies Project Spotlight, Company Pulse, and Leadership Message lane-owned layouts; preview/ready parity; shared full-window viewer card interaction; iframe/origin governance; shell visual-side edge contract; package proof; and hosted validation status. Documents known gaps, rollback plan, and final rollout readiness in 07_CLOSURE_REPORT.md.
```

---

## Hard Do-Nots

Do not:

- add new product behavior during closure unless a small fix is required and documented;
- fabricate hosted proof;
- fabricate package proof;
- weaken iframe/origin governance;
- change SharePoint list schemas;
- change backend sync;
- hide overflow defects with global CSS;
- redesign lane layouts;
- change Safety, HB Kudos, or People & Culture;
- mark closure complete if viewer interaction is not implemented or not proven.

---

## Final Response Required From Agent

When complete, respond with:

```text
Summary:
<one-line closure summary>

Description:
<commit-style closure description>

Files changed:
<list>

Validation:
<commands run and pass/fail result, or reference Prompt 06 proof if unchanged>

Package proof:
<result>

Hosted proof:
<run/not run and result>

Closure status:
<one of the required closure statuses>

Report:
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/07_CLOSURE_REPORT.md
```
