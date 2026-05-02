# Prompt 03 — Create Wave 11 Target Architecture Package

You are working in `/Users/bobbyfetting/hb-intel`.

Your task is to create the comprehensive Wave 11 target architecture documentation package.

## Global Guardrails

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Do not overwrite unrelated working-tree changes.
- Do not edit `docs/architecture/plans/**` unless the user explicitly authorizes canonical plan-library edits.
- Do not introduce package dependencies.
- Do not change `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or equivalent.
- Do not package, deploy, or upload SPFx packages.
- Do not mutate a tenant, SharePoint site, Microsoft Graph object, Procore project, Sage record, AHJ portal, or any external system.
- Do not introduce secrets, app settings, environment variables, CI/workflow changes, deployment manifests, package manifests, or production rollout instructions.
- Keep the work documentation-only unless a later prompt explicitly authorizes runtime implementation.
- Preserve Wave 8 Project Readiness Module Framework boundaries and Wave 14 Approvals / Checkpoints ownership.
- Preserve Team & Access, HB Document Control Center, Priority Actions, External Systems, and Project Readiness integration seams without claiming runtime execution.
- Preserve workbook source traceability for every default responsibility item.
- Treat the Responsibility Matrix workbooks as source references, not final UX constraints.
- Treat contract references as project-controls metadata, not legal interpretation.
- Explicitly prohibit contract interpretation as legal advice and automatic creation of legal obligations.
- Use targeted documentation validation. Do not run broad formatting across the repo.


## Primary Output Directory

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/
```

## Required Files

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Responsibility_Matrix_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Responsibility_Matrix_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/Wave_11_Resolved_Decisions_Register.md
```

## Required Target Architecture Content

The target architecture file must include, at minimum:

1. Module identity.
2. Objective.
3. Source workbook grounding.
4. Four-layer model:
   - Template Library;
   - Project Instance Library;
   - Assignment Layer;
   - Workflow / Evidence Layer.
5. Two-axis model:
   - contract-party responsibility;
   - internal RACI responsibility.
6. Decision-rights overlay.
7. Template library/version governance.
8. Project instance model.
9. Workbook import and human review pipeline.
10. Contract clause / obligation reference model.
11. Assignment layer.
12. Team & Access role resolution contract.
13. Assignment lifecycle and handoff.
14. Current action owner / ball-in-court model.
15. Workflow step model.
16. Notification and escalation policy.
17. Responsibility criticality.
18. Responsibility domain taxonomy.
19. Exception model.
20. Evidence and Document Control integration.
21. UI architecture and eight lanes.
22. Global `Who Owns This?` lookup.
23. Matrix Health Score.
24. Project Readiness integration.
25. Priority Actions integration.
26. Approvals / Checkpoints integration.
27. Team & Access integration.
28. External Systems launcher/reference posture.
29. Snapshot/export governance.
30. Permissions and governance.
31. Audit event model.
32. Testing and validation contract.
33. MVP scope lock.
34. Explicit exclusions and legal/external-system guardrails.

## Source Citations / Research References

Use the web research summary from this package and cite sources as raw URLs in the markdown source index or research section. At minimum, reference:

- PMI RACI/RAM;
- AIA A201;
- AIA submittals;
- ConsensusDocs owner/constructor responsibilities;
- CSI Project Delivery Practice Guide;
- Bain RAPID;
- Atlassian DACI;
- Procore Ball In Court;
- Autodesk Build submittal workflows.

## Scope Lock Requirements

`Wave_11_Responsibility_Matrix_Scope_Lock.md` must include:

- MVP includes;
- MVP excludes;
- later-phase items;
- hard guardrails;
- module boundaries with Team & Access, Document Control, Priority Actions, Project Readiness, Approvals / Checkpoints, External Systems;
- no legal-advice posture;
- no runtime/external-mutation posture.

## Decisions Register Requirements

`Wave_11_Resolved_Decisions_Register.md` must include all decisions from this package’s `03_Resolved_Decisions_Register.md`, adapted to repo format.

## Required Validation Commands

Run and capture:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
git diff --cached --name-only
```

Do not run package build/test commands for this documentation-only update unless you intentionally touch source/runtime files, which this prompt does not authorize.


## Commit

Recommended commit summary:

```text
docs(pcc): define wave 11 responsibility matrix architecture
```

Recommended commit description:

```text
Creates the Wave 11 Responsibility Matrix target architecture package.

Defines a governed, template-driven, project-instance-based responsibility control system with workbook source traceability, RACI, owner-contract mapping, decision-rights overlay, assignment lifecycle, handoffs, current action owner, workflow steps, evidence links, exceptions, Matrix Health Score, Priority Actions, Project Readiness, Approvals / Checkpoints, Team & Access, and Document Control integration seams.

Documentation-only. No runtime, package, lockfile, manifest, deployment, tenant, external-system, legal-advice, or production changes.
```

## Final Output Requirements

Return:

- files changed;
- what was added;
- what was intentionally not implemented;
- validation results;
- staged file proof;
- commit hash if committed;
- next recommended prompt.
