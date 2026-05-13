# Prompt 13 — Launch Rows, Dual Actions, Role Chips, Disclosure, and Complete State Matrix

## Objective

Complete the My Projects user-facing module by implementing:

- polished launch rows;
- two explicit actions per project:
  - SharePoint;
  - Procore;
- role chips with overflow;
- source badges;
- inline “View all My Projects” disclosure;
- all required loading/empty/partial/unavailable/principal-unresolved states.

This prompt turns the Prompt 12 shell into a production-quality flagship module.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 12 closeout
- Prompt 08 fixture scenarios
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`

---

## Repo-truth references to inspect

### My Projects components from Prompt 12
- module folder/files created in Prompt 12

### Shared contracts / fixtures
- project-links model/fixture files from Prompt 08

### Existing dashboard component/test style
- nearby My Dashboard modules/components/tests
- `apps/my-dashboard/src/layout/MyWorkCard.tsx`
- `apps/my-dashboard/src/layout/MyWorkCard.module.css`

### UI doctrine
- SPFx governing standard
- full-page/widget overlay
- acceptance/scoring model

---

## Implementation scope

# 1. Launch row structure

Each project item must render as an authoritative, premium launch strip — not a generic list row.

Required content:

- source badge:
  - Projects-only → user-facing label such as `Project Site`
  - merged → `Site + Legacy`
  - legacy-only → `Legacy Folder`
- project number;
- project name;
- project stage when present and meaningful;
- matched role chips;
- two action areas:
  - SharePoint;
  - Procore.

# 2. Explicit action controls

## SharePoint action
Render exactly one SharePoint action slot per row:

- `Open SharePoint Site`
- `Open SharePoint Folder`
- `SharePoint unavailable`

## Procore action
Render exactly one Procore action slot per row:

- `Open Procore`
- `Procore unavailable`

## Link behavior
Available links must use:

```tsx
target="_blank"
rel="noopener noreferrer"
```

Unavailable actions must:

- have no fake `href`;
- remain visibly present;
- be semantically non-clickable;
- include accessible explanation where practical.

## Prohibited
- Do not make the whole row clickable.
- Do not bury one destination behind a menu.
- Do not imply unavailable actions are links.

# 3. Role chips

Render matched roles with this closed behavior:

- show up to two role chips inline;
- if more than two, show `+N`;
- expose remaining role labels through an accessible detail affordance where practical;
- do not display raw field names;
- preserve deterministic role order from the shared taxonomy.

# 4. Inline expansion behavior

Default visible item count:

```text
6
```

If `items.length > 6`, render:

```text
View all My Projects
```

Behavior:

- expands inline within the module;
- supports collapse;
- collapse returns focus to the disclosure control when interaction pattern requires it;
- animation must respect reduced-motion preferences.

# 5. Required state matrix

Implement professional state handling for:

1. Loading
2. Available with 1–6 projects
3. Available with >6 projects
4. No assigned projects
5. Mixed action availability
6. SharePoint unavailable for one or more rows
7. Procore unavailable for one or more rows
8. Source partial
9. Source unavailable
10. Principal unresolved
11. Backend unavailable fixture fallback
12. Bounded-source partial result

Use the plan’s end-user copy posture where applicable:

### Empty
> No assigned projects were found for your current project-role assignments.

### Partial
> Your assigned projects are available. Some launch destinations could not be fully verified.

### Principal unresolved
> We could not confirm your project assignment identity for this view.

### Bounded-source partial
> Your project list is available, but the source inventory exceeded the current review limit. Some assignments may not yet be shown.

# 6. Warning/readiness mapping

Map envelope/read-model conditions into user-facing banner or row-level microstates. Do not dump developer warning code names directly into the UI.

Examples:

- invalid Procore token → row Procore unavailable state + appropriate accessible explanation;
- bounded source → module banner;
- registry source partial → module banner;
- SharePoint launch missing → row unavailable state.

# 7. Tests

Add UI tests covering:

- one row renders both action slots;
- available SharePoint link has correct text/href/target/rel;
- available Procore link has correct text/href/target/rel;
- unavailable actions do not render fake links;
- source badges render correctly;
- role chips and `+N` overflow render correctly;
- initial six-item truncation;
- expand/collapse behavior;
- empty state copy;
- partial state copy;
- principal-unresolved copy;
- bounded-source copy;
- backend-unavailable fixture rendering;
- keyboard-reachable disclosure and actions.

---

## Required non-goals

- Do not refactor backend provider logic.
- Do not alter read-model contract shapes unless an actual bug is discovered; if so, stop and document the required model correction rather than patching ad hoc.
- Do not redesign My Work shell.
- Do not clone Project Sites UI.
- Do not defer required state handling to Prompt 14; Prompt 14 is polish/responsiveness, not missing functionality.

---

## Validation requirements

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

Search validation:

```bash
rg -n "Open SharePoint Site|Open SharePoint Folder|SharePoint unavailable|Open Procore|Procore unavailable|View all My Projects|No assigned projects were found|We could not confirm your project assignment identity" \
  apps/my-dashboard/src
```

---

## Evidence requirements

Closeout must include:

- row anatomy summary;
- source badge mapping;
- dual-action accessibility posture;
- role chip overflow posture;
- disclosure behavior;
- state matrix proof;
- validation command outcomes.

---

## Commit / closeout expectations

Recommended commit title:

```text
feat(my-projects): implement dual-launch rows and complete module states
```

Closeout format:

1. Verdict: PASS / FAIL
2. Branch / HEAD
3. Files changed
4. Launch row/action behavior
5. Role chips and disclosure behavior
6. State matrix completion summary
7. Validation commands and outcomes
8. Recommended next prompt:
   - Prompt 14

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes unless strictly required.
- No generic “directory card” fallback.
- No row-level omnibus click target.
- All unavailable states must remain honest and accessible.
