# White-Glove Device Deployment Prompt Package

## Architecture baseline

Before executing prompts, review the frozen architecture baseline:

- [Architecture Baseline](../white-glove/white-glove-architecture-baseline.md) — layer ownership, interaction model, run hierarchy
- [Boundary Matrix](../white-glove/white-glove-boundary-matrix.md) — operational concern ownership table
- [Repo-Truth Reuse Map](../white-glove/white-glove-repo-truth-reuse-map.md) — existing foundations, extensions, new build areas
- [No-Go List](../white-glove/white-glove-no-go-list.md) — implementation constraints

## Implementation status

**All 14 prompts complete. GO for controlled production rollout.**

- [Architecture Index](../white-glove/README.md) — full document set
- [Hardening Review](../../../reviews/phase-9.1-white-glove-hardening-review.md) — test coverage and deferred items
- [Final Closeout Audit](../../../reviews/phase-9.1-white-glove-final-closeout.md) — go/no-go decision and artifact inventory
- [IT Tenant Prerequisites](../../../../maintenance/white-glove-tenant-prerequisites.md) — operational handoff guide
- [Developer Guide](../../../../how-to/developer/white-glove-development-guide.md) — development reference

## What this package is

This package is a **local code-agent implementation package** for building the **white-glove employee device deployment feature** inside the **Admin SPFx IT Control Center**.

It is built to align with:

- the attached implementation brief
- the existing Admin SPFx end-state direction
- the current repo-truth foundations already present in the HB Intel repo

## What is included

- implementation summary / phase map
- repo-truth gap map
- ordered prompt series
- IT Department setup and enablement guide
- final verification / closeout prompt

## Package contents

### Foundation files
- `Admin-SPFx-IT-Control-Center-White-Glove-Implementation-Summary-Plan.md`
- `admin-spfx-white-glove-gap-map.md`
- `README.md`
- `IT-Department-Setup-and-Enablement-Guide.md`

### Prompt files
- `Prompt-01-White-Glove-Repo-Truth-and-Architecture-Baseline.md`
- `Prompt-02-White-Glove-Domain-Model-and-Package-Template-Baseline.md`
- `Prompt-03-White-Glove-Connector-Registry-and-Governed-Configuration-Foundation.md`
- `Prompt-04-White-Glove-Generalized-Run-Audit-Checkpoint-and-Evidence-Spine.md`
- `Prompt-05-White-Glove-Microsoft-Adapter-Lane.md`
- `Prompt-06-White-Glove-Apple-Adapter-Lane.md`
- `Prompt-07-White-Glove-NinjaOne-Adapter-Lane.md`
- `Prompt-08-White-Glove-SPFx-Connections-Readiness-and-Health-UX.md`
- `Prompt-09-White-Glove-SPFx-Package-Launch-and-Checkpoint-UX.md`
- `Prompt-10-White-Glove-SPFx-Run-History-Evidence-and-Recovery-UX.md`
- `Prompt-11-White-Glove-Package-Standards-and-Governance-UX.md`
- `Prompt-12-White-Glove-Testing-Observability-and-Hardening.md`
- `Prompt-13-White-Glove-Documentation-and-IT-Enablement-Closeout.md`
- `Prompt-14-White-Glove-Final-Verification-and-Implementation-Audit.md`

## Recommended execution order

Run the prompts in numeric order.

Do not skip ahead unless the earlier prompt explicitly says a dependency is already complete in repo truth.

## Execution rules for the local code agent

Apply these rules to every prompt in this package:

- Do **not** re-read files that are still within your current context or memory unless necessary.
- Treat repo truth as authoritative.
- Reuse current patterns before inventing parallel systems.
- Preserve the **Admin SPFx operator console / privileged backend** boundary.
- Do **not** push privileged execution into SPFx.
- Do **not** flatten Microsoft, Apple, and NinjaOne responsibilities into one generic adapter.
- Do **not** flatten Windows, macOS, iPhone, and iPad into one generic device workflow.
- Prefer platform-native responsibilities where Microsoft or Apple already owns the behavior.
- Use NinjaOne for post-enrollment standardization and validation, not as the enrollment authority.
- Update authoritative docs instead of creating redundant guidance files.
- Keep auditability, evidence, and operator visibility as first-class requirements.
- Sequence backend and contract hardening before broad UI rollout.
- Include verification work and acceptance criteria before closing each prompt.

## How to use this package

### Step 1
Read:

- `Admin-SPFx-IT-Control-Center-White-Glove-Implementation-Summary-Plan.md`
- `admin-spfx-white-glove-gap-map.md`
- `IT-Department-Setup-and-Enablement-Guide.md`

### Step 2
Execute:

- `Prompt-01-*`
- then `Prompt-02-*`
- continue in order

### Step 3
After each prompt:
- verify acceptance criteria
- update docs
- commit cleanly
- keep the repo aligned to the stated boundary rules

## Intended implementation outcome

By the end of this package, the repo should support:

- UI-driven connector configuration for Microsoft, Apple, and NinjaOne
- white-glove package launch from Admin SPFx
- parent / child package-run orchestration in the backend
- Microsoft Windows enrollment lane
- Apple enrollment lane
- NinjaOne standardization lane
- run history, checkpoints, evidence, and audit visibility
- package-template and standards governance
- IT-first setup and operational enablement documentation

## Final note

This package is intentionally **not** a small pilot prompt set.

It is designed to drive a **full, phased build** of the white-glove feature in a way that remains compatible with the current Admin IT Control Center direction.
