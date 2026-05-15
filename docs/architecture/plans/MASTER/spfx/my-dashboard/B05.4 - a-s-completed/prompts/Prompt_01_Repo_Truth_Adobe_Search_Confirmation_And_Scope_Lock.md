# Prompt 01 — Repo Truth, Adobe Search Confirmation, and Scope Lock

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

Adobe Sign Completed Toggle — Prompt 01 — Repo Truth + Exact Adobe `/v6/search` Completed Query Confirmation

## Objective

Perform the non-editing implementation gate that verifies:

1. the repo is still on the expected continuation baseline;
2. the completed-toggle package remains compatible with current repo truth;
3. the exact current Adobe Sign `/v6/search` request-body syntax for a **recent completed agreements** query is confirmed before implementation begins.

This prompt is **read-only**. Do not edit product code, tests, docs, manifests, package files, or lockfiles.

## Why this prompt exists now

The current My Dashboard Adobe Sign pending action queue is working after the parser remediation that accepted:

```text
agreementAssetsResults.agreementAssetsResultList
```

The new `Completed` view requires a provider-side Adobe search query that is not identical to the pending lane. The implementation plan is already decided, but the exact current wire-body syntax for:

- completed terminal status;
- 30-day recent date bound;
- descending recency sort;

must be proven before coding. The package does not permit an invented body shape or an adapter-only unbounded post-filter scan.

## Current repo truth to confirm

Inspect only as necessary:

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueCard.tsx
apps/my-dashboard/src/state/myWorkCardViewModel.ts
packages/models/src/myWork/AdobeSignActionQueue.ts
packages/models/src/myWork/MyWorkReadModels.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
```

Confirm that current repo truth still matches these architectural facts:

- `Action Queue` is still the current static Adobe card sub-head/title.
- There is no completed-agreements DTO family.
- There is no recent-completions route.
- There is no completed route client method.
- The pending search adapter remains working and should remain untouched in behavior.
- The live search client still owns raw Adobe wire-body translation.

## Required Adobe research

Use authoritative Adobe sources only. Confirm the exact current request shape for the new provider-side completed search.

You must establish, with exact evidence:

1. endpoint family:
   ```text
   POST /api/rest/v6/search
   ```
2. exact request-body path for agreement asset criteria;
3. exact field or field family for completed terminal status filtering;
4. exact date-bound field or date-range structure appropriate for the last-30-days implementation;
5. exact sorting structure for newest-first behavior;
6. exact pagination interaction compatible with the current `startIndex` / cursor posture where applicable;
7. whether the row payload yields a true completion timestamp, or only modified-date style timestamps.

## Locked implementation intent you must not re-decide

The package decisions are already closed:

- single card only;
- current card title slot becomes a header toggle:
  ```text
  Action Queue    Completed
  ```
- `Completed` means:
  ```text
  completed terminal-state agreements visible to the authenticated Adobe principal,
  bounded to the last 30 days, ordered most recent first
  ```
- no eager home-envelope fetch;
- no separate second Adobe card;
- no generalization of the pending DTO family;
- no adapter-only unbounded post-filter completed scan.

## Required output

Return a concise implementation gate report with these sections:

1. **Baseline confirmation**
   - branch
   - HEAD
   - parser-remediation ancestry confirmed or not
   - lockfile MD5
   - unrelated dirty files, if any

2. **Repo-truth confirmation**
   - whether the implementation package assumptions remain valid
   - any drift that must be incorporated before Prompt 02

3. **Adobe completed-search request confirmation**
   - exact request-body fields/shape for:
     - completed status
     - 30-day date bound
     - descending sort
     - pagination
   - exact timestamp facts for UI copy:
     - completion timestamp supported, or
     - modified timestamp only

4. **Go / no-go decision**
   - `GO — implementation may proceed to Prompt 02`
   - or
   - `BLOCKED — exact search syntax not confirmed; do not implement`

## Explicit non-scope

Do not:

- modify files;
- create repo docs;
- add tests;
- change package contents;
- stage anything;
- commit anything;
- call live Adobe endpoints;
- call live HB runtime endpoints;
- deploy or mutate any external environment.

## Verification / burden of proof

Run:

```bash
git status --short
git diff --check
md5 pnpm-lock.yaml
```

## Required output artifacts

Chat closeout only. No file edits and no commit.

## Expected commit summary

```text
No commit authorized — Prompt 01 is read-only.
```

## Expected commit body

```text
No commit authorized — Prompt 01 performs repo-truth confirmation and exact Adobe completed-search syntax verification only.
```

## Completion standard

Prompt 01 is complete only when:

- current repo continuity is verified;
- implementation assumptions are either confirmed or precisely updated;
- exact Adobe completed-search request syntax is established or the prompt returns a hard blocker;
- no files changed.
