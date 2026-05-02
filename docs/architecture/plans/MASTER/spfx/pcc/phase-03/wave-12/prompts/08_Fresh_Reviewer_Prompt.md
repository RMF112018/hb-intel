# Prompt 08 — Fresh Reviewer Prompt

## Objective

Audit the completed PCC Phase 3 Wave 12 Constraints Log implementation from a fresh session. Verify repo truth, implementation correctness, target architecture compliance, validation evidence, guardrails, and readiness for the next wave.

This is a review prompt. Do not implement changes unless the user explicitly asks for remediation after the audit.

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
- Do not make source/runtime changes outside this prompt scope.
- Do not change dependencies, package manifests, lockfiles, workflows, CI, SPFx packaging, deployment files, app settings, secrets, or tenant settings unless this prompt explicitly authorizes a narrow change and you can justify it.
- Do not add runtime calls to Microsoft Graph, PnP, SharePoint REST, Procore, Sage, Primavera/P6, Autodesk, AHJ portals, utility portals, Document Crunch, Adobe Sign, or other external systems.
- Do not add backend write routes.
- Do not add scraping, polling, sync, mirroring, writeback, or external-system mutation behavior.
- Do not implement evidence-binary upload/download/sync/storage behavior.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not provide legal advice, infer claim entitlement, determine compensability, calculate delay damages, decide notice sufficiency, or perform forensic schedule-analysis conclusions.
- Stop and report if local repo truth contradicts Wave 12 documentation or this prompt.


## Allowed / Likely Files

Read-only unless the user explicitly authorizes a remediation pass. Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/
packages/models/src/pcc/
packages/models/src/pcc/fixtures/
backend/functions/src/hosts/pcc-read-model/
backend/functions/src/services/__tests__/
apps/project-control-center/src/api/
apps/project-control-center/src/fixtures/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
package.json
packages/models/package.json
backend/functions/package.json
apps/project-control-center/package.json
```

## Prohibited Scope

- Do not edit files unless the user explicitly authorizes remediation.
- Do not run broad formatting.
- Do not make package/lockfile/manifest/workflow/deployment/tenant/external-system changes.


## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` as the controlling file map. At minimum inspect the files relevant to this prompt scope, then rely on Prompt 01 findings where still current.


## Review Steps

1. Run local repo truth commands:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
```

2. Verify Wave 12 documentation and closeout:
   - documentation closeout exists;
   - implementation closeout exists;
   - source-model mismatch is either resolved or explicitly documented as not resolved with a justified stop condition.

3. Verify model implementation:
   - contracts align with Wave 12 definitions;
   - scoring utilities are pure and tested;
   - state-transition maps are explicit and tested;
   - fixtures are deterministic and cover required states/severity bands;
   - workbook rows remain reference-only.

4. Verify backend implementation:
   - route is GET-only;
   - known project response works;
   - unknown/degraded behavior is deterministic;
   - no write routes or external calls were added.

5. Verify SPFx implementation:
   - fixture-first behavior remains;
   - backend opt-in follows repo conventions;
   - required UX surfaces exist;
   - degraded/error/empty states render;
   - no external-system runtime behavior exists.

6. Verify integration seams:
   - Priority Actions posture is candidate/reference-only;
   - Project Readiness and related wave links are reference-only;
   - Document Control evidence links do not own binaries;
   - Scheduler/Look Ahead references do not edit schedules;
   - external systems are launcher/reference-only;
   - Wave 14 approval execution is not implemented.

7. Verify legal and project-control guardrails:
   - no legal advice;
   - no claim/entitlement/compensability determinations;
   - no delay-damages or forensic schedule-analysis determinations;
   - delay/change exposure remain review flags only.

8. Verify tests and validation evidence from Prompt 07.

## Validation Commands

Run repo-supported validation commands as appropriate:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

Do not assume a package command exists until you inspect package scripts.

## Staged-File Proof Before Commit

No commit is expected for this review prompt. Confirm:

```bash
git diff --name-only
git diff --cached --name-only
git status --short
md5 pnpm-lock.yaml
```

## Commit Summary and Commit Description

No commit is permitted unless the user separately authorizes remediation.

```text
Commit summary:
No commit — read-only Wave 12 implementation review.

Commit description:
No commit was created because this prompt audited implementation correctness, validation evidence, guardrails, and readiness only.
```

## Final Output Requirements

Provide:

- executive review summary;
- repo truth summary;
- implementation correctness findings;
- target architecture compliance findings;
- validation evidence findings;
- guardrail findings;
- source-model placement status;
- readiness rating: Ready / Ready with minor follow-ups / Not ready;
- prioritized remediation list if needed.
