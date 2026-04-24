# 07 — Recommended Execution Waves

## Wave 01 — Wiring truth and deploy integrity
Objective:
Make the frontend truthfully capable of calling the right backend with the right auth/config, and stop discarding backend support data.

Includes:
1. production entry unification / required backend config
2. typed backend client for preview/ingest/replay
3. auth + request-id + error-envelope preservation
4. abort/timeout/transient-fault posture
5. release-proof checks for mount/config/backend alignment

Exit criteria:
- a production-mounted Safety app cannot enter sharepoint mode without valid backend config
- preview/ingest/replay all have a typed client seam
- request IDs and failure classes survive to the UI/state layer
- smoke tests prove real backend round-trip wiring

## Wave 02 — Workflow truth and UX hardening
Objective:
Move the Upload and Review surfaces into alignment with the backend’s actual preview/commit/replay model.

Includes:
1. preview-before-commit Upload flow
2. preview diagnostics surface
3. authority-model copy and mismatch/provenance framing
4. support-grade outcome/review details
5. accessibility/live-region hardening

Exit criteria:
- Upload no longer behaves as a direct-commit form
- preview blockers/warnings are visible before commit
- replay and terminal outcomes preserve support context
- async state announcements and error semantics are materially improved

## Recommended sequencing rule
Do not do Wave 02 first.

Preview UX and truthful failure UX depend on Wave 01’s corrected backend client seam and production binding truth.
