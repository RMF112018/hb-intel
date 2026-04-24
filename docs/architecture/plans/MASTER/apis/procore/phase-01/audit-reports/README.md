# HB Intel / SharePoint Procore Integration Audit Package

This package is the repo-truth audit baseline for integrating Procore into the live HB Intel `main` branch.

## Included files
- `00-Integration-Audit-Summary.md`
- `01-Current-Implementation-Map.md`
- `02-Procore-Package-Synthesis.md`
- `03-Research-Backed-Architecture-Assessment.md`
- `04-Identity-and-Connection-Strategy.md`
- `05-Data-Layer-and-SharePoint-Materialization-Plan.md`
- `06-Implementation-Gap-Register.md`
- `07-Prioritized-Implementation-Plan.md`
- `08-Recommended-Execution-Waves.md`

## Core conclusions
- The correct primary integration host is `backend/functions/`, not a disconnected new service.
- The existing Azure app registration remains the correct Entra / protected-API posture for HB Intel front-end to backend trust.
- Procore still requires its own Procore app credentials and DMSA for enterprise data connection workloads.
- SharePoint should remain a curated experience and collaboration layer, not the primary custody plane for the Procore operational model.
- The first production slice should deliver durable connection control, raw landing, canonical relational storage, curated publications, and the first financial / project-management subject areas.

## How to use this package
1. Read `00` and `08` first.
2. Use `06` and `07` as the gap register and execution backlog.
3. Use the companion prompt packages as the code-agent implementation handoff.
