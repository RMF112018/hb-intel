# Closed Decisions Register — Estimating Workbench

## Product / Scope Decisions

| Decision | Closed Position |
|---|---|
| MVP inclusion | Estimating Workbench is in MVP scope as an approved scope amendment. |
| First implementation | SharePoint/SPFx first. |
| Top-level routing | No new top-level PCC shell route in MVP. Mount under existing `project-readiness` surface. |
| Work center posture | Primary work center affinity: `startup`; secondary affinities: procurement/buyout, project controls, document control, lessons learned. |
| Workspace posture | Not a departmental Estimating workspace. It is a role/stage lens and workflow module within unified PCC. |
| Storage | Central SharePoint/PCC estimating data lists with project-site projection. This allows pre-site estimating continuity without creating a silo. |
| Day-one templates | Commercial and Multifamily only. |
| Cost-code hierarchy | Internal HB cost codes first; Sage mapping in future phase. CSI/MasterFormat and Procore WBS are reference/mapping fields only in MVP. |
| Workbook import | Template migration only. Active project workbook import is deferred. |
| Grid behavior | Familiar grid-like UX, but not full Excel parity. Formula support is constrained. |
| Formula authority | Formula outputs are working values; canonical downstream data stores resolved values + source lineage. |
| HBI authority | HBI may review/summarize/cite; it may not authoritatively price work or recommend awards. |
| Source-system writeback | No Sage, Procore, Autodesk, BuildingConnected, or external-system writeback in MVP. |
| Dependency installation | This package documents compatible dependencies; it does not install them or mutate lockfiles. |

## No Open Decisions

Future implementation gates may require approvals, but this package does not leave architectural decisions open.
