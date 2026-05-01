# PCC Phase 3 Wave 8 — Project Readiness Module Framework Implementation Prompt Package

Generated: 2026-05-01  
Repository: `RMF112018/hb-intel`  
Local execution path: `/Users/bobbyfetting/hb-intel`  
Target: **PCC Phase 3, Wave 8 — Project Readiness Module Framework**  
User-facing surface: **Project Readiness Center**  
Package status: **Web-research enhanced, repo-truth constrained, implementation-ready subject to Prompt 01 authorization gate**

---

## 0. Package Purpose

This package instructs a local code agent to implement **PCC Phase 3 / Wave 8 — Project Readiness Module Framework** in the `RMF112018/hb-intel` repository.

Wave 8 is the reusable readiness framework and Project Readiness Center shell. It must create the normalized foundation that downstream readiness modules plug into, especially Wave 9 Project Lifecycle Readiness Center, without implementing Wave 9 checklist content itself.

This package is enhanced with targeted web research on:

- OSHA construction safety and health program readiness practices;
- CII Project Definition Rating Index / front-end planning concepts;
- CMAA closeout responsibility and closeout dependency concepts;
- AIA substantial completion documentation concepts;
- Autodesk and Procore construction closeout / inspection workflow patterns;
- Microsoft SharePoint governance, information architecture, document management, SPFx, and Microsoft Graph guardrails;
- project-controls platform patterns around risk registers, workflow gates, records, and readiness dependencies.

The package is self-contained enough for a local code agent to execute without this chat.

---

## 1. Executive Summary

### Objective

Implement the reusable **Project Readiness Module Framework** and a user-facing **Project Readiness Center** shell that normalizes readiness domains, lifecycle gates, blockers, ownership, evidence posture, source health, degraded states, and downstream-module integration seams.

### Recommended implementation posture

Wave 8 should be:

- **framework-first** — establish shared model/read-model vocabulary that later modules consume;
- **read-only** — no writes, no mutation, no tenant operations;
- **fixture-first** — SPFx defaults to deterministic fixture data;
- **mock-provider compatible** — backend mock provider may expose a GET-only readiness read model after Prompt 01 authorizes it;
- **source-of-record respectful** — surface normalized posture without taking ownership of source-module detail;
- **blocker-first** — unresolved critical blockers override superficial percent-complete scoring;
- **evidence-aware** — model evidence requirement and evidence status, but do not upload/store documents in Wave 8;
- **role-aware** — show ownership, accountability, escalation, and authorization posture without implementing workflow execution;
- **future-wave safe** — do not collapse Wave 9 checklist implementation or Waves 10–14 module ownership into Wave 8.

### Recommended prompt sequence

1. **Prompt 01 — Repo-truth gate, research-backed authorization, and Wave 8 implementation scope-lock**
2. **Prompt 02 — Shared readiness framework model/read-model contracts and deterministic fixtures**
3. **Prompt 03 — Backend mock provider and GET-only route-family extension**
4. **Prompt 04 — SPFx fixture/client parity and API guardrails**
5. **Prompt 05 — Project Readiness Center shell and framework cards**
6. **Prompt 06 — Ownership, evidence, blocker, risk, source-health, and Priority Actions preview summaries**
7. **Prompt 07 — Wave 8 closeout documentation and final validation**

---

## 2. Repo-Truth Audit Findings

The package was prepared after auditing the live GitHub repo through the available repository connector. The local code agent must still re-run the baseline commands at the start of each prompt because local working-tree state may differ.

### 2.1 Baseline commands required in every prompt

Every implementation prompt must begin with:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Each prompt must record:

- current branch;
- current HEAD;
- recent relevant commits;
- working-tree state;
- unrelated pre-existing changes;
- `pnpm-lock.yaml` checksum before edits.

### 2.2 Current wave alignment

Current repo truth establishes this alignment:

| Wave | Repo-truth identity | Current posture |
| ---: | --- | --- |
| 7 | HB Document Control Center | Recently implemented/closed via Wave 7 prompt sequence; no live file operations |
| 8 | Project Readiness Module Framework | Shared framework/shell layer; current docs require implementation authorization gate |
| 9 | Project Lifecycle Readiness Center | Downstream lifecycle/checklist module seeded by Startup, Safety, Closeout checklist-definition files |
| 10 | Permit Log | Downstream readiness module |
| 11 | Responsibility Matrix / RACI | Downstream readiness module; not Wave 8 |
| 12 | Constraints Log | Downstream readiness module |
| 13 | Buyout Log | Downstream readiness module |
| 14 | Approvals / Checkpoints | Downstream readiness/approval module |

### 2.3 Current Wave 8 scope-lock tension

Existing Wave 8 scope-lock path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md
```

Current repo truth correctly names Wave 8 as:

- technical/framework name: **Project Readiness Module Framework**;
- user-facing surface name: **Project Readiness Center**.

However, the current Wave 8 scope-lock also states that the prior documentation correction pass does **not** authorize:

- readiness runtime implementation;
- backend route creation;
- persistence model implementation;
- scoring engine implementation;
- approval execution runtime;
- tenant/deployment/package operations.

Therefore, **Prompt 01 is mandatory**. It must convert Wave 8 from prior documentation-only correction posture into a bounded implementation posture before source work begins. If repo truth has already changed locally, Prompt 01 must verify and document that change rather than duplicate it.

### 2.4 Wave 9 boundary

Existing Wave 9 target architecture path:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/Project_Lifecycle_Readiness_Center_Target_Architecture.md
```

Wave 9 is the downstream module that:

- consumes Wave 8 framework contracts;
- implements the lifecycle readiness/checklist module;
- uses checklist-definition files derived from:
  - `docs/reference/example/Project_Startup_Checklist.pdf`
  - `docs/reference/example/Project_Safety_Checklist.pdf`
  - `docs/reference/example/Project_Closeout_Checklist.pdf`
- must not be a single giant checklist screen, three static tabs, a PDF replacement, a Procore clone, or a dead-end compliance tracker.

Wave 8 must not import the Wave 9 item library or implement checklist-specific content. Wave 8 may include minimal framework sample fixtures that demonstrate domains/gates/status/evidence/blocker behavior without copying the Startup/Safety/Closeout checklist library.

### 2.5 Existing shared model/read-model posture

Important paths:

```text
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/pcc/PccCapabilities.ts
packages/models/package.json
```

Known package name and scripts:

```text
@hbc/models@0.5.1
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
pnpm --filter @hbc/models lint
```

Current read-model envelope posture includes:

- `mode`
- `sourceStatus`
- `readOnly: true`
- `viewerPersona`
- `warnings`
- `generatedAtUtc`
- `data`

Current `PccReadModelResponseMap` includes:

- `profile`
- `modules`
- `home`
- `priority-actions`
- `document-control`
- `external-links`
- `site-health`
- `team-access`
- `settings`

No readiness-specific read-model currently exists. Prompt 02 should add it only after Prompt 01 authorizes Wave 8 implementation.

### 2.6 Existing backend read-model posture

Important paths:

```text
backend/functions/src/hosts/pcc-read-model/
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/package.json
```

Known package name and scripts:

```text
@hbc/functions@00.000.151
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm --filter @hbc/functions lint
```

Existing route tests assert exactly eight approved GET-only route handlers. Adding Wave 8 readiness route support requires explicitly updating route tests to expect nine GET-only routes and preserving:

- GET-only methods;
- no POST/PUT/PATCH/DELETE;
- existing auth wrapper posture;
- response shape `{ data: envelope }`;
- source-unavailable behavior for unknown projects;
- no Graph/PnP/SharePoint REST/Procore/Document Crunch/Adobe Sign runtime;
- no persistence or mutation.

### 2.7 Existing SPFx PCC app posture

Important paths:

```text
apps/project-control-center/package.json
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/priorityActions/
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/tests/
```

Known package name and scripts:

```text
@hbc/spfx-project-control-center@0.0.1
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center lint
```

Current `PccProjectReadinessSurface.tsx` is static preview content. Wave 8 should replace/enhance it with a framework-driven Project Readiness Center shell while preserving fixture-first/no-runtime posture.

### 2.8 Package/lockfile boundary

No dependency/package/lockfile/manifest changes should be needed for Wave 8. Any prompt that touches package files or `pnpm-lock.yaml` must stop unless repo truth proves it is absolutely required and the user explicitly authorizes the scope change.

---

## 3. Web Research Findings and Product Implications

### 3.1 Research source list

The following public sources informed this package. The local code agent does not need to browse these sources before implementation unless repo truth has changed or the user requests a refresh.

| Topic | Source | URL |
| --- | --- | --- |
| Construction safety program readiness | OSHA — Construction Management Industry / Safety and Health Programs | https://www.osha.gov/cmaa/safety-health-programs |
| Construction safety program elements | OSHA — Construction eTool / Safety and Health Program | https://www.osha.gov/etools/construction/safety-health-program |
| Hazard identification and inspection documentation | OSHA — Hazard Identification and Assessment | https://www.osha.gov/safety-management/hazard-identification |
| Hazard prevention/control and nonroutine work | OSHA — Hazard Prevention and Control | https://www.osha.gov/safety-management/hazard-prevention |
| Job Hazard Analysis | OSHA 3071 — Job Hazard Analysis | https://obis.osha.gov/Publications/osha3071.html |
| Front-end planning / project definition readiness | Construction Industry Institute — PDRI Overview | https://www.construction-institute.org/resources/knowledgebase/pdri-overview |
| PDRI building projects | Construction Industry Institute — PDRI for Building Projects | https://www.construction-institute.org/project-definition-rating-index-for-buildings |
| Construction management standards | CMAA — Construction Management Standards of Practice | https://www.cmaanet.org/bookstore/book/construction-management-standards-practice |
| Closeout guidelines | CMAA — Project Closeout Guidelines | https://www.cmaanet.org/bookstore/book/project-closeout-guidelines |
| Substantial completion closeout responsibilities | AIA Contract Documents — G704 Instructions | https://help.aiacontracts.com/hc/en-us/articles/1500009322461-Instructions-G704-2017-Certificate-of-Substantial-Completion |
| Digital inspection/checklist patterns | Procore — Project Inspections | https://support.procore.com/products/online/user-guide/project-level/inspections |
| Inspection templates/project customization | Procore Learn — Inspections Tool | https://learn.procore.com/inspections-tool |
| Closeout document collection/turnover package | Autodesk Construction Cloud — Construction Closeout | https://construction.autodesk.com/tools/closeout |
| Construction closeout document categories | Autodesk — Construction Project Closeout Guide | https://www.autodesk.com/blogs/construction/?p=3656 |
| SharePoint governance | Microsoft Learn — SharePoint Governance Overview | https://learn.microsoft.com/en-us/sharepoint/governance-overview |
| SharePoint information architecture / metadata | Microsoft Learn — Information management and governance in SharePoint | https://learn.microsoft.com/en-us/sharepoint/governance/information-management-and-governance-in-sharepoint |
| SharePoint document management lifecycle | Microsoft Support — Overview of document management in SharePoint | https://support.microsoft.com/en-us/office/overview-of-document-management-in-sharepoint-15e6e3a3-9d35-47af-b287-13aec95d247e |
| SPFx implementation posture | Microsoft Learn — Overview of SharePoint Framework | https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview |
| SPFx enterprise guidance | Microsoft Learn — SharePoint Framework enterprise guidance | https://learn.microsoft.com/en-us/sharepoint/dev/spfx/enterprise-guidance |
| Graph API guardrails | Microsoft Learn — Microsoft Graph throttling guidance | https://learn.microsoft.com/en-us/graph/throttling |
| Graph API best practices | Microsoft Learn — Best practices for Microsoft Graph | https://learn.microsoft.com/en-us/graph/best-practices-concept |

### 3.2 Construction readiness concepts to integrate

#### OSHA-informed safety readiness

OSHA safety-program guidance emphasizes:

- management commitment;
- worker participation;
- hazard identification and assessment;
- hazard prevention and control;
- education/training;
- program evaluation and improvement;
- communication and coordination across employers on multi-employer worksites.

Wave 8 should translate these into framework fields and UI posture, not safety runtime:

- `safetyReadinessDomain`
- `hazardIdentificationRequired`
- `controlPlanStatus`
- `trainingEvidenceStatus`
- `multiEmployerCoordinationStatus`
- `inspectionCadencePosture`
- `correctiveActionReference`
- `nonroutineWorkRiskFlag`

Wave 8 must not implement incident management, inspection execution, OSHA compliance engine behavior, or safety-system integrations.

#### CII/PDRI-informed gate readiness

CII’s PDRI framing supports a readiness framework that evaluates completeness of project definition, identifies risk factors, captures mitigation actions, and can be used repeatedly before detailed design and construction.

Wave 8 should not create a PDRI clone. It should borrow the pattern:

- readiness is not just percent complete;
- readiness should be evaluated by domain/gate;
- incomplete scope, unresolved risk, missing evidence, or unassigned mitigation should drive posture;
- repeated gate checks are more useful than one static checklist.

This supports the Wave 8 principle: **domain posture and blockers are more important than one blended global score.**

#### CMAA/AIA-informed closeout readiness

CMAA’s closeout guidance emphasizes that closeout procedures are interconnected and interdependent and that parties must understand their closeout responsibilities. AIA substantial-completion guidance reinforces clear responsibility for remaining work, maintenance, utilities, insurance, and timelines.

Wave 8 should therefore define generic fields for:

- gate impact;
- dependent readiness items;
- owner/accountable persona;
- due date;
- evidence requirement;
- approval/acknowledgement posture;
- exception/waiver state;
- closeout/turnover linkage.

Wave 8 should avoid hardcoding the closeout checklist library. Wave 9 owns the closeout-specific item library.

#### Procore/Autodesk-informed checklist and closeout patterns

Procore and Autodesk product documentation show common product patterns:

- reusable templates customized at project level;
- sections and line items;
- comments/files/evidence on checklist items;
- conforming/deficient or pass/fail status;
- reporting and visibility;
- closeout document collection, review, approval, and turnover packaging;
- project-level customization without corrupting company-level template lineage.

Wave 8 should adopt the architectural pattern, not vendor runtime:

- template definition vs project-instance state;
- source lineage;
- evidence/reference hooks;
- item status/posture;
- project overrides with audit posture;
- lifecycle data reuse after item completion.

Wave 8 must not implement Procore writeback, Procore cloning, external runtime calls, or vendor-specific APIs.

#### Microsoft 365 / SharePoint governance implications

Microsoft SharePoint governance guidance emphasizes policies, roles, responsibilities, processes, information architecture, metadata, lifecycle governance, permissions, records, and compliance. SharePoint document management guidance reinforces lifecycle control from creation/review/publishing through retention/disposition.

Wave 8 should therefore:

- keep evidence storage/linking aligned to HB Document Control Center / SharePoint project record;
- expose structured readiness metadata without forcing users into raw SharePoint edit mode;
- treat evidence links as references, not file-operation ownership;
- preserve source-of-record boundaries;
- avoid direct Graph/PnP/SharePoint REST runtime in Wave 8;
- maintain no-tenant-mutation posture.

#### SPFx and Microsoft Graph implications

Microsoft SPFx guidance establishes SPFx as a browser-executed client-side model using modern TypeScript/JavaScript tooling and responsive Microsoft 365-hosted surfaces. Microsoft Graph guidance warns that high-volume and write-heavy operations increase throttling risk and recommends backoff/retry strategies for real runtime integrations.

Wave 8 should stay safely below that threshold:

- presentational SPFx only;
- fixture-first default;
- optional backend read-only mock route only;
- no direct Graph runtime;
- no writeback;
- no polling or scanning;
- no sync/mirror behavior;
- no external-system runtime.

### 3.3 Research-informed terminology improvements

Use this vocabulary consistently in code/docs/UI:

| Term | Use | Avoid |
| --- | --- | --- |
| Project Readiness Module Framework | Technical Wave 8 framework | Checklist engine, generic workflow engine |
| Project Readiness Center | User-facing Wave 8 shell | Project Startup Checklist, Wave 9 module name |
| readiness domain | Business concern grouping | generic category when domain is intended |
| lifecycle gate | Stage-gate readiness moment | arbitrary milestone |
| readiness item | Framework item abstraction | checklist row when not checklist-specific |
| source module | Module/system that owns detail | duplicated source of truth |
| source lineage | Traceability to originating source/template/module | raw import origin only |
| evidence reference | Link/reference to evidence stored elsewhere | file upload/storage in Wave 8 |
| blocker-first posture | Critical blockers override percent complete | simple completion score |
| confidence posture | Quality/availability of supporting data | completion confidence |
| read-only framework shell | Wave 8 execution posture | workflow runtime |
| project-instance override | Project-specific change with reason/audit posture | editing global template directly |

---

## 4. Recommended Wave 8 Implementation Strategy

### 4.1 Target architecture

Wave 8 should add the following framework layers:

1. **Shared contracts** in `@hbc/models/pcc`
   - readiness domain taxonomy;
   - lifecycle gate taxonomy;
   - readiness item shape;
   - source-module relationship shape;
   - readiness status/posture;
   - blocker/severity/confidence/evidence status;
   - gate/domain summary read-model;
   - deterministic framework fixtures.

2. **Read-model response map extension**
   - add `project-readiness` or `readiness-framework` read-model key after Prompt 01 resolves naming.
   - Recommended route ID: `project-readiness` because it matches existing `PccMvpSurfaceId` and user-facing surface.
   - Internal data type should still be `PccProjectReadinessFrameworkReadModel` or similar.

3. **Backend mock provider extension**
   - add `getProjectReadiness(...)` read-only provider method;
   - add GET-only route only after Prompt 01 authorizes backend route extension;
   - preserve mock/local mode, deterministic fixtures, and no runtime integrations.

4. **SPFx client/fixture parity**
   - add fixture client support and optional backend client method;
   - keep fixture default;
   - update tests proving no unintended fetch/cutover;
   - do not make backend mode default.

5. **Project Readiness Center shell**
   - replace static readiness preview with framework-driven cards/lenses;
   - use existing bento/card patterns;
   - show domains, gates, blockers, ownership, evidence, source health, and degraded states;
   - use inert/disabled action chips only;
   - no checklist execution and no write actions.

6. **Wave 8 closeout**
   - document exact implementation, validation, exclusions, residual risks, and Wave 9 handoff.

### 4.2 Framework data model intent

Prompt 02 should introduce framework model names similar to:

```text
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
```

Recommended exports:

```ts
PROJECT_READINESS_DOMAINS
PROJECT_READINESS_LIFECYCLE_GATES
PROJECT_READINESS_SOURCE_MODULES
PROJECT_READINESS_STATUSES
PROJECT_READINESS_POSTURES
PROJECT_READINESS_BLOCKER_STATES
PROJECT_READINESS_SEVERITIES
PROJECT_READINESS_CONFIDENCE_STATES
PROJECT_READINESS_EVIDENCE_STATES
SAMPLE_PROJECT_READINESS_FRAMEWORK
```

Recommended types:

```ts
ProjectReadinessDomainId
ProjectReadinessLifecycleGateId
ProjectReadinessSourceModuleId
ProjectReadinessStatus
ProjectReadinessPosture
ProjectReadinessBlockerState
ProjectReadinessSeverity
ProjectReadinessConfidenceState
ProjectReadinessEvidenceState
IProjectReadinessSourceLineage
IProjectReadinessEvidenceRequirement
IProjectReadinessItem
IProjectReadinessDomainSummary
IProjectReadinessGateSummary
IProjectReadinessOwnershipSummary
IProjectReadinessEvidenceSummary
IProjectReadinessBlockerSummary
IProjectReadinessFrameworkSnapshot
PccProjectReadinessFrameworkReadModel
```

### 4.3 Minimum fields for readiness items

A Wave 8 framework item should support, at minimum:

```ts
interface IProjectReadinessItem {
  id: string;
  title: string;
  description?: string;
  domain: ProjectReadinessDomainId;
  lifecycleGate: ProjectReadinessLifecycleGateId;
  sourceModule: ProjectReadinessSourceModuleId;
  sourceLineage?: IProjectReadinessSourceLineage;
  ownerPersona?: PccPersona;
  accountablePersona?: PccPersona;
  reviewerPersona?: PccPersona;
  dueDate?: string;
  status: ProjectReadinessStatus;
  posture: ProjectReadinessPosture;
  severity: ProjectReadinessSeverity;
  blockerState: ProjectReadinessBlockerState;
  confidence: ProjectReadinessConfidenceState;
  evidenceRequirement?: IProjectReadinessEvidenceRequirement;
  dependencyItemIds?: readonly string[];
  relatedPriorityActionId?: string;
  exceptionSummary?: string;
  readOnly: true;
}
```

### 4.4 Required readiness domains

Use the Wave 8 scope-lock taxonomy as the base, with research-informed labels:

1. Project Setup
2. Team & Access
3. Documents / Project Record
4. Startup / Mobilization
5. Safety / QAQC
6. Permits / Jurisdiction
7. Procurement / Buyout
8. Responsibility / RACI
9. Constraints
10. Schedule / Milestones
11. Financial / Accounting Setup
12. External Systems
13. Site Health
14. Closeout / Turnover

### 4.5 Required lifecycle gates

Use the Wave 8 scope-lock taxonomy as the base:

1. Lead / Pursuit
2. Estimating
3. Preconstruction
4. Turnover to Operations
5. Startup / Mobilization
6. Active Construction
7. Closeout Planning
8. Substantial Completion
9. Turnover / Warranty
10. Archived / Lessons Learned

Do not introduce `archived` as a `PccProjectStage`; repo truth says `Archived` remains a project status, not a lifecycle stage.

### 4.6 Scoring/posture policy

Wave 8 may display deterministic summary values from fixtures, but it must not implement a scoring engine.

Policy:

- blockers override completion percent;
- evidence confidence is separate from completion;
- source health is separate from item completion;
- domain/gate posture is more important than a global blended score;
- use fixture-calculated values, not runtime computation unless trivial and purely presentational.

Recommended posture values:

```ts
'ready' | 'at-risk' | 'blocked' | 'not-started' | 'not-applicable' | 'unknown'
```

Recommended status values:

```ts
'not-started' | 'in-progress' | 'blocked' | 'needs-evidence' | 'needs-review' | 'complete' | 'not-applicable' | 'deferred' | 'waived'
```

### 4.7 Explicit forbidden scope

Wave 8 must not implement:

- Wave 9 checklist item library;
- Startup/Safety/Closeout checklist execution;
- RACI/Responsibility Matrix module;
- Permit Log module;
- Constraints Log module;
- Buyout Log module;
- live approval/workflow execution;
- live Graph file operations;
- SharePoint list/library mutations;
- PnP/SharePoint REST runtime;
- OneDrive folder creation;
- Procore runtime/writeback/sync/mirror;
- Sage runtime/writeback;
- Document Crunch runtime;
- Adobe Sign runtime;
- external-system writeback;
- tenant mutation;
- permission mutation;
- Power Automate flows;
- package/dependency changes;
- SPFx packaging/deployment;
- secrets/app settings;
- production rollout.

---

## 5. Open Decisions and Recommended Decisions

| ID | Decision | Recommended resolution | Prompt |
| --- | --- | --- | --- |
| W8-OD-001 | Does current scope-lock authorize implementation? | No. Prompt 01 must update/lock implementation authorization under blueprint Wave 8 path before source edits. | 01 |
| W8-OD-002 | Route/read-model key name | Use `project-readiness` for route/client key to match current surface ID; use `PccProjectReadinessFrameworkReadModel` for type name. | 01/02/03 |
| W8-OD-003 | Should Wave 8 backend route be added? | Yes, only as GET-only mock/read-model route after Prompt 01 authorizes it; no default SPFx backend cutover. | 03 |
| W8-OD-004 | Should Wave 8 include checklist content? | No. Use only framework demonstration fixtures; Wave 9 owns checklist content. | All |
| W8-OD-005 | Should Wave 8 compute readiness scores? | No scoring engine. Use fixture/precomputed summary values and simple display. | 02/05 |
| W8-OD-006 | Should evidence upload/linking be executable? | No. Model evidence requirement/status/reference only. HB Document Control Center remains evidence source-of-record. | 02/06 |
| W8-OD-007 | Should action chips execute? | No. Inert/disabled metadata-only action chips. | 05/06 |
| W8-OD-008 | Should local agent edit `docs/architecture/plans/**`? | No, unless user explicitly authorizes. Use blueprint/current-state docs. | All |
| W8-OD-009 | Should package/lockfile changes be allowed? | No. Stop if required. | All |

---

## 6. Universal Local-Agent Instructions

Every prompt in this package must follow these instructions.

### 6.1 Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

### 6.2 Context efficiency instruction

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

### 6.3 Working-tree protection

- Record unrelated pre-existing changes.
- Do not overwrite unrelated changes.
- Do not stage unrelated changes.
- Do not use broad `git add .`.
- Stage only explicit intended paths.
- Before commit, run:

```bash
git status --short
git diff --stat
git diff --check
md5 pnpm-lock.yaml
```

### 6.4 Package/lockfile protection

Do not run:

```bash
pnpm install
pnpm add
pnpm update
```

Do not edit package manifests or lockfile unless explicitly authorized by the user after proving necessity.

### 6.5 Closeout format required for each prompt

Final response from local code agent must include:

- commit hash if committed;
- files changed;
- validation results;
- lockfile md5 before/after;
- explicit exclusions;
- unrelated changes observed and excluded;
- remaining risks/open items;
- recommended next prompt.

---

# Prompt 01 — Repo-Truth Gate, Research-Backed Authorization, and Wave 8 Implementation Scope-Lock

## Role

You are a senior repo-truth auditor, construction-operations product strategist, SPFx/TypeScript architecture reviewer, and implementation-scope gatekeeper working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Resolve the current Wave 8 scope-lock tension before any source implementation. Update or create blueprint/current-state Wave 8 documentation that authorizes a bounded implementation posture for **PCC Phase 3 / Wave 8 — Project Readiness Module Framework**.

This is a documentation and authorization-gate prompt. Do not modify source code.

## Mandatory preflight

Run:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Files to inspect

```text
docs/architecture/blueprint/sp-project-control-center/README.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/Standard_Project_Site_Template_Contract.md
docs/architecture/blueprint/sp-project-control-center/phase-3/01_PCC_Product_Architecture_and_User_Journey_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-7/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-9/
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/PccMvpSurfaces.ts
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
```

## Research-informed findings to incorporate

Use the package research findings above. Do not need to browse unless you need to refresh a claim. Incorporate these concepts into the Wave 8 implementation authorization docs:

- OSHA safety readiness: management responsibility, worker participation, hazard identification, hazard prevention/control, training, multi-employer coordination.
- CII/PDRI readiness: domain/gate readiness, project definition completeness, risk-factor identification, mitigation action visibility, repeated readiness checks.
- CMAA/AIA closeout readiness: closeout responsibility clarity, interdependent procedures, substantial-completion responsibilities, outstanding-work timelines, evidence/document readiness.
- Procore/Autodesk workflow patterns: template vs project instance, customizable sections/items, comments/evidence/status, closeout package visibility, project-level customization without corrupting master templates.
- Microsoft governance: metadata, lifecycle, records, permissions, and source-of-record boundaries.

## Files you may modify

Preferred:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Implementation_Authorization.md
```

Only if needed for consistency:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/05_Phase_3_Development_Roadmap_Updated.md
docs/architecture/blueprint/sp-project-control-center/phase-3/07_Phase_3_Module_Implementation_Plan.md
docs/architecture/blueprint/sp-project-control-center/Project_Control_Center_Development_Roadmap.md
```

Do not modify:

```text
docs/architecture/plans/**
packages/**
backend/**
apps/**
pnpm-lock.yaml
package.json
```

## Required documentation decisions

Document that Wave 8 is now authorized only for:

- shared model/read-model framework contracts;
- deterministic framework fixtures;
- optional backend mock-provider GET-only read-model route extension;
- SPFx fixture/client parity;
- Project Readiness Center shell/cards;
- inert/disabled action affordances;
- source/degraded-state rendering;
- ownership/evidence/risk/blocker summary display;
- closeout documentation.

Document that Wave 8 remains forbidden from:

- live runtime integrations;
- mutations;
- actual workflow execution;
- checklist-library implementation;
- package/dependency changes;
- tenant/deployment activity.

## Validation commands

```bash
git diff --check
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Project_Readiness_Module_Framework_Scope_Lock.md docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Implementation_Authorization.md
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

If a touched roadmap file needs formatting, include it explicitly in the Prettier command.

## Staging

Use explicit path staging only. Do not use `git add .`.

## Commit summary

```text
docs(pcc): authorize wave 8 readiness framework implementation
```

## Commit body

```text
Authorizes a bounded Phase 3 Wave 8 implementation posture for the Project Readiness Module Framework.

Documents research-informed readiness framework principles, implementation scope, source-of-record boundaries, downstream Wave 9–14 relationships, and no-runtime/no-mutation guardrails. Confirms Wave 8 may proceed with shared model/read-model contracts, deterministic fixtures, optional GET-only mock read-model route, SPFx fixture/client parity, Project Readiness Center shell rendering, inert action affordances, source/degraded-state rendering, and closeout documentation only.

No source code, backend route, SPFx runtime behavior, package/dependency change, lockfile change, Graph/PnP/SharePoint REST runtime, Procore runtime, external writeback, workflow execution, tenant mutation, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- explicit exclusions;
- whether Wave 8 implementation is authorized for Prompt 02;
- remaining risks;
- recommended next prompt: Prompt 02.

---

# Prompt 02 — Shared Readiness Framework Model/Read-Model Contracts and Deterministic Fixtures

## Role

You are a TypeScript model-contract implementer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Add Wave 8 shared Project Readiness Module Framework contracts and deterministic fixtures under `@hbc/models/pcc`, after verifying Prompt 01 authorization exists.

Do not implement backend routes or SPFx UI in this prompt.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Required authorization check

Confirm Prompt 01 documentation exists and authorizes source implementation:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Implementation_Authorization.md
```

If it does not exist or does not authorize bounded implementation, stop and report the blocker.

## Files to inspect

```text
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/PccMvpSurfaces.ts
packages/models/src/pcc/PccUserRoles.ts
packages/models/src/pcc/PccCapabilities.ts
packages/models/src/pcc/WorkflowModules.ts
packages/models/src/pcc/WorkflowItems.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/fixtures/*.ts
packages/models/src/pcc/*.test.ts
packages/models/package.json
```

## Files you may modify/create

Expected:

```text
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/ProjectReadinessFramework.test.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
packages/models/src/pcc/fixtures/index.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/index.ts
packages/models/src/pcc/PccMvpSurfaces.ts
```

Only modify `PccMvpSurfaces.ts` if needed to update the `project-readiness` description away from checklist/RACI implementation language and toward framework/shell language.

Do not modify:

```text
backend/**
apps/**
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required model content

Add a pure TypeScript model file with no runtime side effects, service clients, URLs, secrets, Graph/PnP/SPFx/Azure imports, or backend imports.

Minimum constants/types:

```text
PROJECT_READINESS_DOMAINS
PROJECT_READINESS_LIFECYCLE_GATES
PROJECT_READINESS_SOURCE_MODULES
PROJECT_READINESS_STATUSES
PROJECT_READINESS_POSTURES
PROJECT_READINESS_BLOCKER_STATES
PROJECT_READINESS_SEVERITIES
PROJECT_READINESS_CONFIDENCE_STATES
PROJECT_READINESS_EVIDENCE_STATES
```

Minimum interfaces:

```text
IProjectReadinessSourceLineage
IProjectReadinessEvidenceRequirement
IProjectReadinessItem
IProjectReadinessDomainSummary
IProjectReadinessGateSummary
IProjectReadinessOwnershipSummary
IProjectReadinessEvidenceSummary
IProjectReadinessBlockerSummary
IProjectReadinessSourceHealthSummary
IProjectReadinessFrameworkSnapshot
PccProjectReadinessFrameworkReadModel
```

Update `PccReadModels.ts` to include:

```text
PccProjectReadinessFrameworkReadModel
'project-readiness': PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>
```

Use `project-readiness` as the response-map key unless repo truth from Prompt 01 chose another name.

## Required fixture content

Create deterministic fixture(s) showing framework variety without copying Wave 9 checklist libraries:

- 6–10 sample readiness framework items maximum;
- at least 5 domains represented;
- at least 4 lifecycle gates represented;
- at least one blocked item;
- at least one needs-evidence item;
- at least one at-risk source-health/degraded-state item;
- at least one downstream-module-linked sample item for Wave 9;
- at least one evidence/reference-only sample tied to HB Document Control Center;
- at least one owner/accountability example using existing `PccPersona` values;
- all data deterministic, no real URLs/secrets/tenant IDs.

## Required tests

Add tests proving:

- constants are non-empty and stable;
- readiness items use valid domain/gate/status/posture/severity/confidence/evidence states;
- fixture summaries reference existing items/domains/gates;
- no duplicate fixture item IDs;
- read-model response map includes `project-readiness`;
- no forbidden runtime strings/imports are introduced in the new model/fixture files.

## Validation commands

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/models build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

Run lint if touched files fall under existing lint coverage and it is practical:

```bash
pnpm --filter @hbc/models lint
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
feat(models-pcc): add project readiness framework contracts
```

## Commit body

```text
Adds Phase 3 Wave 8 Project Readiness Module Framework contracts, deterministic fixtures, read-model map coverage, and model tests.

Introduces readiness domains, lifecycle gates, source-module lineage, item posture, blockers, evidence status, ownership summaries, source-health summaries, and a project-readiness read-model envelope key for downstream backend/SPFx consumption.

No backend routes, SPFx runtime behavior, checklist-library implementation, scoring engine, workflow execution, Graph/PnP/SharePoint REST runtime, Procore runtime, tenant mutation, package/dependency changes, lockfile changes, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- explicit exclusions;
- model/read-model keys added;
- remaining risks;
- recommended next prompt: Prompt 03.

---

# Prompt 03 — Backend Mock Provider and GET-Only Route-Family Extension

## Role

You are a backend TypeScript implementer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Extend the existing PCC read-model backend mock provider and GET-only route family to expose the Wave 8 Project Readiness Framework read model.

This must remain mock/read-only. No live integrations, persistence, mutations, external clients, or tenant operations.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Required preconditions

Verify Prompt 02 landed and `@hbc/models/pcc` exports the readiness framework contracts and fixture.

If readiness model contracts do not exist, stop and report the blocker.

## Files to inspect

```text
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts
backend/functions/package.json
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
```

## Files you may modify

Expected:

```text
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.ts
backend/functions/src/hosts/pcc-read-model/pcc-read-model-routes.test.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.ts
backend/functions/src/hosts/pcc-read-model/read-models/pcc-mock-read-model-provider.test.ts
```

Do not modify:

```text
apps/**
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required implementation

Add provider method:

```ts
getProjectReadiness(
  projectId: PccProjectId,
  viewerPersona?: PccPersona,
): Promise<PccReadModelEnvelope<PccProjectReadinessFrameworkReadModel>>
```

Add GET-only route:

```text
pcc/projects/{projectId}/project-readiness
```

Recommended Azure Function route name:

```text
getPccProjectReadiness
```

Preserve response shape:

```ts
{ data: envelope }
```

Unknown projects should return a source-unavailable or degraded envelope consistent with existing provider patterns.

## Required tests

Update route tests to expect **exactly nine** approved GET-only routes, including `project-readiness`.

Prove:

- route path is `pcc/projects/{projectId}/project-readiness`;
- method is GET only;
- no POST/PUT/PATCH/DELETE;
- existing auth wrapper posture remains;
- provider method is called with projectId;
- response shape is `{ data: envelope }`;
- unknown project behavior returns a read-only source-unavailable/degraded envelope;
- no prohibited runtime imports are introduced.

## Forbidden runtime behavior

Do not introduce:

- Graph/PnP/SharePoint REST;
- Procore/Sage/Adobe/Document Crunch clients;
- Azure Tables or persistence writes;
- write routes;
- POST/PUT/PATCH/DELETE;
- scoring engines;
- workflow execution;
- tenant mutation;
- package changes.

## Validation commands

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

Run model validation if imports or model contracts were touched:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
feat(functions-pcc): add project readiness mock read-model route
```

## Commit body

```text
Extends the PCC read-model mock provider and GET-only route family for Phase 3 Wave 8 Project Readiness Module Framework.

Adds a read-only project-readiness envelope route backed by deterministic @hbc/models fixtures and updates route/provider tests to preserve GET-only, authenticated, mock-provider, no-mutation behavior.

No write routes, persistence writes, Graph/PnP/SharePoint REST runtime, Procore/Sage/Document Crunch/Adobe runtime, workflow execution, scoring engine, tenant mutation, package/dependency changes, lockfile changes, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- route added;
- explicit exclusions;
- remaining risks;
- recommended next prompt: Prompt 04.

---

# Prompt 04 — SPFx Fixture/Client Parity and API Guardrails

## Role

You are an SPFx TypeScript client-boundary implementer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Add Project Readiness Framework read-model parity to the SPFx PCC app client boundary and fixture client while preserving fixture-first default behavior.

Do not replace the Project Readiness UI in this prompt; this prompt is client/fixture parity only.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Required preconditions

Verify Prompts 02–03 landed if this prompt is using backend route parity. If Prompt 03 has not landed, implement fixture client parity only and document backend route parity as pending.

## Files to inspect

```text
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/tests/PccApp.optIn.test.tsx
apps/project-control-center/package.json
packages/models/src/pcc/PccReadModels.ts
```

## Files you may modify

Expected:

```text
apps/project-control-center/src/api/pccReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.ts
apps/project-control-center/src/api/pccBackendReadModelClient.test.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.ts
apps/project-control-center/src/api/pccFixtureReadModelClient.test.ts
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Only modify router if required to thread a narrow readiness client type later. Do not implement the UI surface here.

Do not modify:

```text
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required implementation

Add `project-readiness` route/client parity:

```text
pcc/projects/{projectId}/project-readiness
```

Add client method:

```ts
getProjectReadiness(...)
```

Ensure:

- fixture client returns deterministic model fixture envelope;
- backend client path remains explicit opt-in only;
- route path constants are inert strings where applicable;
- no new fetch callsites outside existing backend client implementation pattern;
- no default backend cutover;
- no direct Graph/PnP/SharePoint REST calls;
- no external runtime.

## Required tests

Prove:

- route path exists in route constants;
- fixture client returns `readOnly: true` readiness envelope;
- backend client constructs expected `project-readiness` path if backend client exists;
- opt-in tests still prove backend mode is not default;
- no broad additional fetch callsites are introduced;
- no prohibited runtime imports are introduced.

## Validation commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

Run models check if type exports needed adjustment:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
feat(spfx-pcc): add project readiness read-model client parity
```

## Commit body

```text
Adds SPFx PCC fixture/client parity for the Phase 3 Wave 8 Project Readiness Module Framework read model.

Extends route/client typing and deterministic fixture client behavior for the project-readiness envelope while preserving fixture-first default behavior and explicit backend opt-in posture.

No Project Readiness UI replacement, backend default cutover, direct Graph/PnP/SharePoint REST runtime, Procore runtime, external-system runtime, workflow execution, write behavior, package/dependency change, lockfile change, SPFx packaging, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- client methods/route constants added;
- explicit exclusions;
- remaining risks;
- recommended next prompt: Prompt 05.

---

# Prompt 05 — Project Readiness Center Shell and Framework Cards

## Role

You are an SPFx UI implementer and construction-operations UX reviewer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Replace/enhance the static Project Readiness preview surface with a framework-driven **Project Readiness Center** shell using Wave 8 readiness framework fixtures/client data.

Do not implement checklist execution, workflow actions, or backend default cutover.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Files to inspect

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
apps/project-control-center/src/layout/PccDashboardCard.tsx
apps/project-control-center/src/ui/PccPreviewState.tsx
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/tests/
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
```

## Files you may modify/create

Expected:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/shell/PccSurfaceRouter.tsx
```

Modify router only as required to pass read-model client to Project Readiness.

Do not modify:

```text
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required UX regions

Implement a flagship shell using existing PCC card/bento patterns. Minimum cards/regions:

1. **Readiness Hero**
   - active lifecycle gate;
   - overall posture;
   - blocker count;
   - evidence confidence;
   - source-health state;
   - preview/read-only badge.

2. **Lifecycle Gate Map**
   - gates from lead/pursuit through turnover/warranty;
   - status/posture per gate;
   - no interactive workflow execution.

3. **Readiness Domain Grid**
   - domain cards with posture, open items, blockers, evidence status.

4. **Blockers & Exceptions**
   - blocked/at-risk items;
   - due dates;
   - owner/accountable persona;
   - dependency/source-module label.

5. **Evidence & Source Health**
   - required/missing/satisfied evidence summaries;
   - source health warnings;
   - HB Document Control Center evidence-reference posture.

6. **Downstream Module Preview**
   - show Wave 9–14 as downstream modules plugging into framework;
   - mark downstream modules as preview/deferred when not implemented.

## Required copy posture

Use product-safe language:

- “Read-only readiness framework preview”
- “No workflow execution is enabled in Wave 8”
- “Evidence links are references only; HB Document Control Center remains the evidence source of record”
- “Checklist item libraries begin in Wave 9”
- “RACI remains Wave 11”

Do not say:

- “submit”
- “approve” as an executable command
- “upload”
- “sync”
- “write back”
- “complete checklist”
- “run workflow”

Unless those terms are clearly in disabled/inert explanatory copy.

## Required tests

Prove:

- Project Readiness Center renders active surface panel for `project-readiness`;
- hero shows read-only/no-execution posture;
- lifecycle gate map renders from fixture/client data;
- domain grid renders multiple domains;
- blocker/evidence/source-health sections render;
- Wave 9 is shown as downstream and not implemented in Wave 8;
- RACI is not shown as Wave 8 implementation;
- action chips/buttons are disabled/inert or absent;
- no prohibited runtime imports/calls are introduced.

## Validation commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
feat(spfx-pcc): render project readiness center framework shell
```

## Commit body

```text
Implements the Phase 3 Wave 8 Project Readiness Center framework shell in the PCC SPFx app.

Replaces the static readiness preview with read-only framework cards for lifecycle gates, readiness domains, blockers, evidence/source health, and downstream module posture using deterministic fixture/read-model data. Preserves fixture-first behavior, disabled/inert affordances, and clear Wave 9/Wave 11 boundaries.

No checklist-library implementation, workflow execution, approval execution, upload/download/sync, Graph/PnP/SharePoint REST runtime, Procore runtime, external-system writeback, backend default cutover, package/dependency change, lockfile change, SPFx packaging, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- UI regions implemented;
- explicit exclusions;
- remaining risks;
- recommended next prompt: Prompt 06.

---

# Prompt 06 — Ownership, Evidence, Blocker, Risk, Source-Health, and Priority Actions Preview Summaries

## Role

You are an SPFx UI hardening implementer and construction project-controls reviewer working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Harden the Project Readiness Center shell by improving ownership/accountability, evidence, blocker, risk, source-health, and Priority Actions preview summaries.

This prompt adds clarity and guardrail coverage. It must not implement executable actions.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Files to inspect

```text
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/priorityActions/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
```

## Files you may modify

Expected:

```text
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.tsx
apps/project-control-center/src/surfaces/projectReadiness/PccProjectReadinessSurface.module.css
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessViewModel.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.ts
apps/project-control-center/src/surfaces/projectReadiness/projectReadinessAdapter.test.ts
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
packages/models/src/pcc/fixtures/projectReadiness.ts
```

Modify model contracts only if a narrow missing display field is proven necessary; otherwise keep model changes out of this prompt.

Do not modify:

```text
backend/**
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required enhancements

Add/refine UI sections or card content for:

1. **Ownership & Accountability**
   - owner persona;
   - accountable persona;
   - reviewer persona;
   - unassigned gaps;
   - escalation posture.

2. **Evidence Readiness**
   - evidence required/satisfied/missing/waived/reference-only;
   - source-of-record explanation tied to HB Document Control Center;
   - no upload controls.

3. **Blocker and Risk Register Preview**
   - critical blockers;
   - due/overdue posture;
   - dependency/source module;
   - risk tag labels;
   - no mutation.

4. **Priority Actions Preview**
   - explain which readiness items would be eligible for Priority Actions later;
   - do not create/modify actual priority actions;
   - chips must be inert/disabled.

5. **Source Health / Degraded State**
   - render available, degraded, source-unavailable, backend-unavailable, missing-config, unauthorized/forbidden if fixture/client can represent them;
   - product-safe copy.

6. **Future-Wave Handoff**
   - clear labels for Wave 9 Lifecycle Readiness, Wave 10 Permit Log, Wave 11 RACI, Wave 12 Constraints, Wave 13 Buyout, Wave 14 Approvals.

## Required tests

Prove:

- ownership/accountability summary renders;
- missing owner or unassigned fixture state is handled;
- evidence summary renders without upload controls;
- blocker/risk preview renders;
- Priority Actions preview is inert and does not mutate actions;
- degraded/source-health states render safely;
- downstream waves remain deferred/preview;
- no forbidden labels imply live workflow execution.

## Validation commands

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
test(spfx-pcc): harden project readiness framework summaries
```

## Commit body

```text
Hardens the Phase 3 Wave 8 Project Readiness Center with ownership, evidence, blocker, risk, source-health, degraded-state, and Priority Actions preview summaries.

Adds or updates tests proving read-only rendering, inert/disabled action posture, evidence-reference-only behavior, downstream Wave 9–14 boundaries, and no mutation/runtime behavior.

No checklist execution, approval execution, workflow writes, priority-action mutation, upload/download/sync, Graph/PnP/SharePoint REST runtime, Procore runtime, external-system writeback, backend default cutover, package/dependency change, lockfile change, SPFx packaging, deployment, secrets, or app settings are introduced.
```

## Closeout response

Include:

- files changed;
- validation results;
- lockfile md5 before/after;
- summaries hardened;
- explicit exclusions;
- remaining risks;
- recommended next prompt: Prompt 07.

---

# Prompt 07 — Wave 8 Closeout Documentation and Final Validation

## Role

You are a closeout/documentation and validation agent working in:

```text
/Users/bobbyfetting/hb-intel
```

## Objective

Create/update Wave 8 closeout documentation and perform final targeted validation for the Project Readiness Module Framework implementation.

This prompt should not add new behavior unless a narrow defect is found while closing the wave.

## Mandatory preflight

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git log --oneline -20
md5 pnpm-lock.yaml
```

Record unrelated changes and do not stage them.

Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Preconditions

Verify Prompts 01–06 have landed or explicitly document which were skipped/deferred and why.

## Files to inspect

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/
apps/project-control-center/README.md
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/api/
apps/project-control-center/src/tests/
packages/models/src/pcc/ProjectReadinessFramework.ts
packages/models/src/pcc/PccReadModels.ts
packages/models/src/pcc/fixtures/projectReadiness.ts
backend/functions/src/hosts/pcc-read-model/
```

## Files you may modify

Expected:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Closeout.md
apps/project-control-center/README.md
```

Only modify source/test files if final validation reveals a narrow defect caused by Wave 8.

Do not modify:

```text
docs/architecture/plans/**
pnpm-lock.yaml
package.json
```

## Required closeout content

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-8/Wave_8_Closeout.md
```

Include:

1. Summary
2. Research-informed design basis
3. Files changed by prompt
4. Implementation slices completed
5. Shared model/read-model summary
6. Backend mock-provider/route summary, if implemented
7. SPFx client/fixture parity summary
8. Project Readiness Center shell summary
9. Ownership/evidence/blocker/risk/source-health summary
10. Validation results
11. Lockfile/package confirmation
12. Explicit exclusions
13. Remaining risks/operator-pending items
14. Wave 9 handoff notes
15. Recommended next prompt/wave

## Required explicit exclusions

Closeout must explicitly state that Wave 8 did **not** introduce:

- Wave 9 checklist library implementation;
- Startup/Safety/Closeout checklist execution;
- RACI implementation;
- Permit Log implementation;
- Constraints Log implementation;
- Buyout Log implementation;
- approval/workflow execution;
- scoring engine runtime;
- live Microsoft Graph file operations;
- PnP/SharePoint REST runtime;
- SharePoint list/library mutations;
- OneDrive folder creation runtime;
- Procore writeback/sync/mirror;
- Sage runtime/writeback;
- Adobe Sign execution;
- Document Crunch runtime;
- external-system writeback;
- tenant mutation;
- permission mutation;
- Power Automate flow;
- SPFx package/deployment change;
- package dependency changes;
- `pnpm-lock.yaml` changes;
- secrets/app settings changes;
- production rollout.

## Final validation commands

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
git diff --check
md5 pnpm-lock.yaml
git status --short
git diff --stat
```

Run lint where practical and document if skipped:

```bash
pnpm --filter @hbc/models lint
pnpm --filter @hbc/functions lint
pnpm --filter @hbc/spfx-project-control-center lint
```

## Staging

Explicit path staging only. Do not use `git add .`.

## Commit summary

```text
docs(pcc): close wave 8 readiness framework
```

## Commit body

```text
Closes Phase 3 Wave 8 for the Project Readiness Module Framework.

Documents the research-informed design basis, shared model/read-model contracts, deterministic fixtures, optional GET-only mock read-model route posture, SPFx fixture/client parity, Project Readiness Center shell, ownership/evidence/blocker/risk/source-health summaries, validation results, explicit no-runtime/no-mutation exclusions, and Wave 9 handoff.

No Wave 9 checklist-library implementation, RACI implementation, Permit Log, Constraints Log, Buyout Log, approval/workflow execution, scoring engine runtime, live Graph/PnP/SharePoint REST operation, Procore/Sage/Adobe/Document Crunch runtime, external-system writeback, tenant mutation, permission mutation, package/dependency change, lockfile change, SPFx packaging, deployment, secrets, app settings, or production rollout is introduced.
```

## Closeout response

Include:

- commit hash if committed;
- files changed;
- validation results;
- lockfile md5 before/after;
- explicit exclusions;
- remaining risks/operator-pending items;
- recommended next wave: Wave 9 Project Lifecycle Readiness Center.

---

## 7. Future-Wave Handoff Notes

### Wave 9 — Project Lifecycle Readiness Center

Wave 9 should consume Wave 8 framework contracts and implement the lifecycle readiness/checklist module using the existing startup, safety, and closeout checklist-definition files. Wave 9 should not re-create the framework vocabulary unless Wave 8 left a documented gap.

Wave 9 likely implementation areas:

- template item library seeded from Startup/Safety/Closeout definitions;
- project item instance state;
- source lineage to PDFs/checklist-definition files;
- role/action matrix;
- evidence policies;
- gate scoring/posture;
- safety recurring inspection posture;
- closeout-from-day-one views;
- item detail drawer;
- checklist-family-specific views/lenses;
- Priority Actions read-model integration;
- Approvals/Checkpoints posture.

### Wave 10 — Permit Log

Consume Wave 8 domains/gates/source-module vocabulary for permit/AHJ readiness signals. Permit detail ownership stays in Wave 10.

### Wave 11 — Responsibility Matrix / RACI

Consume Wave 8 ownership/accountability patterns, but implement RACI-specific rows, seeded responsibilities, editable assignments, and role authority in Wave 11.

### Wave 12 — Constraints Log

Consume Wave 8 blocker/dependency/severity posture, but implement constraint-specific workflows in Wave 12.

### Wave 13 — Buyout Log

Consume Wave 8 procurement/buyout readiness domain, but implement buyout detail in Wave 13.

### Wave 14 — Approvals / Checkpoints

Consume Wave 8 approval/acknowledgement posture, but implement execution of approval queues/checkpoints in Wave 14.

---

## 8. Risk Exposure

| Risk | Exposure | Mitigation in this package |
| --- | --- | --- |
| Wave 8 scope-lock currently excludes runtime implementation | Source work may violate docs | Prompt 01 authorization gate required before code |
| Wave 8 accidentally becomes Wave 9 checklist module | Scope creep and wrong UX | Strict no-checklist-library rule; Wave 9 handoff preserved |
| Readiness score hides blockers | Unsafe misleading posture | Blocker-first posture; confidence separate from completion |
| Evidence storage boundary blurred | Duplicates Document Control ownership | Evidence references only; Document Control remains source-of-record |
| Backend route addition breaks exact route-count tests | Test failure | Prompt 03 explicitly updates eight-route tests to nine |
| SPFx backend mode becomes default | Runtime risk | Prompt 04/05 preserve fixture-first default and opt-in backend path |
| Product copy implies executable workflow | User confusion | Required product-safe copy and inert/disabled affordances |
| Package/lockfile churn | Repo instability | No package/dependency edits allowed |
| Graph/SharePoint runtime sneaks in | Tenant/security/performance risk | Explicit forbidden imports/calls and guardrail tests |

---

## 9. Standards / Best Practices Alignment

Wave 8 implementation must align to:

- repo-truth-first execution;
- explicit prompt-level scope;
- deterministic fixtures;
- read-only envelope semantics;
- no broad `git add .`;
- explicit path staging;
- no package/lockfile churn;
- no live tenant mutation;
- no direct runtime integrations;
- SPFx fixture-first default behavior;
- PCC bento/card layout patterns;
- source/degraded-state product-safe copy;
- Wave 9–14 downstream ownership boundaries;
- construction-readiness practices informed by OSHA, CII, CMAA/AIA, and Microsoft governance guidance.

