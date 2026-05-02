# Prompt 02 — Shared Models and Fixture Contracts

## Objective

Add or extend shared Wave 11 model contracts and deterministic fixture data under `packages/models/src/pcc/`, after applying the exact file targets confirmed by Prompt 01.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Global Guardrails

You must preserve these guardrails throughout this prompt:

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not change dependencies, package manifests, lockfiles, workflows, CI, SPFx packaging, deployment files, app settings, or secrets unless this prompt explicitly authorizes a narrow change and you can justify it.
- Do not add runtime calls to Graph, PnP, SharePoint REST, Procore, Sage, AHJ portals, Document Crunch, Adobe Sign, or other external systems.
- Do not add backend write routes.
- Do not mutate Team & Access state.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not implement evidence file upload/download/sync/storage behavior.
- Do not provide legal advice, infer legal obligations, create legal obligations, or replace executed contracts.
- Stop and report if local repo truth contradicts the Wave 11 documentation package or this prompt.

## Allowed / Likely Files

Use Prompt 01's exact allowed-file list. Likely files include:

```text
packages/models/src/pcc/ResponsibilityMatrix.ts
packages/models/src/pcc/ResponsibilityMatrix.test.ts
packages/models/src/pcc/fixtures/responsibilityMatrix.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/PriorityActions.ts
packages/models/src/pcc/ProjectReadinessFramework.ts
```

Only touch files needed for shared model/fixture contracts.

## Required Model Coverage

Define or extend contracts for:

- template library records;
- template version governance;
- project responsibility item instances;
- assignment layer;
- role/person/company/contract-party scopes;
- RACI values and extended assignment semantics;
- workbook-source traceability;
- source marker normalization posture;
- contract-party mapping;
- contract clause / obligation reference metadata;
- decision-rights overlay;
- current action owner / ball-in-court posture;
- workflow steps;
- handoffs;
- exceptions;
- evidence links;
- Matrix Health Score;
- snapshots/exports;
- audit event model;
- source health and confidence posture;
- read-only preview/action availability vocabulary if needed.

## Required Fixture Coverage

Create deterministic fixture data that demonstrates:

- corrected `109 / 98 / 0` workbook posture;
- at least one PM-derived item;
- at least one Field-derived item;
- owner-contract placeholder/schema-only messaging;
- ambiguous source marks requiring human review;
- missing accountable owner;
- missing current action owner;
- role vacant / person inactive;
- overdue current action;
- handoff required;
- evidence reference missing;
- owner-contract ambiguity;
- Matrix Health Score derivation inputs;
- Priority Actions eligibility references;
- Project Readiness source-lineage references;
- Team & Access role/person resolution references without mutation;
- Document Control evidence-link references without binaries;
- Approvals / Checkpoints reference/request posture without execution.

## Reuse Existing Contracts Where Appropriate

Prefer existing PCC model vocabulary for:

- `PccProjectId`
- `PccPersona`
- read-model envelope/source status
- Project Readiness source lineage, evidence state, blocker state, confidence, severity, source health, and posture
- Priority Actions safe references
- Team & Access preview/role/person posture
- Document Control reference posture

Do not duplicate generic concepts if existing PCC models already expose them cleanly.

## Tests

Add tests to prove:

- RACI `C = Consulted` is separate from contract-party `C = Contractor`;
- workbook marks remain `Unknown` unless explicit mapping policy exists;
- owner-contract active default obligation count remains `0`;
- fixture counts match `109 / 98 / 0`;
- one-accountable/one-decider constraints are represented, with explicit shared-exception capability;
- evidence links are reference-only;
- no runtime/external/import boundary violations.

## Validation Commands

Run only repo-appropriate commands based on touched files and actual package scripts.

Baseline before edits:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
md5 pnpm-lock.yaml
```

Core validation after edits:

```bash
git diff --check
pnpm exec prettier --check <touched files>
git diff --cached --name-only
git status --short
md5 pnpm-lock.yaml
```

Package validation, as applicable:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```



## Staged-File Proof Before Commit

Before committing, show:

```bash
git diff --cached --name-only
git diff --cached --stat
md5 pnpm-lock.yaml
```

If `pnpm-lock.yaml` changed, stop and report unless this prompt explicitly authorized a dependency change.

## Commit Requirements

Use this format in your final response:

```text
Commit summary:
<type(scope): concise summary>

Commit description:
<short body explaining what changed, what was validated, and what was intentionally not changed>
```

## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
