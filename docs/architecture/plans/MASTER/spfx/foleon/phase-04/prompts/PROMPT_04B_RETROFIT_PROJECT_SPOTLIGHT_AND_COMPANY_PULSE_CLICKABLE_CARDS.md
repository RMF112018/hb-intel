# Prompt 04B — Retrofit Project Spotlight and Company Pulse to Clickable Article Cards

You are working in a fresh ChatGPT / local code-agent session against the live `RMF112018/hb-intel` repository.

Use the live `main` branch as repo truth. Do not rely on memory, summaries, or prior assumptions when source files are available. Do not re-read files that are still within your current context or memory unless verification is required.

Follow existing repo governance, UI doctrine, package-version authority, SPFx build/package proof standards, no-assumption rules, and the repo’s established lockstep versioning pattern.

Do not implement unrelated changes. Do not change Safety Field Excellence, HB Kudos, People & Culture, backend sync, SharePoint list schemas, Foleon routes, accepted-origin policy, Foleon iframe governance, homepage row placement, shell pairing rules, or the Prompt 01 edge-to-window contract unless this prompt explicitly instructs you to do so.


## Controlling Baseline Documents

Before making changes, inspect the latest repo versions of:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/00_BASELINE_AUDIT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/01_EDGE_CONTRACT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/02_VIEW_MODEL_AND_REGISTRY_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/03_PROJECT_SPOTLIGHT_LAYOUT_REPORT.md
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04_COMPANY_PULSE_LAYOUT_REPORT.md
```

Use those documents as controlling baseline. Do not reopen the shell edge contract, shared reader registry, Project Spotlight layout, or Company Pulse layout unless implementation evidence proves a defect.

Current expected state:

- HB Homepage / launcher lockstep is at `1.1.84.0`.
- Project Spotlight has a lane-owned layout with `data-foleon-layout="project-spotlight-feature"`.
- Company Pulse has a lane-owned layout with `data-foleon-layout="company-pulse-briefing"`.
- Leadership Message still delegates to `FoleonReaderCompatibilityLayout` pending Prompt 05.
- Prompt 01 edge-to-window behavior remains real but dormant by default.
- Project Spotlight and Company Pulse currently still include or support inline iframe-frame behavior from the shared reader/module pipeline.


---

## Additional Required Baseline

Before making changes, inspect the latest repo version of:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04A_FULL_WINDOW_VIEWER_CONTRACT_REPORT.md
```

Use it as controlling baseline for the full-window viewer contract.

---

## Objective

Update the already-migrated Project Spotlight and Company Pulse lane-owned layouts so their article/card surfaces are directly interactive.

When a user clicks an eligible article/card, the selected Foleon document must open in the shared full-window viewer added by Prompt 04A.

This prompt applies the new viewer interaction model to the two completed lanes before Prompt 05 implements Leadership Message.

---

## Product Intent

The homepage reader lanes should not require users to read Foleon content inside a small embedded homepage card.

Instead:

- homepage cards summarize and tease the content;
- clicking a card opens the full-window viewer;
- users get an immersive reading/viewing experience;
- card behavior is consistent across lanes.

---

## Required Repo-Truth First Step

Inspect, at minimum:

```text
packages/foleon-reader/src/readers/FoleonReaderViewModel.ts
packages/foleon-reader/src/readers/FoleonReaderModule.tsx
packages/foleon-reader/src/components/FoleonFullWindowViewer.tsx
packages/foleon-reader/src/readers/layouts/ProjectSpotlightReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/CompanyPulseReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/LeadershipMessageReaderLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderCompatibilityLayout.tsx
packages/foleon-reader/src/readers/layouts/FoleonReaderLayouts.module.css
packages/foleon-reader/src/readers/__tests__/**
```

Do not rework Prompt 04A unless implementation evidence proves a defect.

---

## Required Behavior — Project Spotlight

Project Spotlight should expose a primary interactive article/feature card.

Expected user experience:

- The visual project feature surface/card is keyboard and pointer interactive when a valid ready-state Foleon target exists.
- Clicking the card opens the full-window viewer with the active Project Spotlight Foleon document.
- Pressing Enter/Space on the card or its primary action opens the viewer.
- If no valid target exists, the card is not misleadingly clickable and shows an honest disabled/unavailable state.
- Preview state remains clearly labeled and must not pretend to open a real Foleon document.

Acceptable card targets:

- media banner;
- primary feature card;
- “View feature” / “Open reader” action.

The entire lane surface does **not** need to be clickable. Make the content card / feature card clickable, not every whitespace area.

---

## Required Behavior — Company Pulse

Company Pulse should expose its latest-update lead item as the primary interactive article card.

Expected user experience:

- The lead update card is keyboard and pointer interactive when a valid ready-state Foleon target exists.
- Clicking the lead card opens the full-window viewer with the active Company Pulse Foleon document.
- Preview digest cards may be sample/disabled or open preview-only non-live viewer shells, but they must not mount a live iframe.
- Ready-state secondary digest remains empty unless a real multi-record source exists.
- The “Open full archive” CTA remains honest. It should not claim to open multiple local cards if only an archive path is available.

Do not fabricate secondary ready-state cards.

---

## Required View Model Refinement

If Prompt 04A did not fully populate cards, update adapters so:

- Project Spotlight ready state produces `primaryArticle` from the active record.
- Company Pulse ready state produces `primaryArticle` or a lead article card from the active record.
- Preview state produces clearly labeled sample cards.
- No valid URL -> disabled target with reason.
- Secondary ready-state cards remain empty unless a real source exists.

Use repo-convention field names, but the semantics above are required.

---

## Required Layout Changes

Update:

```text
ProjectSpotlightReaderLayout.tsx
CompanyPulseReaderLayout.tsx
FoleonReaderLayouts.module.css
```

The card surfaces must use semantic interactive elements:

- use `<button>` when opening the in-page full-window viewer;
- use `<a>` only when navigating to an external URL/new route;
- do not use `div onClick` without role/keyboard handling.

Recommended attributes:

```text
data-foleon-article-card
data-foleon-article-lane="projectSpotlight|companyPulse"
data-foleon-viewer-target-id="<target id>"
data-foleon-article-state="enabled|disabled|preview"
```

Use exact names that fit repo conventions, but expose stable testable markers.

---

## Inline Iframe Posture

The full-window viewer is now the preferred reading surface.

Do not remove existing iframe governance.

However, for Project Spotlight and Company Pulse lane layouts:

- the article/card click should be primary;
- inline iframe frame should be removed, hidden by default, or demoted to a fallback only if repo compatibility requires it;
- mobile gate should become a viewer-launch gate rather than an inline iframe gate where possible;
- if keeping inline iframe temporarily, document why and ensure tests prove the full-window viewer is the primary click path.

Avoid loading both an inline iframe and a full-window iframe for the same ready record by default unless existing lifecycle constraints force it.

---

## Accessibility Requirements

- Clickable cards must be keyboard accessible.
- Use visible focus states.
- Provide aria labels where card text does not fully describe the action.
- Disabled/unavailable cards must explain why the document cannot be opened.
- Preserve heading hierarchy.
- Preserve preview honesty.
- Full-window viewer close/back controls must remain reachable after card launch.

---

## Required Tests

Add/update tests proving:

1. Project Spotlight primary article card exists.
2. Project Spotlight card opens the full-window viewer on click.
3. Project Spotlight card opens the full-window viewer via keyboard.
4. Company Pulse lead article card exists.
5. Company Pulse lead card opens the full-window viewer on click.
6. Company Pulse lead card opens the full-window viewer via keyboard.
7. Preview sample cards do not mount a live iframe.
8. Ready-state secondary Company Pulse cards are not fabricated.
9. Disabled card state appears when no valid target URL exists.
10. Leadership Message remains compatibility layout and is not redesigned.
11. Existing lane layout markers remain:
    - `project-spotlight-feature`
    - `company-pulse-briefing`
12. Prompt 01 edge contract remains dormant and unchanged.

Avoid brittle exact global marker counts.

---

## Required Documentation Deliverable

Create:

```text
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04B_CLICKABLE_ARTICLE_CARDS_REPORT.md
```

Required sections:

```md
# Clickable Foleon Article Cards Report

## Scope

## Baseline Inputs

## Source Files Changed

## Project Spotlight Interaction

## Company Pulse Interaction

## Viewer Target Mapping

## Inline Iframe Posture

## Preview Behavior

## Ready Behavior

## Accessibility

## Tests Added / Updated

## Validation Commands and Results

## Version / Package Impact

## Known Follow-Up Work
- Prompt 05 Leadership Message layout should use this viewer contract

## Risks / Mitigations

## Rollback Plan
```

---

## Versioning / Package Authority

This prompt changes Project Spotlight / Company Pulse interaction behavior and likely changes deployable output.

Expected version direction:

```text
1.1.85.0 -> 1.1.86.0
```

Do not assume. Inspect repo authority and follow the lockstep versioning pattern.

---

## Validation Plan

Expected minimum:

```text
pnpm --filter @hbc/foleon-reader test
pnpm --filter @hbc/foleon-reader check-types
pnpm --filter @hbc/foleon-reader lint
pnpm --filter @hbc/spfx-hb-webparts exec vitest run --config vitest.config.ts src/webparts/hbHomepage
```

Document exact pass/fail results and known unrelated failures.

---

## Hard Do-Nots

Do not:

- implement Leadership Message redesign;
- fabricate secondary ready-state Company Pulse cards;
- weaken iframe governance;
- change backend sync;
- change SharePoint list schemas;
- activate global edge-to-window behavior;
- change shell row placement;
- make the entire lane surface a click trap;
- add inaccessible click-only divs;
- remove preview labels;
- claim hosted proof unless actually run.

---

## Final Response Required From Agent

When complete, respond with:

```text
Summary:
<one-line summary>

Description:
<commit-style description>

Files changed:
<list>

Validation:
<commands run and pass/fail result>

Version/package impact:
<state whether version/package changed and why>

Report:
docs/architecture/plans/MASTER/spfx/homepage/foleon-reader-composition/v2/04B_CLICKABLE_ARTICLE_CARDS_REPORT.md

Follow-up:
Prompt 04C should validate the full-window viewer and clickable-card interaction before Prompt 05 begins.
```
