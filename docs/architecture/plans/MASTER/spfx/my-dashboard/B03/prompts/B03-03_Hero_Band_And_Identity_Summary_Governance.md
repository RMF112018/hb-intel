# B03-03 — Implement My Work Hero Band and Identity / Summary / Governance Copy

## Objective

Implement the My Work hero band that changes identity based on shell state while remaining leaner than PCC’s project hero. This prompt establishes the visible orientation layer for the My Dashboard shell.

## Prerequisite

Prompt B03-02 is complete. The shell and primary navigation compile and can distinguish home vs focused Adobe state.

## Read first

Do not re-read files that are still in your current context or memory. Inspect only what you need.

Reference targets:

```text
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/my-dashboard/src/shell/MyWorkShell.tsx
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B03_My_Work_Shell_Navigation_And_UX_Development.md
```

## Implement

### 1. Create hero files

```text
apps/my-dashboard/src/shell/MyWorkHeroBand.tsx
apps/my-dashboard/src/shell/MyWorkHeroBand.module.css
```

### 2. Hero states

Support exactly two shell UX states:

```text
home
focused-module
```

### 3. Exact home hero copy

When no module is active:

- Primary title: `My Dashboard`
- Secondary title: `My Work`
- Description:
  `Your personal command surface for work requiring attention across connected HB systems.`
- Governance microcopy:
  `Read-only work visibility · Source actions remain in their governing systems.`

### 4. Exact focused Adobe copy

When `activeModuleId === 'adobe-sign-action-queue'`:

- Primary title: `My Dashboard`
- Secondary title: `Adobe Sign Action Queue`
- Description:
  `Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.`
- Governance microcopy:
  `Queue visibility only · Agreement actions remain in Adobe Sign.`

### 5. Hero summary highlight slots

Add typed, limited hero highlight support that can later accept Batch 04 read-model values without requiring shell rewrite.

The implementation may render deterministic structural values for now, but it must keep the contract narrow and non-overreaching:

Home slots:
- Actionable items
- Connected sources
- Source health
- Last refreshed

Focused Adobe slots:
- Queue state
- Pending items
- Last refreshed
- Action system

If B03 uses static placeholder values pending Batch 04, they must be clearly contained in a dedicated preview/fixture helper and must not be developer-facing strings such as `TODO`, `mock`, or `placeholder`.

### 6. Required data attributes

```text
data-my-work-hero
data-my-work-hero-primary-title
data-my-work-hero-secondary-title
data-my-work-hero-description
data-my-work-hero-highlight
data-my-work-hero-governance-copy
```

### 7. Integrate hero into shell

Update `MyWorkShell.tsx` so command surface renders:

```text
MyWorkPrimaryNavigation
MyWorkHeroBand
```

in that order.

### 8. Explicit omissions

Do **not** render:
- PCC-style project facts row,
- command search,
- project metadata,
- Adobe detailed count breakdowns,
- filter controls,
- source CTA controls.

## Tests

Add/extend tests proving:

- home hero copy,
- focused Adobe hero copy,
- governance copy,
- data attributes,
- absence of project facts,
- absence of command search,
- shell hero ordering if test strategy supports it.

## Validation

Run changed-scope tests and type checks. Report exact commands/outcomes.

## Hard no-go rules

- No project facts row.
- No command search.
- No data-model design beyond narrow hero display slots.
- Do not re-read files still in current context or memory.

## Completion note

Report:
- hero state contract,
- any preview/fixture helper introduced,
- tests run,
- whether Prompt 04 is unblocked.
