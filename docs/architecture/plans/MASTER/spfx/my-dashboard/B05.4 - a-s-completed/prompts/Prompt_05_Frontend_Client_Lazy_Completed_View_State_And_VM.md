# Prompt 05 — Frontend Client, Lazy Completed State, and View-Model Layer

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

Adobe Sign Completed Toggle — Prompt 05 — Frontend Completed Read-Model Client + Lazy View State + View Models

## Objective

Implement the frontend data and view-model layer needed by the future header-toggle card rendering:

- API client method;
- backend client method;
- fixture client method;
- lazy-fetch completed read-model hook;
- completed summary/list/copy view-model selectors;
- tests.

Do not render the header toggle or card body swap in this prompt. That occurs in Prompt 06.

## Why this prompt exists now

The UI toggle must not fetch directly in JSX or collapse completed data into pending selectors. It needs:

- a proper typed client method;
- a deterministic fixture seam;
- a lazy fetch state holder;
- dedicated completed view models.

This prompt creates that frontend data substrate before the visual card implementation.

## Current repo truth

Inspect as required:

```text
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/api/**/*.test.ts
apps/my-dashboard/src/state/**/*.test.ts
```

## Intended future state

### Client method

Add:

```ts
getAdobeSignRecentCompletions(
  query?: MyWorkAdobeSignRecentCompletionsQuery,
): Promise<MyWorkReadModelEnvelope<MyWorkAdobeSignRecentCompletionsReadModel>>;
```

### Hook

Add:

```text
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
```

The hook must:

- remain idle until explicitly enabled by the card;
- fetch only on first `Completed` selection;
- store the returned envelope in memory;
- not re-fetch solely due to view toggling;
- surface a deterministic local request posture for the card.

### View-model selectors

Add to:

```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
```

```ts
selectAdobeRecentCompletionsSummaryVmFromSummary
selectAdobeRecentCompletionsListVmFromItems
selectAdobeSignCompletedViewStateCopy
```

## Locked completed-row VM behavior

The completed list VM must map:

- agreement name;
- sender label if available;
- date label:
  - `Completed ...` only with `completedAtUtc`;
  - `Updated ...` if only `modifiedAtUtc`;
- sourceOpenUrl passthrough only from read model.

No required-action labels. No inferred actor-of-completion copy.

## Locked completed copy

Use exactly:

```text
No completed Adobe Sign agreements were found in the last 30 days.
```

```text
Recently completed Adobe Sign agreements are temporarily unavailable.
```

```text
Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.
```

for partial state only.

## Required tests

### Client tests

- backend route path construction;
- fallback behavior mirrors existing read-model client posture;
- fixture client returns completed fixture envelopes;
- no auth/token behavior regressions.

### Hook tests

- idle before enabled;
- one fetch on first enable;
- no duplicate fetch on repeated enable/toggle;
- returned envelope retained;
- error/fallback posture surfaces predictably.

### View-model tests

- completed summary mapping;
- empty state copy;
- partial copy;
- unavailable copy;
- date label preference:
  - completion date over modified date;
  - modified date when no completion date;
- no required-action labels appear.

## Exact implementation scope

Allowed files to add or modify:

```text
apps/my-dashboard/src/api/myWorkReadModelClient.ts
apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts
apps/my-dashboard/src/api/myWorkFixtureReadModelClient.ts
apps/my-dashboard/src/modules/adobeSign/useAdobeSignRecentCompletionsReadModel.ts
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/api/**/*.test.ts
apps/my-dashboard/src/modules/adobeSign/**/*recent*.test.tsx
apps/my-dashboard/src/state/**/*.test.ts
```

## Explicit non-scope

Do not:

- render the toggle yet;
- change `AdobeSignActionQueueCard.tsx` except import/type adjustments strictly required to compile tests, and prefer deferring card edits to Prompt 06;
- touch backend code;
- touch shared model code already closed by Prompt 02;
- touch docs;
- touch lockfile, manifests, workflows, deployment code, or package files.

## Required verification / burden of proof

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
git diff --check
md5 pnpm-lock.yaml
```

Run targeted prettier check for Prompt 05 touched files.

Before commit:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Stage only Prompt 05 files explicitly.

## Required output artifacts

Return:

1. implementation decision;
2. new frontend client/hook/view-model symbols;
3. lazy-fetch behavior summary;
4. completed copy/date-label semantics summary;
5. tests added/updated;
6. validation results;
7. lockfile MD5 before/after;
8. staged-file proof;
9. commit hash.

## Expected commit summary

```text
adobe-sign: add completed read-model client and lazy frontend state
```

## Expected commit body

```text
Add the frontend data substrate for Adobe Sign recent completions.

- Extend My Dashboard read-model clients with the protected recent-completions lane.
- Add a lazy completed-envelope hook that remains idle until the Completed view is selected and retains results for the mounted page session.
- Add dedicated completed summary/list/state-copy selectors with truthful completion/update date labeling and no pending-action semantic leakage.
- Cover client, hook, and view-model behavior with focused tests.

Validation:
- pnpm --filter @hbc/spfx-my-dashboard check-types
- pnpm --filter @hbc/spfx-my-dashboard test
- git diff --check
- md5 pnpm-lock.yaml unchanged
```

## Completion standard

Prompt 05 is complete only when:

- frontend completed data can be fetched through typed client seams;
- lazy-fetch behavior exists and is test-proven;
- completed view-model selectors exist and are truthful;
- card rendering remains reserved for Prompt 06;
- validations pass;
- commit landed.
