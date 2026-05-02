# Hard Guardrails — Wave 12 Constraints Log

These guardrails apply to every prompt in this package.

## Repo and Scope Guardrails

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not make source/runtime changes outside the current prompt scope.
- Do not change package dependencies unless explicitly authorized and justified.
- Do not change `pnpm-lock.yaml` unless explicitly authorized and justified.
- Do not change manifests, workflows, CI, deployment config, SPFx packaging, app-catalog packaging, tenant settings, or secrets.
- Do not perform production rollout.
- Stage only files authorized by each prompt.

## Backend Guardrails

- Wave 12 backend implementation is GET-only.
- Do not add POST, PUT, PATCH, DELETE, queue-trigger, timer-trigger, webhook, sync, or mutation routes for Wave 12.
- Do not add background polling, scraping, mirroring, or external synchronization.
- Unknown/degraded project behavior must return deterministic safe read-model posture consistent with repo conventions.

## SPFx Guardrails

- Keep fixture-first posture unless backend opt-in is already repo-standard and locally verified.
- Do not require tenant-hosted runtime, SharePoint list creation, Graph permissions, or external system credentials for the preview module.
- UI may show local/safe read-only state changes for demonstration only where existing PCC conventions allow it.
- Do not perform external writes or file operations.

## External System Guardrails

Do not add runtime integration, scraping, sync, mirroring, writeback, mutation, upload/download, polling, or persistence behavior for:

- Procore;
- Primavera/P6;
- Sage;
- Microsoft Graph;
- SharePoint REST;
- PnP;
- Autodesk;
- AHJ portals;
- utility portals;
- Document Crunch;
- Adobe Sign;
- any other external system.

External systems may be represented only as launcher/reference links where existing PCC conventions allow that posture.

## Project Control / Legal Boundary Guardrails

- Do not provide legal advice.
- Do not create legal or contractual obligations automatically.
- Do not determine claim entitlement, compensability, delay damages, legal notice sufficiency, or forensic schedule analysis conclusions.
- Do not label any condition as legally compensable or non-compensable.
- Do not compute damages.
- Do not infer contract notice compliance.
- Delay exposure and change exposure are review flags only.

## Evidence / Approvals Guardrails

- Do not implement evidence-binary upload/download/sync/storage ownership in Wave 12.
- Use Document Control evidence-link references only.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not mutate Priority Actions queues unless an existing safe reference convention explicitly allows only reference/candidate output.

## Context Efficiency Guardrail

Every prompt must include this instruction exactly:

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```
