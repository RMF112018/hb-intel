# Prompt 07 — Tests, Guardrails, and Implementation Closeout

## Objective

Perform final Wave 12 implementation validation, add missing guardrail tests, run targeted package validation, and create the Wave 12 implementation closeout documentation.

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

Use Prompt 01's exact allowed-file list and actual files touched by Prompts 02–06. Likely closeout doc path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Implementation_Closeout.md
```

Likely test/doc files:

```text
packages/models/src/pcc/*.test.ts
backend/functions/src/hosts/pcc-read-model/*.test.ts
backend/functions/src/services/__tests__/
apps/project-control-center/src/**/*.test.ts
apps/project-control-center/src/**/*.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/Wave_12_Implementation_Closeout.md
```

Do not edit `docs/architecture/plans/**` unless separately authorized.

## Prohibited Scope

- No new product features beyond closing tests/guardrails for Prompts 02–06.
- No broad formatting.
- No dependency, lockfile, manifest, workflow, deployment, tenant, or external-system changes.
- No legal/claim/delay determination behavior.


## Repo-Truth Files to Inspect

Use `reference/01_REQUIRED_REPO_TRUTH_FILES.md` as the controlling file map. At minimum inspect the files relevant to this prompt scope, then rely on Prompt 01 findings where still current.


## Required Validation Coverage

Ensure tests cover, at minimum:

- model scoring utilities;
- state transition maps;
- severity override raise-only behavior;
- fixture determinism and severity coverage;
- workbook rows remain reference-only and not active default constraints;
- backend GET-only route behavior;
- backend known/unknown/degraded project behavior;
- source-status warnings;
- SPFx client fixture fallback and backend opt-in behavior;
- SPFx surface rendering states;
- detail panel, matrix drill-down, and board interactions are safe/local;
- role/permission display gating where applicable;
- Priority Actions candidate/reference-only posture;
- Document Control evidence-link reference-only posture;
- Wave 14 approval/checkpoint no-execution posture;
- no prohibited runtime imports/calls for Graph/PnP/SharePoint REST/Procore/P6/Sage/Autodesk/AHJ/utility portal/etc.;
- no legal/claim/entitlement/compensability/delay-damages/forensic analysis determinations.

## Implementation Closeout Content

Add or update closeout doc with:

- baseline commit and branch;
- prompt-by-prompt implementation summary;
- files changed by area;
- validation command results;
- lockfile hash before/after;
- source-model mismatch resolution summary;
- guardrail attestation;
- remaining risks/follow-ups;
- recommended reviewer prompt handoff.

## Validation Commands

Run the full relevant validation set after inspecting scripts:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --cached --name-only
git diff --cached --stat
```

If any package validation is skipped because it is not repo-supported or is known to fail from unrelated pre-existing issues, document the evidence and reason clearly.


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


Suggested commit summary:

```text
docs(pcc): close wave 12 constraints log implementation
```

Suggested commit description:

```text
Closes Wave 12 Constraints Log implementation with validation evidence, source-model placement resolution, model/backend/SPFx test coverage, guardrail attestations, and residual follow-ups. Confirms no external-system mutation, evidence-binary ownership, approval execution, or legal/claim/delay determination behavior was introduced.
```


## Final Output Requirements

- State files changed.
- State validation commands run and results.
- State lockfile hash before and after.
- State guardrail confirmations.
- State residual risks or follow-up prompts.
- State the exact commit hash if a commit was created.
