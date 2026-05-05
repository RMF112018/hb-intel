# Wireframe 08 — Audit History

## Purpose

Define the audit/event history experience for launch-link, mapping, and review lifecycle visibility with filterable, lineage-aware read-only event timelines.

## Personas

- Viewer: inspects historical outcomes.
- Operator: traces link and mapping lifecycle.
- Reviewer: verifies decision audit trail.
- Admin: checks governance and retention posture.

## Layout Zones

- Header zone: scope selector, range filters, export hint (future behavior).
- Filter zone: event type, actor role, system, severity, state.
- Timeline/table zone: chronological event list.
- Event detail zone: selected event payload summary.
- State zone: loading/empty/redacted/unavailable/unauthorized.

## Component Anatomy

- Filter chips and date controls.
- Event table columns: timestamp, event type, object, actor role, outcome.
- Timeline markers by severity class.
- Detail panel with event metadata and lineage references.
- Retention notice banner for archived/redacted records.

## Actions

- Filter and search event history.
- Open event detail.
- Navigate to related workflow screens.
- Open source-lineage panel.

## States

- Loading: timeline placeholders.
- Populated: events visible with filters.
- Empty: no events for selected scope.
- Redacted: sensitive fields removed by policy.
- Unavailable: event source unavailable.
- Unauthorized: user lacks event-history permission.

## Role/Action Visibility

| Role     | Visible actions                                       | Hidden/disabled actions                   |
| -------- | ----------------------------------------------------- | ----------------------------------------- |
| Viewer   | filter/search and read permitted events               | no governance-only metadata               |
| Operator | viewer actions with project context shortcuts         | no admin retention controls               |
| Reviewer | operator actions plus review-event emphasis filters   | no global governance config controls      |
| Admin    | full audit visibility including retention annotations | runtime export/write actions out of scope |

## Responsive Behavior

- Desktop: table + detail split panel.
- Tablet: collapsible detail beneath selected row.
- Mobile: timeline cards with expandable metadata.
- Filter zone becomes horizontal scroll chip rail on narrow screens.

## Accessibility

- Table/timeline has semantic headings and landmarks.
- Filter controls provide accessible names and selected-state announcements.
- Event selection updates are announced in detail panel live region.
- Redacted indicators include explicit text and tooltip description.

## Read-Model Inputs

- External system audit events projection.
- Event taxonomy mapping.
- Object reference lookup for navigation links.
- Permission projection and redaction flags.

## Workflow Transitions

- Audit History -> Project Launch Links via related link events.
- Audit History -> Mapping Review Detail via mapping review events.
- Audit History -> Source Lineage Panel via lineage reference.
- Transition definitions are read/navigation only.

## Acceptance Criteria

- Audit screen includes redacted and unavailable state handling.
- Event filters and detail anatomy are explicitly defined.
- Role visibility preserves read-only posture in this prompt.
- Accessibility and responsive behavior are fully specified.
- All required sections present.
