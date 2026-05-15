# Prompt 04 — Backend Recent Completions Adapter, Provider, Route, and Telemetry

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

Adobe Sign Completed Toggle — Prompt 04 — Completed Read-Model Adapter, Protected Route, and Runtime Telemetry

## Objective

Implement the backend read-model lane for recent completed Adobe Sign agreements:

- adapter;
- provider method;
- provider resolver wiring;
- protected backend route;
- route parsing/validation;
- runtime result telemetry;
- tests.

## Why this prompt exists now

Prompt 02 created the contract lane. Prompt 03 created the bounded query intent and request seam. The backend now needs a complete implementation that consumes those foundations and returns a typed completed read-model envelope without disturbing the existing pending adapter.

## Current repo truth

Inspect as required:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-action-queue-adapter.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-source-handoff-policy.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-adobe-sign-live-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.ts
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
```

## Intended future state

Add:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-adapter.ts
```

Expose:

```ts
getAdobeSignRecentCompletions(...)
```

Register:

```http
GET /api/my-work/me/adobe-sign/recent-completions
```

Emit:

```text
adobeSign.read.recentCompletions.result
```

## Required adapter behavior

The new adapter must:

1. resolve principal;
2. acquire token;
3. build recent-completions request;
4. call shared search client;
5. map unauthorized to `authorization-required`;
6. map unreachable to `source-unavailable`;
7. map rows to completed DTO items;
8. preserve `agreementStatus: 'COMPLETED'`;
9. map only fields the provider actually returns;
10. evaluate row `sourceOpenUrlCandidate` through existing URL-policy doctrine;
11. summarize `completedAgreementCount`;
12. emit pagination/freshness;
13. emit completed result diagnostics.

## Completed row mapping rules

- `itemId` format:
  ```text
  adobe-sign:completed-agreement-{agreementId}
  ```
- use `completedAtUtc` only if the provider response truly yields that timestamp;
- use `modifiedAtUtc` if only modified timestamp is available;
- do not infer user personal completion;
- do not assign pending required-action semantics.

## Route validation rules

The completed route must mirror the focused pending route posture:

- pageSize:
  - integer
  - 1–50
- cursor:
  - optional
  - max 256 chars
- actor:
  - derived only from auth claims
  - never overrideable by query input

## Telemetry requirements

Extend diagnostics to emit:

```text
adobeSign.read.recentCompletions.result
```

with bounded safe properties:

- `sourceStatus`
- `resultStage`
- `warningCodes`
- `itemCount`
- `hasMore`
- `windowDays`
- `queryIntent: 'recent-completions'`

Do not log:

- tokens;
- raw Adobe payloads;
- raw URLs;
- actor identifiers;
- OAuth artifacts.

## Required tests

Add or update tests for:

### Adapter

- populated completed rows;
- empty completed result;
- paginated completed result;
- authorization required;
- source unavailable;
- principal unresolved;
- source URL allowed/omitted/rejected warnings;
- summary count;
- freshness state.

### Provider

- new method delegates to completed adapter;
- home provider remains pending-only and does not call completed adapter on dashboard home fetch.

### Route

- successful `GET /api/my-work/me/adobe-sign/recent-completions`;
- invalid pageSize;
- oversize cursor;
- actor context derives from auth claims;
- route returns typed envelope;
- failure remains bounded.

### Telemetry

- completed result event emitted with required safe fields;
- query intent discriminant retained.

## Exact implementation scope

Allowed files to add or modify:

```text
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-recent-completions-adapter.ts
backend/functions/src/hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-runtime-diagnostics.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-adobe-sign-live-read-model-provider.ts
backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.ts
backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts
backend/functions/src/hosts/my-work-read-model/**/*.test.ts
```

## Explicit non-scope

Do not:

- alter the existing pending adapter behavior beyond import/type adjacency required to compile;
- change home read-model shape;
- touch frontend code;
- touch docs;
- touch lockfile, manifests, workflows, deployment code, or package files;
- run live Adobe calls.

## Required verification / burden of proof

Run:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
git diff --check
md5 pnpm-lock.yaml
```

Run targeted prettier check for Prompt 04 touched files.

Before commit:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Stage only Prompt 04 files explicitly.

## Required output artifacts

Return:

1. implementation decision;
2. adapter/provider/route symbols added;
3. route validation behavior summary;
4. telemetry summary;
5. tests added/updated;
6. validation results;
7. lockfile MD5 before/after;
8. staged-file proof;
9. commit hash.

## Expected commit summary

```text
adobe-sign: add recent completions read-model route and adapter
```

## Expected commit body

```text
Implement the backend recent-completions Adobe Sign read-model lane.

- Add a dedicated recent-completions adapter using the bounded completed search request seam.
- Extend provider/resolver contracts with getAdobeSignRecentCompletions while keeping My Work home pending-only.
- Register GET /api/my-work/me/adobe-sign/recent-completions with the same protected actor-bound query validation posture as the focused pending route.
- Emit sanitized recent-completions runtime result telemetry and preserve the existing URL-policy handoff boundary.

Validation:
- pnpm --filter @hbc/functions check-types
- pnpm --filter @hbc/functions test
- pnpm --filter @hbc/functions build
- git diff --check
- md5 pnpm-lock.yaml unchanged
```

## Completion standard

Prompt 04 is complete only when:

- completed backend route exists and is protected;
- completed adapter maps truthful completed DTOs;
- pending home fetch remains single pending call only;
- telemetry exists and is sanitized;
- backend test/build/typecheck lanes pass;
- lockfile remains unchanged;
- commit landed.
