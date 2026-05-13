# Prompt 12 — My Projects Home-Surface Flagship Composition

## Objective

Add the new **My Projects** module to the My Work home surface as a full-width flagship launch surface. This prompt establishes the component architecture, surface placement, header composition, summary metrics, and high-level state container. Detailed row interactions and the full state matrix are completed in Prompt 13.

The UI must clearly exceed the existing Project Sites product posture and align with the repo’s flagship SPFx quality doctrine.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 11 closeout
- Prompt 08 fixture contract summary
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`
- `supporting/03_Prompt_Package_Architecture.md`

---

## Repo-truth references to inspect

### My Work home/surface composition
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/layout/MyWorkCard.tsx`
- `apps/my-dashboard/src/layout/MyWorkCard.module.css`
- `apps/my-dashboard/src/layout/myWorkFootprints.ts`
- `apps/my-dashboard/src/layout/useMyWorkContainerBreakpoint.ts`

### Existing module composition precedents
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueHomeCard.tsx`
- `apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueStateCard.tsx`
- `apps/my-dashboard/src/surfaces/home/WorkSummaryCard.tsx`
- `apps/my-dashboard/src/surfaces/home/SourceReadinessCard.tsx`

### UI doctrine
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`

---

## Implementation scope

### 1. Create My Projects module component family

Use a repo-native module folder, likely:

```text
apps/my-dashboard/src/modules/myProjects/
```

or the exact equivalent structure that matches existing modules.

Expected component families may include:

- `MyProjectsHomeSurface.tsx` or `MyProjectsHomeCard.tsx`
- `MyProjectsHeader.tsx`
- `MyProjectsSummaryMetrics.tsx`
- `MyProjectsReadinessBanner.tsx`
- module-specific styles/tests.

Do not prematurely split into too many files if the app convention favors a tighter structure, but the implementation must remain readable and testable.

### 2. Connect to `getMyProjectLinks()`

Use the existing My Dashboard client/factory consumption pattern to fetch the new read model.

The component must support at least:

- loading;
- available envelope;
- backend-unavailable fallback envelope;
- principal unresolved;
- partial/source unavailable state container.

Prompt 13 fills in the full row-level state matrix.

### 3. Place the module on the home surface

Integrate the module into:

```text
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
```

as a **full-width flagship surface** within the bento/grid choreography.

Closed composition decision:
- My Projects is a **My Work home-surface flagship supporting module**.
- It is not a focused-module route in MVP.
- It is not a Project Sites clone.

### 4. Use full-row footprint

Use the existing footprint/span system so the My Projects surface occupies full available width:

- 12 columns in 12-column modes;
- 10 in standardLaptop;
- 8 in smallLaptop;
- 6 in tabletLandscape;
- full available width in compact modes.

Use the existing `full` footprint and span override mechanics if needed; do not hard-code grid CSS outside the established layout system.

### 5. Build the signature header zone

Header must contain:

- eyebrow:
  - `My Work`
- title:
  - `My Projects`
- purpose statement:
  - `Your assigned projects, ready to open in SharePoint and Procore.`
- summary metrics:
  - Assigned Projects
  - Dual Launch Ready
  - SharePoint Ready
  - Procore Ready

Use end-user copy, not developer diagnostics.

### 6. Add high-level readiness/degraded banner shell

Create a compact premium banner area that can show:

- partial source warning;
- registry enrichment degraded;
- principal unresolved;
- bounded-source warning;
- backend unavailable fallback.

Prompt 13 may refine microcopy and exact warning mapping, but this prompt should establish the structural zone.

### 7. Initial placeholder for launch list region

Add the launch list region container and render fixture/item count scaffolding sufficient for tests and Prompt 13 follow-on. Avoid building final row interaction yet.

### 8. Tests

Add/update UI tests proving:

- module appears on home surface;
- header title renders;
- purpose statement renders;
- metrics render from fixture data;
- banner region renders when a degraded fixture requires it;
- module uses expected full-width footprint / data markers if the app tests assert them;
- existing home surface cards still render without regression.

---

## Required non-goals

- Do not build final dual-action launch rows in full; Prompt 13 owns that.
- Do not implement responsive polish beyond correct full-width placement; Prompt 14 owns that.
- Do not add a focused My Projects module route.
- Do not change Adobe module behavior.
- Do not alter backend contracts or provider logic.
- Do not introduce generic Project Sites card reuse.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
```

If changes require build proof:

```bash
pnpm --filter @hbc/spfx-my-dashboard build
```

Search validation:

```bash
rg -n "My Projects|my-project-links|Your assigned projects, ready to open in SharePoint and Procore|Assigned Projects|Dual Launch Ready" \
  apps/my-dashboard/src
```

---

## Evidence requirements

Closeout must include:

- component/file map;
- exact home-surface placement;
- metric/header composition;
- degraded-banner structural posture;
- validation outcomes;
- statement that final row mechanics remain intentionally deferred to Prompt 13.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): add flagship home-surface composition shell
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Home-surface integration summary
5. Header/metrics/banner architecture
6. Validation commands and outcomes
7. Deferred interaction/state details for Prompt 13
8. Recommended next prompt:
   - Prompt 13

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes unless strictly required.
- No speculative whole-home redesign.
- Preserve My Work layout primitives and surface ownership.
- Use doctrine as a quality bar, not as justification to clone homepage-specific composition.
