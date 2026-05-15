# Prompt 06 — Adobe Card Header Toggle, Completed Panel, and UI Test Closure

You are working in the HB Intel repo.

## Context-efficiency rule

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

You may reopen a file only when:

1. it is not currently in context;
2. repo state has changed after an earlier prompt;
3. you need exact wording, exact exported symbols, or exact line-accurate edit context;
4. you need to resolve a contradiction or implementation blocker.

## Mandatory preflight

Run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

Rules:

- Record unrelated pre-existing working-tree changes.
- Do not stage unrelated files.
- Do not use `git add .`.
- Do not change `pnpm-lock.yaml`.
- Do not run dependency-install commands.

## Prompt title

Adobe Sign Completed Toggle — Prompt 06 — Dynamic Header Toggle + Completed Panel Rendering

## Objective

Implement the user-visible Adobe Sign card enhancement:

- replace the current static `Action Queue` sub-head/title with a dynamic header toggle:
  - `Action Queue`
  - `Completed`
- conditionally render pending or completed card body based on active view;
- lazy-trigger completed read-model fetch on first completed selection;
- add complete UI tests and accessibility assertions.

## Why this prompt exists now

The package’s core UX direction is now locked: the view toggle must occupy the existing header title/sub-head slot, not a new body-level tabs row. This prompt is the exact UI implementation of that decision.

## Current repo truth

Inspect as required:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
apps/my-dashboard/src/modules/adobeSign/**/*.test.tsx
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
```

## Intended future state

### Header visual identity

The Adobe card renders:

```text
Adobe Sign
Action Queue    Completed
```

Default selected state:

```text
Action Queue = selected / larger / stronger
Completed = deselected / smaller / pronounced
```

Completed selected state:

```text
Action Queue = deselected / smaller / pronounced
Completed = selected / larger / stronger
```

### The static `title="Action Queue"` pattern must be replaced

Use the least disruptive card API adjustment that preserves existing card consumers and testability.

**Locked choice:** add an optional custom title-content slot to `MyWorkCard` while preserving existing `title: string` behavior for all current consumers.

Recommended API shape:

```ts
readonly title: string;
readonly titleContent?: ReactNode;
```

Rendering rule:

- if `titleContent` exists, render it in the heading region and preserve accessible labeling;
- otherwise render the current `title` string unchanged.

Do not redesign `MyWorkCard`.

## Required toggle semantics

Implement an accessible two-state view selector.

Requirements:

- `Action Queue` selected by default;
- click, Enter, and Space activate the alternate view;
- visible focus style;
- selected/deselected state surfaced to tests;
- no invalid nested interactive elements;
- header control remains within the existing card heading region.

Required DOM markers:

```text
data-adobe-sign-card-view-toggle
data-adobe-sign-card-view="action-queue"
data-adobe-sign-card-view="completed"
data-adobe-sign-card-view-selected="true|false"
data-adobe-sign-active-view="action-queue|completed"
```

## Toggle visibility rules

Show the toggle only when the card is data-capable:

```text
available
partial
available-empty
available-items
```

Hide it for:

```text
loading
authorization-required
configuration-required
principal-unresolved
source-unavailable
backend-unavailable
```

## Pending body behavior

When `Action Queue` is selected, preserve the current pending body exactly in substance:

- body copy;
- metrics;
- item list;
- connect CTA states where applicable;
- source-open links.

Do not regress current DOM markers or CTA behavior unless additive markers are required.

## Completed body behavior

When `Completed` is selected:

### Idle / initial

- first selection triggers lazy fetch;
- while request is unresolved, render completed loading posture.

### Empty

Render exactly:

```text
No completed Adobe Sign agreements were found in the last 30 days.
```

### Populated

Render:

- metric:
  - `Completed in last 30 days`
- up to 5 rows;
- each row:
  - agreement name;
  - completed or updated date label;
  - sender if available;
  - `Open in Adobe Sign` when `sourceOpenUrl` exists.

### Partial

Render:

```text
Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.
```

plus available rows/metric where returned.

### Degraded completed panel

Render:

```text
Recently completed Adobe Sign agreements are temporarily unavailable.
```

Panel degradation must not collapse a healthy pending view.

## Required completed-panel state marker

Emit:

```text
data-adobe-sign-completed-panel-state="idle|loading|available-empty|available-items|partial|source-unavailable|backend-unavailable|authorization-required|configuration-required|principal-unresolved"
```

## Required tests

Add or update tests to prove:

1. default active view is `Action Queue`;
2. current static title posture is replaced by toggle posture;
3. selected/deselected visual/state markers swap correctly;
4. completed fetch is not made before selecting `Completed`;
5. first selection triggers fetch;
6. toggling back restores pending view immediately;
7. second completed selection reuses in-memory data;
8. completed empty copy matches exact text;
9. completed populated rows render exact semantics;
10. completed degraded panel is scoped and truthful;
11. header toggle is hidden in authorization-required/config/principal/unavailable/loading states;
12. no regression to connect CTA branch;
13. keyboard/focus semantics work;
14. My Projects + Adobe card bento composition remains intact.

## Exact implementation scope

Allowed files to add or modify:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/MyWorkCard.module.css
apps/my-dashboard/src/modules/adobeSign/**/*.test.tsx
apps/my-dashboard/src/layout/**/*.test.tsx
apps/my-dashboard/src/surfaces/home/**/*.test.tsx
```

Use Prompt 05 hook/view-model interfaces; do not duplicate completed data logic inside the component.

## Explicit non-scope

Do not:

- modify backend code;
- modify shared model contracts;
- alter pending route semantics;
- add a second Adobe card;
- move the toggle into a separate body tab row;
- rename the module to `Agreements`;
- edit docs in this prompt;
- change manifests, lockfiles, package files, workflows, or deployment assets.

## Required verification / burden of proof

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
git diff --check
md5 pnpm-lock.yaml
```

Run targeted prettier check for Prompt 06 touched files.

Before commit:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Stage only Prompt 06 files explicitly.

## Required output artifacts

Return:

1. implementation decision;
2. exact card header toggle structure chosen;
3. `MyWorkCard` API adjustment implemented;
4. completed panel state matrix implemented;
5. UI/accessibility tests added;
6. validation results;
7. lockfile MD5 before/after;
8. staged-file proof;
9. commit hash.

## Expected commit summary

```text
adobe-sign: replace action queue title with completed view header toggle
```

## Expected commit body

```text
Implement the single-card Adobe Sign header toggle and completed panel rendering.

- Replace the static Action Queue sub-head with an in-header Action Queue / Completed view selector that changes visual emphasis by selection.
- Keep pending Action Queue as the default view and preserve its existing metrics, queue rows, and connect-state behavior.
- Wire the Completed view to the lazy recent-completions frontend state and render loading, empty, populated, partial, and scoped degraded panel states.
- Add stable DOM markers and UI/accessibility coverage without introducing a second Adobe card or body-level tab bar.

Validation:
- pnpm --filter @hbc/spfx-my-dashboard check-types
- pnpm --filter @hbc/spfx-my-dashboard test
- pnpm --filter @hbc/spfx-my-dashboard build
- git diff --check
- md5 pnpm-lock.yaml unchanged
```

## Completion standard

Prompt 06 is complete only when:

- the header toggle exists exactly in the title/sub-head slot;
- `Action Queue` default / `Completed` selected behavior works;
- lazy completed panel rendering is complete and test-proven;
- pending path UI behavior remains intact;
- validations pass;
- commit landed.
