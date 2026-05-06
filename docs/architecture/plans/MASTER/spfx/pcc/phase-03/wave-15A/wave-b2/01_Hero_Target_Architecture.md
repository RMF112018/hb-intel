# 01 — Hero Target Architecture

## Objective

Rebuild the PCC hero from a flat metadata strip into a premium project command-surface header with clear hierarchy, constrained content, and visual separation from the tab rail.

## Locked Hero Content Contract

### Include

- Primary title: `Project Control Center`
- Secondary title: active surface name
- Active surface short description / workflow summary
- Location
- Estimated value
- Scheduled completion
- Project stage
- Disabled command affordance

### Exclude

- Project number
- Client
- Project status
- Source confidence
- Last updated

## Authoritative Preview Identity Source

Use `IProjectProfile` as the identity contract and `SAMPLE_PROJECT_PROFILE` as the default preview identity source until a later phase wires a stronger selected-project/read-model profile source.

Rationale:

- Project Home already uses `SAMPLE_PROJECT_PROFILE`.
- The current shell placeholder creates a visible mismatch.
- `IProjectProfile` is the correct model shape for project identity.
- Preview identity should be credible and consistent without implying live tenant readiness.

## Required Hero Zones

### Zone 1 — Experience Identity

Purpose: establish that the user is inside PCC and identify the current surface.

Content:

- eyebrow: `PROJECT CONTROL CENTER`
- primary title: `Project Control Center`
- secondary surface label: active surface name
- short surface description

Visual behavior:

- primary title is the strongest text element in the shell;
- active surface name is visually adjacent but subordinate;
- description is muted and clamped/truncated when constrained;
- no project number in this zone.

### Zone 2 — Project Fact Strip

Purpose: provide the most useful project context without overloading the shell.

Mandatory facts:

- Location
- Estimated Value
- Scheduled Completion
- Project Stage

Visual behavior:

- facts render as compact, designed metric cells or chips;
- fact labels are smaller and muted;
- fact values are stronger and readable;
- project stage may render as a branded status chip;
- facts wrap cleanly before truncating;
- on compact breakpoints, facts collapse behind a `Project Details` disclosure if required.

### Zone 3 — Utility / Preview Command Lane

Purpose: communicate that command search is planned but unavailable in preview.

Content:

- disabled preview command affordance;
- no input field unless actual search exists;
- no source-confidence label in the hero.

Recommended copy:

```text
Command Search — Preview
```

Optional helper text or tooltip:

```text
Project search and command actions are planned for a later phase.
```

Visual behavior:

- subordinate to identity and fact strip;
- clearly disabled/non-operational;
- not styled like an active search input;
- can collapse to a compact disabled chip at smaller widths.

## Visual Hierarchy Requirements

The hero must support this read order:

1. `Project Control Center`
2. Active surface name
3. Active surface description
4. Location / Estimated Value / Scheduled Completion / Project Stage
5. Disabled command preview affordance

## Separation from Tab Rail

The hero must be visually separated from the tab rail using all of the following:

- distinct hero surface background using UI-kit tokens;
- bottom edge or divider;
- spacing seam between hero content and navigation rail;
- tab rail background that is related but visually separate;
- no visual collapse into one flat gray/white strip.

Recommended pattern:

```text
[SharePoint chrome]
[Hero surface: PCC identity + project facts + preview command]
[Navigation seam / subtle divider]
[Tab rail]
[Canvas]
```

## Styling Guidance

Use branded UI-kit colors and tokens. Do not invent new brand colors unless existing tokens are inadequate and the exception is documented.

Preferred treatment:

- lightly elevated or contained hero surface;
- subtle brand accent edge or top/bottom line;
- restrained background gradient or layered neutral surface if tokens allow;
- metric cells with quiet contrast;
- active surface label as a refined badge/text pairing;
- stronger title typography than the current flat hero.

Avoid:

- heavy card box inside SharePoint chrome;
- overly dark hero competing with SharePoint header;
- excessive orange fill;
- four separate metadata boxes that look like a form;
- debug-like labels such as `Reference view` in the hero.

## Data Formatting

- Estimated value: format as USD whole dollars.
- Scheduled completion: use ISO only if the current app has no date formatting utility; otherwise format in a user-friendly date style.
- Project stage: replace underscores with spaces and title case where appropriate.
- Missing values: use `Not listed`, but avoid showing a full hero of `Not listed` fields in the default preview state.

## Tests Required

Add/update tests asserting:

- hero renders primary title `Project Control Center`;
- hero renders the active surface name;
- hero does not render project number;
- hero does not render client/source confidence/last updated/project status;
- hero renders location, estimated value, scheduled completion, project stage;
- hero uses `SAMPLE_PROJECT_PROFILE` or profile-derived data instead of `PCC_PROJECT_PLACEHOLDER` values;
- hero renders disabled command preview affordance;
- compact modes preserve identity and collapse only lower-priority facts;
- no forbidden copy appears in the hero: `Reference Client`, `Reference Location`, `$0`.

## Acceptance Criteria

- The hero has unmistakable visual hierarchy.
- A first-time user can identify the PCC experience, active surface, and project context in less than 3 seconds.
- The hero no longer reads like a flat SharePoint metadata strip.
- The tab rail below is visually separated.
- Preview limitations are honest but not visually dominant.
