# Prompt 03 — Backend Search Intent, Request Builder, and Search Seam

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

Adobe Sign Completed Toggle — Prompt 03 — Backend Query Intent + Completed Search Request Builder

## Objective

Implement the backend search-seam changes required to support a **second bounded Adobe search intent** while preserving the existing pending action queue behavior.

Specifically:

- add an explicit Adobe search intent discriminant;
- add the completed request builder;
- extend the live search client translation layer;
- preserve the current pending lane unchanged;
- add focused unit tests proving both intent bodies are bounded and correct.

## Why this prompt exists now

The current backend pending query builder is action-queue specific. It is not semantically correct to overload it for completed history. At the same time, the low-level live search HTTP client should remain singular, because it already owns:

- access-point validation;
- bearer handling;
- timeout/network normalization;
- raw response parsing;
- sanitized diagnostics.

The correct move is a **single transport seam with explicit bounded query intents**, not duplicate transport clients.

## Governing result from Prompt 01

Before editing, read the Prompt 01 closeout and carry forward the exact confirmed Adobe request-body syntax for:

- completed terminal status filter;
- last-30-days date filter;
- descending sort;
- pagination fields.

Do not reopen the product decision. Consume the Prompt 01 technical confirmation.

## Current repo truth

Inspect as needed:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.test.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.test.ts
```

## Intended future state

### Search intent

Add:

```ts
export type AdobeSignSearchIntent =
  | 'action-queue'
  | 'recent-completions';
```

The search input/request seam must carry this intent in a type-safe way.

### Completed request builder

Add:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-request.ts
```

and implement:

```ts
buildAdobeSignRecentCompletionsRequest(...)
```

with:

- fixed `intent: 'recent-completions'`;
- page-size clamp matching the lane design;
- cursor support matching existing bounded posture;
- fixed `windowDays: 30` metadata where appropriate;
- confirmed Adobe provider body semantics from Prompt 01.

### Live search client translation

Update the current live search HTTP adapter so:

- `action-queue` continues to generate the currently correct pending body;
- `recent-completions` generates the confirmed Adobe completed filter body;
- diagnostics identify `queryIntent`;
- diagnostics expose safe booleans proving completed status/date/sort fields are present.

## Required tests

Add or update tests to prove:

1. pending `action-queue` request-body behavior remains unchanged;
2. recent-completions request builder clamps page size;
3. recent-completions cursor semantics are bounded;
4. recent-completions live body includes:
   - completed-status filter field;
   - last-30-days date filter field;
   - descending sort field;
5. telemetry diagnostics include:
   - `queryIntent: 'recent-completions'`;
   - field-presence booleans for completed query posture;
6. no raw vendor payload or tokens leak through test-visible diagnostics.

## Exact implementation scope

Allowed files to add or modify:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-live-search-client.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-request.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/**/*search*.test.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/**/*recent*request*.test.ts
```

## Explicit non-scope

Do not:

- implement the completed adapter yet;
- register the route yet;
- touch frontend code;
- touch shared model files already closed by Prompt 02 except import usage required to compile backend tests if strictly necessary;
- edit manifests, lockfiles, package files, deployment code, or workflows;
- run live Adobe calls.

## Required verification / burden of proof

Run:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
git diff --check
md5 pnpm-lock.yaml
```

Run targeted prettier check for Prompt 03 touched files.

Before commit:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Stage only Prompt 03 files explicitly.

## Required output artifacts

Return:

1. implementation decision;
2. files changed;
3. exact search-intent shape added;
4. exact completed body syntax implemented from Prompt 01;
5. telemetry field booleans added;
6. validation results;
7. lockfile MD5 before/after;
8. staged-file proof;
9. commit hash.

## Expected commit summary

```text
adobe-sign: add recent completions search intent and request seam
```

## Expected commit body

```text
Add the bounded Adobe search-query seam required for recent completed agreements.

- Introduce an explicit search intent discriminator so pending action queue and recent completions share one transport adapter without collapsing semantics.
- Add the recent-completions request builder using the confirmed Adobe completed-status, recent-window, and sort syntax.
- Extend live search request diagnostics with intent-aware bounded field presence.
- Preserve current action-queue request behavior and parser posture.

Validation:
- pnpm --filter @hbc/functions check-types
- pnpm --filter @hbc/functions test
- git diff --check
- md5 pnpm-lock.yaml unchanged
```

## Completion standard

Prompt 03 is complete only when:

- the search seam distinguishes both intents;
- the completed request body is provider-side bounded using Prompt 01-confirmed syntax;
- pending request behavior remains unchanged;
- focused unit tests prove both query intents;
- lockfile is unchanged;
- commit landed.
