# 02 — Closed Decisions Register

## Core Product Decisions

| Decision Area | Closed Decision |
|---|---|
| Official module name | Lessons Learned Center |
| User-facing subtitle | Project Knowledge & Continuous Improvement |
| PCC posture | PCC-native lifecycle intelligence and knowledge reuse module |
| Current roadmap posture | Future workstream / Later work center unless repo truth shows formal MVP promotion |
| Documentation location | `docs/architecture/blueprint/sp-project-control-center/future-workstreams/lessons-learned/` |
| Primary record | `PccLessonLearnedRecord` |
| Workbook role | Source field inventory, seed taxonomy, import/mapping reference, and baseline closeout form evidence |
| PCC role | System of record for lessons, classifications, review state, publication state, sensitivity/redaction, recommendations, improvement actions, reuse events, HBI summaries, audit, and source-lineage interpretation |
| Procore role | Source of Procore-native facts only: RFIs, submittals, observations, punch items, commitments, daily logs, quality/safety records, and related source links |
| Sage role | Accounting truth for job-cost and accounting values only |
| SharePoint/HB Central role | Evidence/document binary storage and source links |
| HBI role | Assistive drafting, classification, summarization, duplication detection, missing-field detection, and reuse recommendations; never authoritative approval/publishing |
| Primary UX posture | Guided lifecycle knowledge system, not spreadsheet clone and not closeout-only form |
| External writes | Prohibited in documentation/MVP preview posture |
| Publication rule | No company-wide publication without PM validation, PX approval, sensitivity review, and neutral/publishable language |
| Sensitive-content default | Redact by default outside authorized roles when vendor, personnel, legal/claims, safety incident, warranty defect, client-conflict, or financial dispute sensitivity exists |

## Data Decisions

- `PccLessonLearnedRecord` is the canonical PCC record.
- A project may contain unlimited lessons; the six-lesson workbook structure is not a limit.
- Every workbook field survives as a mapped PCC field, source-lineage field, taxonomy seed, review field, or archived legacy field.
- The workbook database rows are example/source rows only until explicitly activated by a future governed import process.
- Every source-derived value or evidence link requires `PccSourceLineageReference`.
- Every lesson requires category, phase, situation, impact, root cause, recommendation, applicability, sensitivity, and evidence-or-no-evidence reason before submission.
- Lessons are searchable and reusable only after approval/publication rules are satisfied.
- Improvement actions are owned by Lessons Learned in documentation scope but may later be consolidated into a shared PCC action model; this package closes the current decision as `PccLessonImprovementAction` owned by the Lessons Learned module until a shared action service exists.

## Workflow Decisions

- Use the closed state machine in `reference/lessons_learned_state_machine.json`.
- Draft capture is open to authorized project team users.
- PM review validates factual accuracy, evidence, and project context.
- PX review validates business sensitivity, publication scope, and improvement-action need.
- Department review is mandatory for safety, legal/claims, HR/personnel, warranty/defect, accounting, estimating, preconstruction, technology, and owner/client-sensitive lessons.
- Company-wide publication requires an explicit `publish_company_lesson` transition.
- `suppressed` and `superseded` are final visibility-control states with audit trail requirements.

## Integration Decisions

- No direct SPFx-to-Procore, Sage, SharePoint REST/PnP, or Microsoft Graph runtime mutation.
- Evidence links are references only in documentation scope; no file upload/sync/storage behavior is created.
- PCC Project Home, Project Readiness, Buyout/Procurement, Scheduler, Quality/Warranty, Closeout, Subcontractor Performance, and Executive Oversight consume approved/read-model Lessons Learned signals only.
- HBI may use only authorized, redaction-compliant payloads.
- Lessons may inform decisions but may not automatically determine legal liability, vendor exclusion, employment action, bid list status, claim entitlement, delay damages, or warranty responsibility.
