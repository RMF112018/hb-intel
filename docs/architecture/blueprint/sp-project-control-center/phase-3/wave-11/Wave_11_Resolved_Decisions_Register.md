# Wave 11 Resolved Decisions Register

Status: Canonical Wave 11 resolved decisions (adapted from Wave 11 prompt package)

| ID       | Decision Topic              | Resolution                                                                                                                                          | Boundary / Implementation Implication                                         |
| -------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| W11-D001 | Module name                 | `Responsibility Matrix`                                                                                                                             | Preserve canonical Phase 3 wave naming and registry alignment.                |
| W11-D002 | Subtitle                    | `RACI + Owner-Contract Responsibility Control Center`                                                                                               | Clarifies scope without renaming official module ID.                          |
| W11-D003 | Module model                | Template-driven, project-instance-based control system                                                                                              | Prevents spreadsheet-clone posture and enables governance/audit/versioning.   |
| W11-D004 | Workbook source posture     | Workbooks are source references, not UX constraints                                                                                                 | Preserve traceability while allowing evolved product architecture.            |
| W11-D005 | General workbook use        | PM/Field source rows seed default responsibility posture                                                                                            | `109` context with strict marked assignment-row controls applied.             |
| W11-D006 | Owner-contract workbook use | Seeds structure and party-code mapping posture; not populated obligations                                                                           | Treat as schema/placeholder source in current repo truth.                     |
| W11-D007 | RACI baseline               | Use RACI as normalized internal baseline                                                                                                            | Role clarity and ownership consistency.                                       |
| W11-D008 | Accountable rule            | Active operational items should have one accountable unless governed exception exists                                                               | Avoid ambiguous ownership.                                                    |
| W11-D009 | Contract-party model        | Store contract-party axis separately from internal RACI axis                                                                                        | Prevent Contractor vs Consulted semantic collision.                           |
| W11-D010 | Decision-rights overlay     | Add decision-rights fields for decision-heavy items                                                                                                 | RACI-only posture is insufficient for decisions/approvals/sign-off semantics. |
| W11-D011 | Template governance         | Versioning, effective dates, retirement, migration posture required                                                                                 | Prevent template drift and stale default usage.                               |
| W11-D012 | Project-instance governance | Project records created from templates with lineage preserved                                                                                       | Enables project-specific control without mutating masters.                    |
| W11-D013 | Import workflow             | Classification + human review before activation                                                                                                     | Prevents accidental activation of placeholders/headers/ambiguous rows.        |
| W11-D014 | Team & Access integration   | Resolve role/person assignments through Team & Access roster                                                                                        | Responsibility Matrix consumes, Team & Access owns roster state.              |
| W11-D015 | Current action owner        | Include ball-in-court/current action owner posture                                                                                                  | Operational action ownership can differ from accountable owner.               |
| W11-D016 | Workflow steps              | Review/approval/sign-off/decision items require step model                                                                                          | Supports multi-step routing and pending-action posture.                       |
| W11-D017 | Evidence posture            | Store references/metadata only                                                                                                                      | HB Document Control Center owns evidence binaries.                            |
| W11-D018 | Priority Actions            | Critical/overdue exceptions generate priority-action candidates                                                                                     | Cross-module action surfacing for unresolved risk.                            |
| W11-D019 | Project Readiness           | Critical gaps contribute readiness blockers                                                                                                         | Align with Wave 8 framework semantics.                                        |
| W11-D020 | Approvals boundary          | Wave 11 requests/references approvals; Wave 14 executes approvals                                                                                   | Preserve approvals/checkpoints ownership boundary.                            |
| W11-D021 | Snapshot/export posture     | Governed records for reporting/audit context, not contract amendments                                                                               | Avoid legal overreach and preserve controls posture.                          |
| W11-D022 | Legal posture               | No legal advice, no auto contract interpretation, no legal-obligation creation                                                                      | Required risk-control guardrail.                                              |
| W11-D023 | External systems posture    | Launcher/reference-only in Wave 11 architecture                                                                                                     | No runtime writeback/sync/mutation claims.                                    |
| W11-D024 | UX lanes                    | Eight-lane architecture (Overview, Matrix, Register, Owner-Contract Mapping, My Responsibilities, Gaps and Conflicts, Handoffs, Template and Admin) | Full module coverage while preserving separations of concern.                 |
| W11-D025 | Health score                | Blocker-first Matrix Health Score                                                                                                                   | Prevent blended metrics from hiding critical unresolved ownership gaps.       |
| W11-D026 | Notification/escalation     | Define policy posture now even if runtime is later                                                                                                  | Decision-complete architecture for downstream implementation prompts.         |
| W11-D027 | Audit                       | Assignment/template/evidence/exception/snapshot changes must be audit-logged                                                                        | Accountability and traceability requirements are mandatory.                   |

## Prompt 01/02 Correction Lock

- `109` is workbook-derived task-row context: 82 PM task-text rows + 27 Field rows with assignment marks.
- Strict marked assignment rows total `98`.
- Owner-contract workbook remains schema/placeholder posture only in current source files.

## Remaining Open Product Decisions

None for architecture posture in this Wave 11 package. Runtime implementation decisions are deferred to implementation prompts and must preserve Wave 8/Wave 14/Document Control/Team & Access boundaries.
