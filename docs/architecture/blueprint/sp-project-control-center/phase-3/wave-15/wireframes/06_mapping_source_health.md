# Wireframe 06 — Mapping Source Health

## Purpose

Define the monitoring screen for project mapping readiness and source-health indicators that influence launch eligibility and review prioritization.

## Personas

- Operator: monitors mapping quality for launch readiness.
- Reviewer: prioritizes correction reviews based on health severity.
- Admin: audits cross-project health posture.
- Viewer: reads summarized health indicators.

## Layout Zones

- Header zone: project scope selector and health snapshot timestamp.
- Health summary zone: KPI cards (healthy/stale/blocked/degraded counts).
- Mapping table zone: mapping records with readiness dimensions.
- Event strip zone: recent health transitions.
- State zone: loading/empty/stale/degraded/blocked/unauthorized.

## Component Anatomy

- KPI summary cards with severity chips.
- Mapping table columns: source system, object, status, last validated, blockers.
- Inline warning tags for stale or policy-blocked mappings.
- Read-only event strip with time-ordered health changes.
- Detail flyout for selected mapping lineage.

## Actions

- Filter mappings by status and system.
- Sort by severity or age.
- Open mapping review detail.
- Open audit history from health event.
- Open lineage panel.

## States

- Loading: KPI and table skeletons.
- Empty: no mappings in selected scope.
- Healthy: no blockers/staleness.
- Stale: aged mapping validation.
- Blocked: missing required mapping relationship.
- Degraded: upstream dependency degraded.
- Unauthorized: restricted visibility.

## Role/Action Visibility

| Role     | Visible actions                                      | Hidden/disabled actions             |
| -------- | ---------------------------------------------------- | ----------------------------------- |
| Viewer   | read KPIs, table, detail flyout                      | no review disposition actions       |
| Operator | viewer actions, open correction detail               | no approve/reject final controls    |
| Reviewer | operator actions plus review-queue jump actions      | no registry admin mutation controls |
| Admin    | all read/navigation actions with governance overlays | runtime write actions out of scope  |

## Responsive Behavior

- Desktop: KPI row + full table + side detail flyout.
- Tablet: KPI cards wrap; table uses expandable rows.
- Mobile: KPI stack and card-based mappings with severity-first ordering.
- Event strip collapses to compact timeline list on narrow widths.

## Accessibility

- KPI cards announce value and status semantics.
- Table/card toggles preserve programmatic relationships.
- Severity sorting controls expose selected order to assistive tech.
- Timeline events keyboard navigable with clear focus outline.

## Read-Model Inputs

- Project external system mappings projection.
- Mapping validation status and age metadata.
- Degraded-state boundary output.
- Related audit event summaries.
- Role permission projection.

## Workflow Transitions

- Mapping Source Health -> Mapping Review Detail for selected item.
- Mapping Source Health -> Audit History for timeline event.
- Mapping Source Health -> Source Lineage Panel for field traceability.
- Transitions represent UX/future-command intent only.

## Acceptance Criteria

- Health statuses include healthy/stale/blocked/degraded.
- Mapping table schema and KPI structure are explicitly documented.
- Role/action visibility supports review escalation without write authorization.
- Accessibility and responsive behaviors are deterministically defined.
- All required sections present.
