# 02 — Repo-Truth Baseline  
## Current implementation seams that govern the My Projects redesign

---

## 1. Current card source of truth

The current module is owned by:

- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`

The card currently owns:

- read-model loading through `getMyProjectLinks()`;
- populated, loading, empty, banner-only, and degraded states;
- KPI rendering;
- launch region rendering;
- row rendering;
- role-chip overflow;
- expand/collapse disclosure behavior.

---

## 2. Current populated structure that must be replaced

The current populated body includes:

1. support copy;
2. metrics grid;
3. optional readiness banner;
4. dashed launch region;
5. `Launch List` heading;
6. project rows;
7. inline disclosure;
8. assistive hints.

This structure is the main target of the UI rebuild.

---

## 3. Current row structure

Each current row renders:

- source badge;
- project number in a separated top row;
- project name;
- optional project stage;
- role chips;
- action rail with persistent SharePoint + Procore controls.

The redesign removes the source badge and persistent action rail, then reorganizes the remaining content into a compact tile.

---

## 4. Current CSS pressure points

The most important current vertical-expansion causes are:

- metrics grid;
- launch region padding/border;
- row padding;
- action rail spanning multiple grid rows;
- two 40px minimum-height action controls per row;
- 180px–220px action rail width.

These pressure points are to be removed or replaced.

---

## 5. Home-surface posture that must be preserved

`MyWorkHomeSurface.tsx` currently renders:

1. My Projects
2. Adobe Sign Action Queue

The locked spans are:

- desktop / large laptop / ultrawide: 7 + 5
- standard laptop: 6 + 4
- tablet/full-width modes remain full-row where already defined

This implementation package does **not** change the home-surface span choreography.

---

## 6. Data contract facts that support the redesign

`MyProjectLinkItem` already supplies:

- `projectName`
- `projectNumber`
- `projectStage`
- `assignmentRoles`
- `sharePointAction`
- `procoreAction`
- `warnings`

No backend read-model schema change is required for the UI redesign.

---

## 7. Existing SharePoint / Procore action semantics to preserve

`sharePointAction` already distinguishes:

- `Open SharePoint Site`
- `Open SharePoint Folder`
- `SharePoint unavailable`

`procoreAction` already distinguishes:

- `Open Procore`
- `Procore unavailable`

The redesign must consume these existing action semantics, not invent new destinations.

---

## 8. Existing UI tests that will need refactoring

Current tests assert several soon-to-be-obsolete behaviors:

- metrics visible in populated state;
- launch region visible in populated state;
- source badge label mapping;
- dual persistent action slot rendering;
- inline five-row expand/collapse semantics.

These tests must be replaced with the new tile/menu/browser contract.

---

## 9. Current package script truth

`apps/my-dashboard/package.json` exposes:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

Use these in final closure.

---

## 10. Doctrine application posture

Use:

- SPFx Governing Standard as the binding quality baseline;
- homepage overlay/checklist/scorecard as the applied flagship-quality bar for composition, interaction completeness, responsive rigor, and evidence closure.

Do **not** blindly import hb-webparts-specific file-placement or import-path constraints into `apps/my-dashboard` when they do not structurally apply.
