# 02 — Closed Decisions Register

## Core Architecture Decisions

| Decision Area | Closed Decision |
|---|---|
| PCC architecture thesis | PCC is one unified project lifecycle operating layer. |
| Workspace posture | Separate departmental PCC workspaces are prohibited. |
| Surfaces | The only approved shell-level surfaces are Project Home, Team & Access, Documents, Project Readiness, Approvals, External Systems, Control Center Settings, and Site Health. |
| Work centers | Work centers are governed capability domains and not separate apps or source-of-record silos. |
| Workflow modules | Workflow modules are structured task/control patterns hosted in the unified PCC context. |
| Lenses | Role/stage/task lenses filter and emphasize shared truth; they do not create separate storage or routes. |
| Unified lifecycle route families | Unified lifecycle, project memory, project lenses, project traceability, warranty trace, cross-project knowledge, and unified search are backend read-model route families, not shell routes. |
| HBI posture | HBI is never source truth; grounded answers require citations; refusals use `PccHbiRefusalReason`. |
| Source ownership | Source systems own source-owned records; PCC owns PCC-native and PCC-derived records. |
| Security posture | Every PCC-native or PCC-derived record carries classification, allowed personas, redaction level, and cross-project posture. |
| Cross-project search | Disabled by default; allowed only through governed future-pursuit/executive/admin modes. |
| Warranty responsibility | No responsibility recommendation unless evidence threshold is met. |
| Integration posture | All live integrations are future-gated, backend-mediated, least-privilege, and read-only unless separately authorized. |
| Documentation scope | This package is documentation-only and must not change runtime source files. |

## Developer-Contract Decisions

- The bounded-context ownership map is canonical for implementation planning.
- The route taxonomy is canonical for approved and forbidden route decisions.
- The record state machines are canonical for future workflow/state implementation.
- The field-level data dictionary is canonical for future schema refinement and UI/HBI handling.
- The permission/redaction algorithm is canonical for future render and HBI access decisions.
- The HBI citation/refusal contract is canonical for future Ask-HBI implementation.
- The source-system integration contract is canonical for future Graph/Procore/Sage/Autodesk/etc. live-integration prompts.
- The audit-event model is canonical for future audit logging implementation.
- The error/degraded-state matrix is canonical for UI states and HBI behavior.
- The module onboarding template is mandatory for all future PCC modules.
- The validation gates are mandatory for any prompt touching this architecture.
