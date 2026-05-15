# Prompt 02 — Shared Contracts, Route IDs, Fixtures, and Exports

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

Adobe Sign Completed Toggle — Prompt 02 — Shared Models, Route Map, Fixtures, and Export Closure

## Objective

Implement the shared model layer required for the new completed-agreements lane:

- new completed DTO family;
- new route registry entry;
- new read-model response map entry;
- new deterministic fixture family;
- exports and tests.

Do not implement backend fetch logic or frontend UI in this prompt.

## Why this prompt exists now

The current codebase contains only a pending-action DTO family. Reusing those types for completed history would encode the wrong semantics:

- `requiredAction`;
- actionable Adobe recipient statuses;
- pending queue metrics.

The completed feature requires a sibling DTO family with truthful completed-agreement semantics before backend and frontend work can proceed.

## Current repo truth

Inspect as required:

```text
packages/models/src/myWork/AdobeSignActionQueue.ts
packages/models/src/myWork/MyWorkReadModels.ts
packages/models/src/myWork/index.ts
packages/models/src/myWork/fixtures/adobeSignActionQueueReadModels.ts
packages/models/src/myWork/fixtures/myWorkHomeReadModels.ts
packages/models/src/myWork/fixtures/index.ts
packages/models/package.json
```

## Intended future state

Add:

```text
packages/models/src/myWork/AdobeSignRecentCompletions.ts
packages/models/src/myWork/fixtures/adobeSignRecentCompletionsReadModels.ts
```

Extend:

```text
packages/models/src/myWork/MyWorkReadModels.ts
packages/models/src/myWork/index.ts
packages/models/src/myWork/fixtures/index.ts
```

## Locked shared-route decision

Add:

```ts
'adobe-sign-recent-completions': 'my-work/me/adobe-sign/recent-completions'
```

## Locked DTO family

Implement exactly:

```ts
MyWorkAdobeSignRecentCompletionsQuery
MyWorkAdobeSignRecentCompletionsItem
MyWorkAdobeSignRecentCompletionsSummary
MyWorkAdobeSignRecentCompletionsPagination
MyWorkAdobeSignRecentCompletionsFreshness
MyWorkAdobeSignRecentCompletionsReadModel
```

## Required contract shape

### Query

```ts
export interface MyWorkAdobeSignRecentCompletionsQuery {
  readonly pageSize?: number;
  readonly cursor?: string;
}
```

### Summary

```ts
export interface MyWorkAdobeSignRecentCompletionsSummary {
  readonly countBasis: 'returned-items' | 'provider-total';
  readonly completedAgreementCount: number;
  readonly windowDays: 30;
}
```

### Item

```ts
export interface MyWorkAdobeSignRecentCompletionsItem {
  readonly itemId: string;
  readonly sourceSystem: 'adobe-sign';
  readonly agreementId: string;
  readonly agreementName: string;
  readonly agreementStatus: 'COMPLETED';
  readonly sender?: MyWorkAdobeSignSenderSummary;
  readonly completedAtUtc?: string;
  readonly modifiedAtUtc?: string;
  readonly sourceOpenUrl?: string;
}
```

### Pagination

```ts
export interface MyWorkAdobeSignRecentCompletionsPagination {
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly nextCursor?: string;
}
```

### Freshness

```ts
export interface MyWorkAdobeSignRecentCompletionsFreshness {
  readonly state: MyWorkFreshnessState;
  readonly generatedAtUtc: string;
  readonly lastSuccessfulSourceReadAtUtc?: string;
}
```

### Read model

```ts
export interface MyWorkAdobeSignRecentCompletionsReadModel {
  readonly moduleId: 'adobe-sign-recent-completions';
  readonly summary: MyWorkAdobeSignRecentCompletionsSummary;
  readonly items: readonly MyWorkAdobeSignRecentCompletionsItem[];
  readonly pagination: MyWorkAdobeSignRecentCompletionsPagination;
  readonly freshness: MyWorkAdobeSignRecentCompletionsFreshness;
}
```

## Required fixtures

Add deterministic fixtures for:

- available populated;
- available empty;
- available paged;
- partial;
- configuration required;
- authorization required;
- principal unresolved;
- source unavailable;
- backend unavailable.

Use deterministic timestamps, no runtime randomness.

## Test expectations

Add or update model tests to prove:

- route registry includes the new key/path;
- response map includes the new lane;
- completed fixture summaries/items match contract;
- paged completed fixture carries `hasMore` + `nextCursor`;
- degraded fixture envelopes remain type-valid;
- fixture `windowDays` is exactly `30`.

## Exact implementation scope

Allowed files to add or modify:

```text
packages/models/src/myWork/AdobeSignRecentCompletions.ts
packages/models/src/myWork/MyWorkReadModels.ts
packages/models/src/myWork/index.ts
packages/models/src/myWork/fixtures/adobeSignRecentCompletionsReadModels.ts
packages/models/src/myWork/fixtures/index.ts
packages/models/src/myWork/**.test.ts
```

Use repo-truth judgment for exact existing test file names; create focused tests where the package currently keeps analogous tests.

## Explicit non-scope

Do not modify:

```text
backend/functions/**
apps/my-dashboard/**
apps/project-control-center/**
pnpm-lock.yaml
package.json files
SPFx manifests
GitHub workflows
deployment scripts
```

Do not change the existing pending action DTO contract other than import/export type adjacency required by the new sibling family.

## Required verification / burden of proof

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
git diff --check
md5 pnpm-lock.yaml
```

Also run targeted prettier check for only Prompt 02 touched files.

Before commit:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Stage only Prompt 02 files explicitly.

## Required output artifacts

Return:

1. implementation decision: `PASS / PARTIAL / BLOCKED`;
2. files changed;
3. exact DTO/route symbols added;
4. fixture scenarios added;
5. validation command results;
6. lockfile MD5 before/after;
7. staged-file proof;
8. commit hash after commit.

## Expected commit summary

```text
adobe-sign: add recent completions shared contracts and fixtures
```

## Expected commit body

```text
Add the shared My Work contract family for Adobe Sign recent completions.

- Introduce completed-agreement DTOs, pagination, freshness, and query types.
- Extend the My Work route registry and response map with the protected recent-completions lane.
- Add deterministic fixture envelopes for populated, empty, paged, partial, and degraded completed states.
- Export the new model family and fixture surface without changing the existing pending action queue contract.

Validation:
- pnpm --filter @hbc/models check-types
- pnpm --filter @hbc/models test
- git diff --check
- md5 pnpm-lock.yaml unchanged
```

## Completion standard

Prompt 02 is complete only when:

- the new completed DTO family exists exactly as locked;
- the new route registry key/path exists;
- the response map is extended;
- fixtures cover all required scenarios;
- models tests pass;
- pending DTO semantics remain intact;
- lockfile checksum is unchanged;
- commit landed with the specified summary/body.
