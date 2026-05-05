# PCC System of Record Matrix

This document is the canonical PCC system-of-record authority. If other PCC architecture, roadmap, prompt-package, or schema documents conflict with this document, update the conflicting document or explicitly record an approved exception.

## Purpose

Define field-level system-of-record ownership boundaries across Procore, PCC, Sage Intacct, SharePoint/Microsoft 365, and external systems so implementation agents do not over-assign ownership to any single platform.

## System-of-Record Doctrine

PCC is the unified project operating layer. It may act as a system of record for PCC-native workflows that replace legacy Excel, PDF, email, or manual project-control processes.

Procore remains the system of record for Procore-native project-management data that is generated, owned, and maintained inside Procore tools. PCC must not duplicate, overwrite, or silently diverge from Procore-owned records. PCC may consume Procore data through backend-mediated integrations to create curated summaries, priority signals, readiness impacts, risk/exposure signals, evidence links, sync health records, and deep links back to Procore.

PCC is the system of record for workflows Procore does not generate or maintain, including Responsibility Matrix, Permit Log, Required Inspection Log where not generated in Procore, Constraints Log, Project Readiness records, PCC-native readiness/exposure records, and internal project-control governance records.

Sage Intacct remains the accounting book of record. Procore may provide operational project-management financial context where Procore owns the workflow, but PCC must not treat Procore financial summaries as official accounting truth where Sage owns the record.

## Definitions

- `Procore-native record`: record generated, owned, and maintained by Procore tools.
- `PCC-native record`: record originated and maintained by PCC workflow modules.
- `PCC-derived signal`: computed PCC interpretation from one or more source systems.
- `PCC evidence link`: PCC-owned reference/classification record to source evidence.
- `source lineage`: structured source attribution for provenance and conflict handling.
- `field-level system-of-record ownership`: ownership evaluated per field/record family, not by blanket platform claims.
- `accounting book of record`: official accounting truth source (Sage Intacct).
- `operational project-management record`: project-management execution data from tools such as Procore.
- `legacy workflow replacement`: PCC workflow replacing legacy workbook/PDF/email/manual controls.
- `curated summary`: user-facing synthesized snapshot from source systems.
- `object link`: pointer to source-system object, preserving source ownership.
- `read-only integration`: no source mutation from PCC.
- `backend-mediated Procore integration`: Procore access routed through backend services only.

## Matrix

### Project Identity / Setup

| Record / Data Domain                        | Primary System of Record               | Secondary / Supporting Source(s)        | PCC Role                                                             | Allowed PCC Write Behavior                                | Sync Direction                      | Conflict Rule                                     | Notes                                                                     |
| ------------------------------------------- | -------------------------------------- | --------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------- |
| Project Number / Accounting Project ID      | Sage Intacct / Accounting source       | Estimating handoff, PCC project profile | Display, route, map, validate                                        | PCC may store mapping/reference only                      | Sage/accounting -> PCC              | Accounting source wins                            | Used for site URL derivation, project identity, and cross-system mapping. |
| PCC Project Profile                         | PCC                                    | Sage, Procore, estimating handoff       | System of record for PCC project metadata not owned elsewhere        | PCC may create/update governed project profile fields     | PCC <-> supporting references       | Field-level owner wins                            | Separate project profile fields by owner.                                 |
| Procore Project Mapping                     | PCC                                    | Procore, PM/PX configuration            | System of record for mapping between PCC project and Procore project | PCC may create/update mapping configuration               | PCC config -> backend Procore reads | PCC mapping wins unless Procore project not found | PM primary owner; PX fallback; IT/integration admin repair.               |
| Project Site URL / SharePoint Site Identity | PCC / SharePoint provisioning contract | Accounting project number               | System of record for PCC site identity                               | PCC/provisioning may create/update approved metadata only | PCC provisioning -> SharePoint      | PCC provisioning contract wins                    | Must follow existing site URL derivation rules.                           |

### Procore-Native Project-Management Records

| Record / Data Domain                   | Primary System of Record           | Secondary / Supporting Source(s)                      | PCC Role                                                           | Allowed PCC Write Behavior                                                | Sync Direction                      | Conflict Rule                             | Notes                                                                       |
| -------------------------------------- | ---------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| RFIs                                   | Procore                            | PCC readiness/risk signals                            | Read, summarize, deep-link, derive actions/risks/readiness impacts | No PCC edits to Procore RFI in MVP                                        | Procore -> PCC curated summary      | Procore wins                              | PCC may store object links and derived signals only.                        |
| Submittals                             | Procore                            | Specs, commitments, PCC readiness                     | Read, summarize, deep-link, derive procurement/readiness impacts   | No PCC edits to Procore submittal in MVP                                  | Procore -> PCC curated summary      | Procore wins                              | PCC may identify overdue/blocked workflows.                                 |
| Submittal Packages / Register          | Procore where generated in Procore | Specifications, PCC startup/readiness                 | Read, summarize, deep-link                                         | No PCC write-back in MVP                                                  | Procore -> PCC                      | Procore wins                              | PCC may compare to startup/readiness requirements.                          |
| Drawings Managed in Procore            | Procore                            | SharePoint document libraries, PCC evidence links     | Read metadata, current revision, deep-link                         | No binary mirroring or revision control in PCC unless separately approved | Procore -> PCC metadata/object link | Procore wins for Procore-managed drawings | PCC may track evidence references and stale-revision signals.               |
| Specifications Managed in Procore      | Procore                            | SharePoint, submittals, PCC evidence links            | Read metadata, revision, related submittal/RFI signals             | No binary mirroring in MVP                                                | Procore -> PCC metadata/object link | Procore wins for Procore-managed specs    | Clarify per project if specs are SharePoint-controlled instead.             |
| Procore Documents / Files              | Procore                            | SharePoint Document Control Center                    | Deep-link and classify only                                        | No bulk file copy/mirror in MVP                                           | Procore -> PCC object link          | Procore wins for Procore-managed files    | PCC stores lineage, not binaries.                                           |
| Photos                                 | Procore                            | PCC evidence links, QA/QC records                     | Evidence reference, field context, deep-link                       | No bulk photo mirroring in MVP                                            | Procore -> PCC object link/summary  | Procore wins                              | PCC may reference photos as supporting evidence.                            |
| Daily Logs                             | Procore                            | PCC field operations summaries                        | Read, summarize, derive field-execution and risk signals           | No PCC edits to Procore daily logs in MVP                                 | Procore -> PCC curated summary      | Procore wins                              | PCC may track missing/late log signals.                                     |
| Manpower Entries                       | Procore where logged in Procore    | Staffing records, daily logs                          | Read and summarize trends                                          | No PCC edits in MVP                                                       | Procore -> PCC summary              | Procore wins                              | PCC may derive manpower trend/exposure signals.                             |
| Equipment / Deliveries / Visitors Logs | Procore where logged in Procore    | PCC field operations                                  | Read and summarize                                                 | No PCC edits in MVP                                                       | Procore -> PCC summary              | Procore wins                              | Use for field execution and exposure analytics.                             |
| Observations                           | Procore                            | PCC quality/safety/readiness                          | Read, summarize, derive action/readiness/risk signals              | No PCC edits in MVP                                                       | Procore -> PCC curated summary      | Procore wins                              | PCC may classify open/overdue observations.                                 |
| Inspections Generated in Procore       | Procore                            | PCC Inspection Readiness                              | Read, summarize, deep-link                                         | No PCC edits in MVP                                                       | Procore -> PCC summary              | Procore wins                              | If inspection is generated in PCC-native log, PCC owns that record instead. |
| Punch Items                            | Procore                            | PCC closeout/warranty                                 | Read, summarize, deep-link, derive turnover blockers               | No PCC edits in MVP                                                       | Procore -> PCC summary              | Procore wins                              | PCC may track closeout readiness impacts.                                   |
| Meetings / Minutes                     | Procore where managed in Procore   | PCC Meeting & Communication Center                    | Read, summarize, derive action commitments                         | No PCC edits in MVP                                                       | Procore -> PCC summary              | Procore wins                              | PCC may normalize action items into Action Center.                          |
| Tasks / Correspondence                 | Procore where managed in Procore   | PCC Action Center                                     | Read, summarize, derive action queue                               | No PCC edits in MVP                                                       | Procore -> PCC summary              | Procore wins                              | PCC may display user/company assignments.                                   |
| Coordination Issues / BIM Issues       | Procore where available            | Design coordination tools, PCC Drawing & Model Center | Read, summarize, derive coordination risk                          | No PCC edits in MVP                                                       | Procore -> PCC summary              | Procore wins                              | Validate licensed API availability before implementation.                   |

### Procore Operational Financial Records

| Record / Data Domain                                    | Primary System of Record                                          | Secondary / Supporting Source(s) | PCC Role                                          | Allowed PCC Write Behavior   | Sync Direction                                           | Conflict Rule                                                        | Notes                                                                     |
| ------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------- | ------------------------------------------------- | ---------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Commitments / Subcontracts / Purchase Orders in Procore | Procore operationally; Sage for accounting truth where applicable | Sage Intacct, PCC procurement    | Read, summarize, derive buyout/procurement status | No Procore write-back in MVP | Procore -> PCC summary; Sage -> PCC accounting reference | Field-level owner wins; Sage wins for accounting                     | Procore owns operational workflow; Sage owns accounting book.             |
| Commitment SOV                                          | Procore operationally                                             | Sage/accounting as applicable    | Read and summarize                                | No PCC edits in MVP          | Procore -> PCC summary                                   | Procore wins for Procore SOV; Sage wins for accounting posting       | Use for buyout/procurement visibility.                                    |
| Change Events                                           | Procore                                                           | RFIs, PCC risk/constraints, Sage | Read, summarize, derive exposure                  | No PCC edits in MVP          | Procore -> PCC exposure summary                          | Procore wins                                                         | PCC may connect to Constraints Log and risk signals.                      |
| Prime Contract Change Orders                            | Procore operationally; Sage/accounting as applicable              | Sage, owner contract docs        | Read and summarize                                | No PCC edits in MVP          | Procore/Sage -> PCC                                      | Field-level owner wins                                               | Official accounting/payment position remains Sage where applicable.       |
| Commitment Change Orders                                | Procore operationally; Sage/accounting as applicable              | Sage, commitments                | Read and summarize                                | No PCC edits in MVP          | Procore/Sage -> PCC                                      | Field-level owner wins                                               | Use for exposure and procurement status.                                  |
| Budget / Forecast in Procore                            | Procore operationally; Sage/accounting as applicable              | Sage, internal finance           | Read and summarize only                           | No PCC edits in MVP          | Procore/Sage -> PCC                                      | Sage wins for accounting; Procore wins for Procore operational state | PCC must label operational vs accounting values.                          |
| Invoices / Pay Applications                             | Procore where workflow occurs; Sage for accounting record         | Sage                             | Read and summarize status                         | No PCC edits in MVP          | Procore/Sage -> PCC                                      | Sage wins for accounting posting                                     | PCC may expose status, not official accounting truth unless Sage-sourced. |

### PCC-Native Legacy Workflow Replacements

| Record / Data Domain                                                     | Primary System of Record | Secondary / Supporting Source(s)                                        | PCC Role                                     | Allowed PCC Write Behavior                             | Sync Direction                                     | Conflict Rule                                                                    | Notes                                                                                       |
| ------------------------------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Responsibility Matrix                                                    | PCC                      | Procore Directory, contracts, owner requirements                        | Create, maintain, audit, report              | PCC may create/update governed records                 | PCC-native                                         | PCC wins                                                                         | Replaces Excel responsibility matrix workbooks. Procore may provide team/context only.      |
| Owner Contract Responsibility Matrix / Owner Contract Obligation Mapping | PCC                      | Owner contract documents, Document Crunch, SharePoint                   | Create, maintain, audit, report              | PCC may create/update governed records                 | PCC-native with evidence links                     | PCC wins for extracted/approved matrix records                                   | Must avoid legal-advice behavior; evidence links required.                                  |
| Permit Log                                                               | PCC                      | AHJ portals, Procore drawings/specs/photos as evidence                  | Create, maintain, audit, report              | PCC may create/update governed records                 | PCC-native; external launch/deep-link only         | PCC wins                                                                         | Procore does not generate HB permit log records.                                            |
| Required Inspection Log where not generated in Procore                   | PCC                      | AHJ, Procore inspections/photos/daily logs as evidence                  | Create, maintain, audit, report              | PCC may create/update governed records                 | PCC-native with optional Procore evidence          | PCC wins                                                                         | If inspection record is generated in Procore, Procore owns that specific inspection object. |
| Constraints Log                                                          | PCC                      | Procore RFIs/submittals/change events/daily logs as signals             | Create, maintain, audit, expose risk         | PCC may create/update governed records                 | PCC-native with Procore-derived supporting signals | PCC wins for constraint record; Procore wins for linked source object            | Replaces legacy constraints workbook.                                                       |
| Project Readiness Framework Records                                      | PCC                      | Procore signals, responsibility matrix, permits, inspections, documents | Create, maintain, aggregate                  | PCC may create/update readiness records                | PCC-native plus source-system reads                | PCC wins for readiness posture                                                   | Readiness may derive from Procore but is PCC-owned.                                         |
| Project Lifecycle Readiness Items                                        | PCC                      | Startup/safety/closeout checklists, Procore signals                     | Create, maintain, audit                      | PCC may create/update governed readiness items         | PCC-native                                         | PCC wins                                                                         | Replaces manual checklist governance.                                                       |
| Startup Checklist Records                                                | PCC                      | Procore project setup status, directory, drawings/specs                 | Create, maintain, audit                      | PCC may create/update governed records                 | PCC-native with Procore supporting data            | PCC wins                                                                         | Procore may validate supporting conditions but does not own checklist completion.           |
| Closeout Checklist Records                                               | PCC                      | Procore punch/submittals/docs/photos                                    | Create, maintain, audit                      | PCC may create/update governed records                 | PCC-native with Procore supporting data            | PCC wins                                                                         | Closeout readiness may be blocked by Procore-owned records.                                 |
| PCC Priority Actions                                                     | PCC-derived              | Procore, PCC-native modules, SharePoint, Sage                           | Normalize and display action queue           | PCC may create/update derived action records if stored | Derived multi-source                               | Source record wins; PCC action reflects current source state                     | Must preserve source lineage.                                                               |
| PCC Approval Checkpoints                                                 | PCC                      | Procore workflow references, PCC workflow records                       | Create, maintain, audit PCC approvals        | PCC may create/update governed approval checkpoints    | PCC-native                                         | PCC wins for PCC approvals                                                       | Must not imply Procore approval execution unless Procore owns that workflow.                |
| PCC Evidence Link Records                                                | PCC                      | Procore, SharePoint, Document Crunch, Adobe Sign, AHJ portals           | Store lineage/deep links/evidence references | PCC may create/update evidence-link records            | PCC-native links to source systems                 | Source object wins for source content; PCC wins for evidence-link classification | Do not mirror binaries unless separately approved.                                          |
| PCC Risk / Exposure Signals                                              | PCC-derived              | Procore, PCC-native constraints, project controls, readiness            | Create derived risk/exposure posture         | PCC may create/update derived signals                  | Derived multi-source                               | Source record wins; PCC risk classification is PCC-owned                         | Must distinguish fact source from PCC interpretation.                                       |
| HBI Assistant Grounding Records                                          | PCC-derived              | Procore, PCC, Sage, SharePoint, docs                                    | Summarize, reason, cite lineage              | PCC may store safe generated summaries if approved     | Derived multi-source                               | Cited source wins                                                                | Must not fabricate record ownership or legal/accounting conclusions.                        |

### SharePoint / Microsoft 365 Records

| Record / Data Domain              | Primary System of Record                             | Secondary / Supporting Source(s)              | PCC Role                                         | Allowed PCC Write Behavior                               | Sync Direction                 | Conflict Rule                                                          | Notes                                                      |
| --------------------------------- | ---------------------------------------------------- | --------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| SharePoint Project Site Structure | PCC provisioning contract / SharePoint               | Project profile, template package             | Host and enforce site structure                  | PCC/provisioning may create/update approved site objects | PCC provisioning -> SharePoint | PCC provisioning contract wins                                         | Site Health monitors drift.                                |
| SharePoint Document Libraries     | SharePoint/PCC Document Control                      | Procore documents, OneDrive, external systems | Store formal project records where HB owns files | PCC may manage approved library metadata/actions         | PCC/SharePoint-native          | SharePoint/PCC wins for SharePoint-managed files                       | Do not assume Procore owns documents stored in SharePoint. |
| OneDrive / My Project Files       | User-owned Microsoft 365 storage with PCC guardrails | PCC Document Control                          | Controlled access/deep-link lane                 | PCC may bind current project folder metadata only        | Microsoft 365 -> PCC binding   | Microsoft storage wins for file object; PCC wins for binding/guardrail | Must prevent cross-project/root browsing.                  |
| Teams Links / Channels            | Microsoft Teams                                      | PCC project profile                           | Link-out / collaboration context                 | PCC may store mapping only                               | Teams -> PCC mapping           | Teams wins for conversation content                                    | PCC does not own Teams messages.                           |
| Outlook Calendar Mapping          | Outlook / Exchange                                   | PCC project profile                           | Link-out / schedule context                      | PCC may store mapping only                               | Outlook -> PCC mapping         | Outlook wins for calendar item                                         | Detailed calendar integration is deferred unless approved. |

### External Systems

| Record / Data Domain            | Primary System of Record          | Secondary / Supporting Source(s)              | PCC Role                                                | Allowed PCC Write Behavior                         | Sync Direction                             | Conflict Rule                                                               | Notes                                                             |
| ------------------------------- | --------------------------------- | --------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Sage Accounting Records         | Sage Intacct                      | Procore operational financials, PCC summaries | Display official accounting references where integrated | No PCC accounting edits unless separately approved | Sage -> PCC                                | Sage wins                                                                   | Sage remains accounting book of record.                           |
| Compass / Prequalification Data | Compass                           | PCC procurement/subcontractor performance     | Future reference/summarization                          | Deferred                                           | Compass -> PCC future                      | Compass wins                                                                | Validate future integration.                                      |
| Document Crunch Analysis        | Document Crunch                   | SharePoint contracts/docs, PCC evidence links | Document analysis/reference                             | PCC may store references/outputs only if approved  | Document Crunch -> PCC derived references  | Source document and approved extracted record rules apply                   | Avoid legal-advice behavior.                                      |
| Adobe Sign Agreements           | Adobe Sign                        | SharePoint/PCC contract records               | E-signature status/deep link                            | PCC may store mapping/status only                  | Adobe Sign -> PCC                          | Adobe Sign wins for signature transaction                                   | Contract record ownership depends on source document system.      |
| Cupix / Reality Capture         | Cupix                             | PCC field/drawing/model centers               | Future visual evidence/deep link                        | Deferred unless approved                           | Cupix -> PCC future                        | Cupix wins for capture object                                               | Luxury residential relevance noted; validate later.               |
| AHJ Portals                     | AHJ portal / government authority | PCC Permit/Inspection records                 | Launch/deep-link/supporting status where available      | PCC does not write to AHJ portals in MVP           | AHJ reference -> PCC manual/native records | AHJ wins for official jurisdiction status; PCC wins for internal permit log | AHJ integration is launcher/reference only unless later approved. |

## Sync and Ownership Rules

- No universal system-level ownership claims are allowed; ownership must be declared per record family/field.
- Read-only integration is default unless explicit approved write behavior exists.
- PCC may store curated summary, object link, and derived records, but ownership of linked source objects remains with the source system.
- Sage accounting values and Procore operational financial values must be labeled distinctly.

## Procore Integration Implications

- Procore owns Procore-native records only.
- All Procore integration remains backend-mediated and read-only in MVP.
- PCC must preserve source lineage for any Procore-derived signal.
- PCC must not implement Procore write-back, full mirror, or direct SPFx-to-Procore behavior in MVP.

## PCC-Native Workflow Implications

- PCC is system of record for legacy workflow replacements not generated/maintained by Procore.
- This includes Responsibility Matrix, Permit Log, Required Inspection Log (where not generated in Procore), Constraints Log, Project Readiness records, PCC Evidence Links, PCC Priority Actions, and PCC Risk/Exposure Signals.

## Record-Owner vs Evidence-Source Rules

- A Procore RFI linked to a PCC Constraint is evidence/supporting context.
- The PCC Constraint record remains PCC-owned.
- The linked Procore RFI remains Procore-owned.
- This distinction applies to all cross-system evidence links.

## Source Lineage Minimum for PCC-Derived Procore Signals

Any PCC-derived signal from Procore must store:

- source system,
- source object type,
- source object ID,
- source URL/deep link where allowed,
- sync timestamp,
- owning source-of-record.

## Conflict-Resolution Rules

- Field-level owner wins.
- For accounting truth conflicts, Sage wins.
- For Procore-native object conflicts, Procore wins.
- For PCC-native workflow record conflicts, PCC wins.
- For derived PCC signals, cited source record wins on source facts; PCC owns interpretation/classification.

## Guardrails

- Documentation/schema-description update only.
- No runtime Procore API calls.
- No dependencies or lockfile changes.
- No secrets/tenant IDs/tokens/credentials.
- No Procore write-back.
- No direct SPFx-to-Procore behavior.
- Preserve no-full-Procore-mirror posture.

## Future Implementation Requirements

- Every future PCC module must declare field-level system-of-record ownership before implementation.
- Every cross-system record must declare lineage requirements and conflict rules.
- Any exception to this matrix must be explicitly approved and documented.

## Validation Checklist

- Matrix includes all prompted domains and ownership rows.
- Procore-native ownership is scoped to Procore-native records only.
- PCC-native ownership is explicit for legacy workflow replacements.
- Sage accounting ownership remains explicit.
- Evidence-link and derived-signal lineage rules are explicit.
- Cross-document references align to this canonical matrix.

## Supersession Note

This matrix supersedes broad prior wording in older planning/closeout docs unless an approved exception is documented. Historical closeouts do not need to be rewritten unless they are actively misleading.

## Unified Lifecycle Doctrine Alignment (2026-05-03)

This matrix is aligned to [`Unified_PCC_Lifecycle_Objective_Architecture.md`](./Unified_PCC_Lifecycle_Objective_Architecture.md) and supporting doctrine documents for lifecycle spine, memory, lenses, traceability, warranty trace mode, and HBI grounding.

Additional interpretation rules:

- Work centers and workflow modules define governance placement and signal-rollup behavior, not departmental workspace boundaries.
- Constraints Log and Buyout Log may have governance affinity in risk/issues/decision and procurement/buyout contexts while contributing Project Readiness signals; this is a lineage-preserving rollup pattern, not ownership duplication.
- Cross-stage traceability and cross-project knowledge reuse remain permission-filtered and must not leak restricted information.

## Unified Lifecycle Developer Contracts Cross-Reference

Implementation and future changes for unified lifecycle behavior MUST align with the developer contracts in `docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/`, including bounded-context ownership, route taxonomy and forbidden routes, record state machines, field-level dictionary, permission/redaction resolution, HBI citation/refusal contract, source-system integration contracts, audit-event model, degraded-state matrix, module onboarding template, and validation/test gates.

This reference is documentation governance only. It does not assert production/live tenant readiness and does not authorize runtime/source-system mutations.

## Authority and Execution Overlay (Wave 13 Procore Data Layer)

Active machine-readable execution authority path:
`docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-13/procore-data-layer-roadmap-update/artifacts/`

Execution distinction lock:

- Wave 13 `Buyout Log` remains the active module wave in the Phase 3 sequence; this section does not alter system-of-record ownership rows.
- Wave `13A-13F` is a cross-cutting Procore data-layer execution overlay that governs integration posture and lineage framing across modules.
- `wave-99-procore/_doc-updates` is prior planning context only and is non-authoritative for active execution.

Runtime gate lock:

- No live Procore runtime is authorized by this matrix addendum before 13A-13F completion and a separate live-read proof gate.

## Phase 14 Authority Addendum (2026-05-04)

Wave 14 authority path is `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-14/`.

Phase 14 / Wave 14 is the PCC-native approval/checkpoint control layer and owns checkpoint queue semantics, route-step semantics, decision semantics, audit-event semantics, and decision-history semantics.

Boundary lock:

- Source modules retain ownership of underlying workflow records.
- Procore retains ownership of Procore-native records.
- Sage remains accounting book-of-record owner.
- SharePoint/Document Control remain file/document storage owners where applicable.
- HBI has citation/summarization rights only and no decision authority.
- Power Automate remains reference-only for MVP posture.
- No external writeback and no tenant/list/group/security mutation are authorized by this addendum.

Wave relationship lock:

- Wave 13G remains Estimating Workbench feature authority.
- Phase 14 governs estimating-related checkpoint queue/routing/decision/audit semantics.

## Wave 15 External Systems Launch Pad Addendum (2026-05-05)

Wave 15 authority path is `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/`.

Prompt-03 architecture lock:

- User-facing feature is `External Systems Launch Pad`.
- Internal module/domain posture is `External Systems`.
- SOR/source-lineage posture is defined in Wave 15 architecture narrative docs, not solely in JSON artifacts.
- `launcher_type_registry.json` is a launch-type taxonomy contract only and is not the complete external-system registry or SOR catalog.
- `external_system_degraded_state_matrix.json` (when referenced) is architecture-level behavior boundary only and is not full UX/degraded-state implementation guidance.

Doctrine lock:

- No-writeback.
- No-sync.
- No-mirror.
- No tenant/list/group/security mutation is authorized by this addendum.
- No live external-system integration execution is authorized by this addendum.

Wave alignment lock:

- Wave 13 Procore dependency posture remains authoritative for Procore data-layer boundaries.
- Wave 14 remains the mapping-correction/checkpoint route-step/decision/audit authority layer.

## Wave 16 Control Center Settings SOR Cross-Reference Addendum (2026-05-05)

Wave 16 authority path is `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-16/`.

Cross-reference lock:

- Wave 16 settings architecture uses this matrix as the canonical SOR source for ownership boundaries.
- Global defaults/policy settings remain HBCentral-governed; project effective values, approved overrides, workflow, validation, audit, and health artifacts remain PCC project-site governed per canonical schema contracts.
- Source module ownership remains unchanged: Project Home, Priority Actions, Approvals/Checkpoints, Site Health, Admin Review, External Systems, Team & Access, and HBI keep their established boundaries while integrating with settings surfaces.
- This addendum is registration/cross-reference only and does not modify prior Wave 1-15 ownership doctrine.
