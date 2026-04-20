# P3-E15-T07 — Submittal Completeness Advisory

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E15-T07 |
| **Parent** | [P3-E15 QC Module Field Specification](P3-E15-QC-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T07 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Purpose, Boundary, and Anti-Goals

The Submittal Completeness Advisory is a QC advisory capability inside Project Hub. Its job is narrowly defined:

1. answer whether a product/material/system package is complete against governed QC expectations and project/spec overlays,
2. answer whether included documents appear to be the latest versions available from manufacturer or official publisher sources,
3. publish downstream QC guidance, inspection expectations, best-practice packets, and readiness signals once advisory status is acceptable.

This capability is not a submittal workflow, approval, routing, or review tool.

### 1.1 What this feature owns

- `SubmittalItemRecord` as the QC advisory identity for a product/material/system item.
- package inventory metadata and official-source comparison references.
- governed verdict issuance and revision history.
- conflict/recheck advisories when later official sources differ from the approved project basis.
- downstream activation of QC plans, control expectations, and readiness guidance.

### 1.2 What this feature does not own

- formal submittal routing, ball-in-court, or review assignments,
- design approval workflow,
- owner, architect, consultant, or trade collaboration portals,
- package file storage, preview, or document editing,
- replacement of the project document system or future shared Documents shell,
- generation of formal acceptance of the submittal itself.

Package files remain in the governed document/submittal system. QC stores metadata, references, extracted inventory, comparison results, verdicts, exceptions, and drift alerts only.

### 1.3 Relationship to formal submittal workflow

The formal submittal workflow answers questions such as who submitted, who reviews, who approved, and what the official disposition is. This QC advisory feature answers different questions:

- Is the package complete for quality-critical QC use?
- Are the package contents current against official sources?
- What downstream QC plans, inspections, and readiness expectations should activate from this item?

The advisory may consume package references from the submittal/document system and may later consume canonical Procore references, but it does not become the system of workflow record.

---

## 2. Governing Rules

The following rules are locked for Phase 3:

1. Coverage originates from governed HB baseline plus project/spec overlays.
2. Governed document-family taxonomy plus product-specific requirement logic defines what is expected.
3. Current-version checks may use manufacturer or official publisher sources only.
4. `SubmittalItemRecord` is the primary record and must link to a project spec section/subsection and a package reference.
5. In Phase 3 manual-native mode, every item requires a current document-system package link/reference.
6. In future integrated mode, a canonical Procore submittal link/reference is added and auto-assigned where possible.
7. QC stores metadata and inventory references only, not package binaries.
8. Inventory capture may be assisted, but the owner must confirm before inventory becomes authoritative.
9. `AdvisoryVerdict` is multi-axis and must evaluate package completeness, document currentness, reference-match confidence, and manual-review-required.
10. Currentness statuses are exactly `current`, `outdated`, and `unable-to-verify`.
11. `unable-to-verify` forces manual review.
12. Two-stage activation is required:
   - preliminary guidance at item creation,
   - full package-dependent activation only after acceptable advisory status or approved exception.
13. Approved project basis remains governing after acceptance. Later official-source conflict creates a recheck advisory, not silent basis mutation.
14. Ongoing watch and `VersionDriftAlert` behavior is required for accepted or conditionally accepted items.
15. The feature is internal-only in Phase 3.

---

## 3. Object Vocabulary and Record Family Model

This document extends the locked record vocabulary from [P3-E15-T03](P3-E15-T03-Record-Families-Authority-and-Data-Model.md). The following records are first-class for this workflow area.

### 3.1 Record-family overview

| Record | Role | Authority posture |
|---|---|---|
| `SubmittalItemRecord` | Persistent QC advisory item for a product/material/system | QC-authoritative advisory identity |
| `SubmittalRevisionHistoryEntry` | Immutable revision/resubmittal history per advisory cycle | QC-authoritative audit lineage |
| `DocumentInventoryEntry` | Confirmed package inventory row for a required or received document family | QC-authoritative metadata ledger |
| `OfficialSourceReferenceEntry` | Official manufacturer/publisher comparison reference | QC-authoritative comparison evidence reference |
| `AdvisoryVerdict` | Multi-axis evaluation result and rollup | QC-authoritative governed verdict |
| `DownstreamQcActivationMapping` | Deterministic activation result for plans, packets, inspections, and readiness signals | QC-authoritative downstream mapping |

### 3.2 `SubmittalItemRecord`

| Field | Rule |
|---|---|
| `submittalItemId` | Immutable UUID |
| `projectId` | Required |
| `workPackageRef` | Required where work-package context exists; uses shared work-package reference model |
| `itemType` | Required; `product`, `material`, or `system` |
| `itemTitle` | Required human-readable title |
| `manufacturerName` | Required when manufacturer-governed item; nullable only when official publisher is not a manufacturer |
| `productModelOrSeries` | Nullable but strongly expected when available |
| `specLinkRef` | Required; must use governed section + subsection anchor, not free text only |
| `packageLinkRef` | Required; manual-native Phase 3 package reference |
| `procoreSubmittalLinkRef` | Null in Phase 3 manual-native mode; populated in integrated mode where possible |
| `approvedProjectBasisRef` | Nullable until an accepted advisory cycle establishes the governing project basis |
| `defaultOwnerRole` | Required; defaults to PM / PE / Project Engineer / submittal-admin side |
| `defaultOwnerAssignment` | Required role assignment; person optional |
| `activationStage` | Required; `preliminary-guidance` or `package-dependent-activation` |
| `currentAdvisoryStatus` | Required status pointer to latest accepted or pending verdict posture |
| `highRiskFlag` | Required boolean derived from governed mapping/project overlay |
| `createdFrom` | Required provenance: manual, import-assisted, or integrated reference creation |
| `supersededBySubmittalItemId` | Nullable; used when item identity is replaced rather than revised |

### 3.3 `SubmittalRevisionHistoryEntry`

| Field | Rule |
|---|---|
| `submittalRevisionHistoryEntryId` | Immutable UUID |
| `submittalItemId` | Parent linkage |
| `revisionSequence` | Required monotonic integer |
| `revisionReason` | Required; resubmittal, package-update, official-source-change, overlay-change, exception-change, owner-correction |
| `priorPackageLinkRef` | Nullable |
| `newPackageLinkRef` | Nullable |
| `inventoryChangeSummary` | Required summary of added/removed/reclassified documents |
| `priorVerdictRef` | Nullable |
| `newVerdictRef` | Nullable |
| `changedBy` | Required |
| `changedAt` | Required timestamp |
| `notes` | Optional but auditable |

### 3.4 `DocumentInventoryEntry`

| Field | Rule |
|---|---|
| `documentInventoryEntryId` | Immutable UUID |
| `submittalItemId` | Parent linkage |
| `documentFamily` | Required governed taxonomy code |
| `requirementKey` | Required governed/product-specific requirement key |
| `title` | Required |
| `manufacturerOrOfficialPublisher` | Required |
| `documentIdentifier` | Nullable; required where available |
| `revisionEditionIssueNumber` | Nullable; required where available |
| `publicationOrRevisionDate` | Nullable; required where available |
| `sourceLinkReference` | Required reference to package or official source location |
| `packageIncludedFlag` | Required boolean |
| `officialSourceMatchFlag` | Required boolean when compared; null only before comparison |
| `officialSourceMatchConfidence` | Required confidence band when compared |
| `conditionalStatus` | Required; see §8 |
| `currentnessStatus` | Required; `current`, `outdated`, or `unable-to-verify` |
| `inventoryConfirmationState` | Required; `draft-extracted`, `owner-confirmed`, `review-confirmed`, `superseded` |
| `comparisonReferenceId` | Nullable link to `OfficialSourceReferenceEntry` |
| `manualReviewRequired` | Required boolean |
| `notes` | Optional audit note |

### 3.5 `OfficialSourceReferenceEntry`

| Field | Rule |
|---|---|
| `officialSourceReferenceEntryId` | Immutable UUID |
| `submittalItemId` | Parent linkage |
| `documentFamily` | Required |
| `officialPublisherName` | Required |
| `officialSourceType` | Required; manufacturer site, manufacturer portal, listed certifier, or official standards publisher |
| `officialDocumentTitle` | Required |
| `officialDocumentIdentifier` | Nullable but required where available |
| `officialRevisionEditionIssueNumber` | Nullable but required where available |
| `officialPublicationOrRevisionDate` | Nullable but required where available |
| `officialSourceLinkReference` | Required |
| `captureMethod` | Required; manual-reference, assisted-reference, or integrated-reference |
| `comparisonConfidence` | Required |
| `capturedAt` | Required |
| `capturedBy` | Required |
| `supersedesReferenceId` | Nullable when later official source replaces prior comparison reference |

### 3.6 `AdvisoryVerdict`

| Field | Rule |
|---|---|
| `advisoryVerdictId` | Immutable UUID |
| `submittalItemId` | Parent linkage |
| `evaluationSequence` | Required monotonic integer |
| `packageCompleteness` | Required governed result |
| `documentCurrentness` | Required governed result |
| `referenceMatchConfidence` | Required governed confidence result |
| `manualReviewRequired` | Required boolean |
| `manualReviewReasonCodes` | Required when manual review is true |
| `acceptedForActivation` | Required boolean |
| `acceptedByException` | Required boolean |
| `rollupRationale` | Required concise evaluation summary |
| `evaluatedAt` | Required |
| `evaluatedBy` | Required evaluator or service actor |
| `governedRulesetVersion` | Required |
| `projectOverlayVersion` | Nullable but required when project overlay participated |

### 3.7 `DownstreamQcActivationMapping`

| Field | Rule |
|---|---|
| `downstreamQcActivationMappingId` | Immutable UUID |
| `submittalItemId` | Parent linkage |
| `verdictRef` | Required |
| `activationStage` | Required |
| `qualityPlanRequirements` | Required set of plan sections/checkpoints activated |
| `bestPracticePackets` | Required list of governed or project packets to attach |
| `inspectionExpectations` | Required list of inspections, tests, hold points, or witness points activated |
| `readinessSignals` | Required list of readiness effects and gating implications |
| `exceptionDependencies` | Nullable approved exception requirements that gate full activation |
| `publishedAt` | Required |
| `publishedBy` | Required actor |

---

## 4. Document-Family Taxonomy and Requirements Logic

### 4.1 Governed taxonomy model

The advisory engine must use a governed document-family taxonomy, not project-local free text. Each family must support:

- a stable family code,
- governed display label,
- applicability logic,
- minimum metadata expectations,
- currentness comparison strategy,
- downstream QC meaning,
- allowed conditional statuses,
- minimum evidence requirements for acceptance.

### 4.2 Minimum governed family classes

This document does not hard-code every future family, but Phase 3 must support the following minimum classes for governed quality-critical coverage:

| Family class | Typical examples | Downstream QC significance |
|---|---|---|
| Product data / technical data | product data sheet, technical bulletin | baseline product characteristics, installation parameters |
| Installation requirements | installation instructions, manufacturer procedures | installation sequencing, hold points, inspection expectations |
| Detail / configuration guidance | manufacturer details, diagrams, assemblies | detail-specific quality checkpoints |
| Performance / certification evidence | listing, testing, compliance certificate | code, quality, and acceptance readiness |
| Finish / selection confirmation | finish card, schedule match, approved color/texture | finish acceptance and mockup verification |
| Operations / warranty reference | warranty sheet, maintenance guidance | turnover-quality continuity and approved basis traceability |
| Equivalent / substitution basis | approved equivalent reference, accepted alternate basis | exception-conditioned downstream activation |

### 4.3 Governed requirements logic

Each `SubmittalItemRecord` must resolve a requirement set from:

1. governed HB baseline,
2. governed product-specific requirement logic,
3. project/spec overlays,
4. approved exceptions.

Project/spec overlays may:

- add required families,
- tighten minimum metadata expectations,
- add higher-risk downstream QC activations,
- refine applicability logic.

Project/spec overlays may not:

- delete mandatory quality-critical baseline requirements,
- override official-source-only currentness rules,
- silently waive incomplete package conditions.

### 4.4 Taxonomy to evidence-family matrix

| Document family concern | Minimum evidence expectation | Advisory use |
|---|---|---|
| Product data / technical data | package inventory reference + official-source comparison reference | completeness + currentness |
| Installation requirements | package inventory reference + official-source comparison reference | completeness + downstream activation |
| Detail / configuration guidance | package inventory reference; official-source comparison where official version exists | completeness + reference-match confidence |
| Performance / certification evidence | package inventory reference + official certifier/manufacturer source reference | completeness + currentness + manual review trigger |
| Finish / selection confirmation | package inventory reference + spec/project-basis anchor | completeness + approved-basis alignment |
| Operations / warranty reference | package inventory reference; official-source comparison where versioned | completeness + turnover continuity |
| Equivalent / substitution basis | package inventory reference + approved exception linkage | completeness + exception-conditioned activation |

---

## 5. Spec Overlay Model and Project-Spec Anchoring

Every `SubmittalItemRecord` must be anchored to the project specification. Free-form descriptive linkage is insufficient.

### 5.1 Required spec anchor

`specLinkRef` must capture:

- spec section,
- subsection or paragraph where available,
- spec title,
- governing package/scope context,
- overlay source when project overlay adds or modifies advisory expectations.

### 5.2 Overlay resolution order

1. governed enterprise baseline,
2. governed discipline/product requirement logic,
3. project spec section/subsection anchor,
4. approved project overlay,
5. approved exception or approved equivalent basis.

### 5.3 Governing rule

No advisory item may reach `package-dependent-activation` without a valid spec anchor unless a centrally governed exception explicitly allows non-spec-driven treatment for that item class.

---

## 6. Package-Link Model and Future Procore Integration

### 6.1 Phase 3 manual-native mode

In Phase 3, `packageLinkRef` is required on every `SubmittalItemRecord` and must point to the current document/submittal-system package reference. This may be a document-system URL, identifier, or governed reference handle, but it must be stable enough to support:

- owner confirmation,
- inventory extraction,
- later recheck,
- revision lineage,
- deep link from QC back to the package location.

### 6.2 Future integrated mode

When Procore integration exists:

- `procoreSubmittalLinkRef` becomes the canonical external workflow reference where possible,
- the system may auto-assign that reference from integration mapping,
- `packageLinkRef` may still persist as a supporting document-system reference where needed,
- QC continues to own advisory identity, verdict logic, activation mapping, and drift handling.

Future integration changes the reference seam, not the QC authority model.

### 6.3 Document-system boundary

This feature must align with [04_Phase-3_Unified-Documents-Enabling-Plan.md](04_Phase-3_Unified-Documents-Enabling-Plan.md):

- no package binaries are copied into QC,
- no raw Graph file operations are introduced outside `@hbc/sharepoint-docs`,
- QC stores link/reference metadata only,
- direct document deep links and raw-library fallback remain document-system concerns, not QC-owned storage concerns.

---

## 7. Assisted Extraction and User Confirmation Workflow

### 7.1 Workflow sequence

1. Owner creates or updates `SubmittalItemRecord`.
2. Owner provides spec anchor, package reference, and item identity.
3. System resolves governed document-family requirements and publishes preliminary guidance.
4. System may perform assisted extraction of candidate package inventory rows.
5. Owner reviews and confirms, edits, adds, or suppresses extracted draft rows according to governed rules.
6. Confirmed rows become authoritative `DocumentInventoryEntry` records.
7. Official-source comparison references are attached or captured.
8. Governing evaluation creates `AdvisoryVerdict`.
9. Acceptable verdict or approved exception activates package-dependent downstream QC mapping.

### 7.2 Extraction governance

Assisted extraction may help with:

- candidate document title capture,
- candidate family classification,
- version/date extraction,
- identifier extraction,
- title-to-official-source comparison hints.

Assisted extraction may not:

- auto-accept inventory without owner confirmation,
- auto-classify an item into `current` when source confidence is insufficient,
- auto-waive missing required families,
- replace approved project basis without governed recheck flow.

### 7.3 `@hbc/ai-assist` posture

Future `@hbc/ai-assist` use may accelerate extraction, title matching, and official-source comparison suggestion. Phase 3 must remain fully operable without it:

- deterministic/manual entry and confirmation remains the baseline workflow,
- any future AI assistance must flow through the shared `@hbc/ai-assist` package,
- no T07 behavior may depend on Azure AI availability to function correctly.

---

## 8. Conditional Status and Incomplete Package Logic

Conditional status expresses why a document family is not presently a straightforward received/current record.

### 8.1 Allowed conditional statuses

| Conditional status | Meaning | Allowed effect |
|---|---|---|
| `received` | Required document is present in package inventory | eligible for currentness evaluation |
| `missing` | Required document is not present | completeness deficiency |
| `not-applicable` | Governed logic or approved evaluation determined the family does not apply | not counted as missing |
| `deferred-later-phase` | Required family is not yet due because this item has phased applicability | prevents final completeness for later-phase activation but may allow preliminary posture |
| `replaced-by-approved-equivalent` | Required family is satisfied by approved equivalent basis | requires approved equivalent linkage |
| `waived-by-approved-exception` | Missing or alternate family is accepted under approved exception | requires linked `AdvisoryException` / `DeviationOrWaiverRecord` |

### 8.2 Governing use

- `missing` always degrades package completeness.
- `not-applicable` requires governed applicability logic or approved reviewer ruling.
- `deferred-later-phase` may support preliminary guidance but blocks the specific later-phase downstream activation it relates to.
- `replaced-by-approved-equivalent` and `waived-by-approved-exception` require linked approved records and cannot be self-declared by the owner.

---

## 9. Advisory Decision Model

### 9.1 Evaluation prerequisites

An `AdvisoryVerdict` may be issued only when:

- `SubmittalItemRecord` has valid identity and spec anchor,
- required package reference exists,
- inventory rows are owner-confirmed,
- official-source comparisons have been attempted for all required currentness-sensitive families,
- exception references are linked where conditional statuses rely on them.

### 9.2 Verdict axes

| Axis | Purpose | Minimum outputs |
|---|---|---|
| `packageCompleteness` | Are required families present, deferred with justification, or exception-backed? | complete, complete-with-conditions, incomplete |
| `documentCurrentness` | Do compared documents appear current against official sources? | current, mixed, outdated, unable-to-verify-rollup |
| `referenceMatchConfidence` | How strong is the match between package documents and official sources? | high, medium, low |
| `manualReviewRequired` | Must a human reviewer interpret unresolved ambiguity? | true or false, plus reason codes |

### 9.3 Currentness rules

Each `DocumentInventoryEntry` must use one and only one of:

- `current`
- `outdated`
- `unable-to-verify`

`unable-to-verify` is mandatory when:

- no manufacturer or official publisher source can be confirmed,
- metadata is insufficient to compare confidently,
- official source is inaccessible or non-versioned in a way that prevents reliable comparison,
- document family rules require human technical interpretation.

Any `unable-to-verify` result sets `manualReviewRequired = true` at verdict level.

### 9.4 Acceptable verdict posture

Package-dependent activation may proceed only when one of the following is true:

1. verdict is acceptable under governed thresholds with no blocking missing/outdated families, or
2. an approved exception explicitly allows activation despite incompleteness/currentness deficiency.

---

## 10. Currentness Conflict and Recheck Logic

### 10.1 Approved project basis rule

Once an advisory cycle is accepted, the approved project basis becomes the governing QC basis for downstream activation. Later official-source changes do not automatically replace that basis.

### 10.2 Conflict/recheck triggers

| Trigger | Required next action |
|---|---|
| Newer official source detected after basis acceptance | Create `VersionDriftAlert`; flag item for recheck |
| Official source contradicts accepted package document | Create conflict advisory; require manual review or approved exception |
| Official source unavailable after prior current result | Preserve approved basis; set watch state to `manual-recheck-needed` |
| Project overlay changes requirement family list | Re-evaluate item and issue new verdict sequence |
| Approved equivalent/exception expires | Recheck affected family and downstream activation |

### 10.3 Governing rule

Conflict and recheck behavior must:

- preserve approved-basis auditability,
- show the distinction between approved basis and later official source,
- avoid silent mutation of accepted downstream QC activations,
- create explicit advisory/recheck work rather than hidden status churn.

---

## 11. Ongoing Watch and `VersionDriftAlert` Behavior

Accepted or conditionally accepted items remain on watch while they are operationally relevant to QC.

### 11.1 Watch model

Watch applies to:

- accepted advisory items,
- items active through pre-punch / turnover-quality readiness,
- items with manufacturer/publisher content likely to rev during the project lifecycle.

### 11.2 Drift alert outcomes

`VersionDriftAlert` must capture:

- item identity,
- affected family,
- prior approved basis,
- newer official-source reference,
- detected delta summary,
- urgency/risk class,
- required next action,
- downstream readiness impact.

### 11.3 Drift handling rule

Drift alerts may:

- require recheck before certain inspections or readiness milestones,
- generate follow-up QC issue or action when governed mapping requires it,
- publish a readiness warning to downstream QC surfaces.

Drift alerts do not:

- auto-close an accepted basis,
- auto-mark the item outdated without governed re-evaluation,
- rewrite plan/gate logic without a fresh advisory or approved exception path.

---

## 12. Downstream Mapping Into QC Plans, Inspections, Packets, and Readiness

The advisory engine is not an end in itself. It exists to activate the right QC content.

### 12.1 Two-stage activation model

| Stage | Trigger | Output |
|---|---|---|
| `preliminary-guidance` | `SubmittalItemRecord` created with valid spec anchor and requirement resolution | early best-practice packet suggestions, likely plan sections, likely inspections/tests, early readiness signals |
| `package-dependent-activation` | acceptable `AdvisoryVerdict` or approved exception | active quality-plan checkpoints, required control gates, inspection/test expectations, readiness publication, downstream obligations |

### 12.2 Mapping outputs

`DownstreamQcActivationMapping` must be able to activate:

- `WorkPackageQualityPlan` sections and checkpoints,
- governed best-practice packets,
- inspections, tests, hold points, witness points, or preinstallation meetings,
- readiness signals shown in Project Hub and consumed by downstream field leadership,
- follow-on QC obligations where missing/currentness problems require monitoring.

### 12.3 Relationship to T04, T05, and T06

- [P3-E15-T04](P3-E15-T04-Quality-Plans-Reviews-and-Control-Gates.md) consumes activated plan sections, gates, and review expectations.
- [P3-E15-T05](P3-E15-T05-Issues-Corrective-Actions-and-Work-Queue-Publication.md) governs any spawned `QcIssue` or downstream obligation created from advisory deficiencies, rechecks, or drift alerts.
- [P3-E15-T06](P3-E15-T06-Deviations-Evidence-and-External-Approval-Dependencies.md) governs exceptions, evidence minimums, and external approval dependencies that can affect advisory acceptance.

---

## 13. Ownership, Permissions, and Auditability

### 13.1 Lane ownership

| Concern | Default owner | Notes |
|---|---|---|
| Item creation and package reference hygiene | PM / PE / Project Engineer / submittal-admin side | default operational owner |
| Inventory confirmation and metadata correction | PM / PE / Project Engineer / submittal-admin side | may delegate data entry, not governing accountability |
| High-risk interpretation / challenge | Quality Control Manager | required for governed high-risk cases |
| Downstream consumption of activated QC guidance | Superintendent / field leadership | consumes readiness and control expectations |
| Exception approval | governed per T06 | not owned by package admin alone |
| Final manual review where required | authorized HB reviewer / verifier | governed central eligibility and project/work-package designation apply |

### 13.2 Permissions posture

This surface is internal-only in Phase 3. At minimum the plan must support differentiated permissions for:

- owner edit,
- reviewer confirm,
- high-risk QC Manager review,
- verifier/manual-review close,
- exception linkage and drift recheck handling,
- read-only field-consumption views for downstream QC users.

### 13.3 Audit trail requirements

The system must version and audit:

- item creation and identity changes,
- package-reference changes,
- extraction source and extraction timestamp,
- owner confirmation and edits to inventory rows,
- official-source capture and comparison basis,
- verdict issuance and supersession,
- exception linkage,
- drift alert detection and resolution.

---

## 14. Shared Package Reuse and Boundary Rules

| Shared package | Required use |
|---|---|
| `@hbc/versioned-record` | Versioned snapshots, revision history, and audit trail |
| `@hbc/record-form` | Structured item and inventory entry forms |
| `@hbc/saved-views` | Filtered advisory worklists and role-specific views |
| `@hbc/related-items` | Links from advisory items to plans, issues, exceptions, and document references |
| `@hbc/notification-intelligence` | Drift alerts, manual-review-needed notifications, and recheck nudges |
| `@hbc/session-state` | Safe session continuity for partially confirmed inventory work |
| `@hbc/sharepoint-docs` | Document reference and link handling only; no local QC file subsystem |
| `@hbc/ai-assist` | Future optional accelerator only; not a Phase 3 dependency |

### 14.1 Anti-patterns

- Do not create a QC-owned file repository.
- Do not bypass `@hbc/sharepoint-docs` for direct document operations.
- Do not create feature-local AI integrations outside `@hbc/ai-assist`.
- Do not treat advisory verdict as formal submittal approval.

---

## 15. Data Requirements, Implementation Sequence, and Acceptance

### 15.1 Minimum Phase 3 data requirements

Phase 3 delivery must support:

- persistent `SubmittalItemRecord`,
- owner-confirmed `DocumentInventoryEntry` rows,
- official-source references,
- governed verdict issuance,
- revision history,
- approved-basis conflict/recheck handling,
- drift alerts,
- downstream activation mapping.

### 15.2 Recommended implementation sequence

1. Land record contracts and governed taxonomy binding.
2. Land item creation with required spec/package anchoring and preliminary guidance.
3. Land inventory extraction/confirmation workflow.
4. Land official-source comparison and currentness rules.
5. Land verdict issuance and package-dependent activation.
6. Land conflict/recheck and `VersionDriftAlert` logic.
7. Land summary/reporting surfaces and targeted notifications.
8. Add optional future `@hbc/ai-assist` accelerators only after the deterministic workflow is stable.

### 15.3 Acceptance criteria

The feature is acceptable only when all of the following are true:

1. A QC advisory item can be created without creating a submittal workflow record.
2. Every item requires spec anchoring and a package reference.
3. Inventory rows remain draft until owner confirmation.
4. Currentness checks use manufacturer or official publisher sources only.
5. `unable-to-verify` forces manual review.
6. Package-dependent activation does not occur before acceptable verdict or approved exception.
7. Later official-source conflict generates explicit recheck/drift behavior and preserves approved project basis.
8. Downstream mapping publishes QC guidance without turning QC into a file repository or submittal workflow surface.

---

## 16. Implementation Notes for Future Tranches

- Future Procore integration should attach a canonical workflow reference and ingestion seam, not relocate QC authority.
- Future `@hbc/ai-assist` adoption may improve extraction confidence and official-source matching, but the adjudication, audit, and acceptance model in this file must remain unchanged.
- Any later proposal to extend this feature into formal submittal workflow must be treated as separate scope and must not be inferred from this document.
