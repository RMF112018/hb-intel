# Wave 11 Responsibility Matrix Scope Lock

Status: Canonical Wave 11 scope lock (documentation-only)

## Objective

Lock the Wave 11 scope for a unified `Responsibility Matrix` module (`RACI + Owner-Contract Responsibility Control Center`) while preserving cross-wave ownership boundaries and non-runtime/legal guardrails.

## MVP Includes

- Unified Responsibility Matrix module under Project Readiness.
- Two-axis model: contract-party mapping + internal RACI mapping.
- Template-driven, project-instance-based architecture posture.
- Workbook-source traceability requirements for seeded defaults.
- Assignment lifecycle and handoff posture.
- Current action owner / ball-in-court posture.
- Workflow-step model for review/approval/sign-off responsibilities.
- Decision-rights overlay posture for decision-heavy items.
- Exception model and Matrix Health Score posture.
- Evidence reference integration posture with Document Control ownership retained.
- Integration seam definitions with Project Readiness, Priority Actions, Team & Access, Approvals / Checkpoints, and External Systems.

## MVP Excludes

- Runtime workflow execution engines.
- External-system writeback/sync/mirror.
- Tenant, SharePoint, Graph, Procore, Sage, AHJ mutation behavior.
- Legal interpretation of contract language.
- Automatic creation of legal obligations.
- Replacement of executed contracts.

## Later-Phase Items

- Runtime module implementation (read models/routes/UI execution behavior).
- Notification delivery implementation details.
- Export/snapshot execution mechanics.
- Advanced rule automation and policy engines.

## Hard Guardrails

- Documentation-only scope for this wave package prompt.
- No `docs/architecture/plans/**` edits in this prompt.
- No package/lockfile/deployment/manifest/runtime modifications.
- Preserve Wave 8 framework ownership.
- Preserve Wave 14 approvals/checkpoints execution ownership.

## Module Boundary Contracts

### Team & Access

- Team & Access owns project roster and access state.
- Responsibility Matrix consumes role/person resolution posture.

### HB Document Control Center

- Document Control owns evidence binaries and project record storage.
- Responsibility Matrix stores evidence references/metadata only.

### Priority Actions

- Responsibility exceptions can emit priority-action candidates.
- Priority Actions remains the cross-module action rail.

### Project Readiness (Wave 8 Framework)

- Wave 11 contributes normalized signals to framework seams.
- Wave 11 does not redefine framework ownership or semantics.

### Approvals / Checkpoints (Wave 14)

- Wave 11 may request/reference approvals.
- Wave 14 owns approval/checkpoint execution authority.

### External Systems

- Launcher/reference posture only.
- No runtime mutation/writeback claims.

## Workbook Source Lock

- `109` is workbook-derived task-row posture context: 82 PM task-text rows + 27 Field rows with assignment marks.
- Strict marked assignment rows total `98`.
- Owner-contract workbook remains schema/placeholder-only in current repo source and does not provide populated default obligation-description rows.

## Vocabulary Lock

Wave 11 documentation must reuse existing PCC vocabulary/enums/types where available and avoid introducing conflicting terminology.

## Legal and Runtime Posture

- No legal advice.
- No automatic creation of legal obligations.
- No replacement of executed contracts.
- No runtime/external mutation posture is authorized by this document.

## Prompt Sequencing

`Wave_11_Documentation_Closeout.md` is intentionally deferred to Prompt 05 to summarize the complete Wave 11 package after all documentation prompts are complete.
