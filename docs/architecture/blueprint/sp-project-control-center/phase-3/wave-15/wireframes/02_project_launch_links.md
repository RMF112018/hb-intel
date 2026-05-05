# Wireframe 02 — Project Launch Links

## Purpose

Specify the project-level list experience for permitted links (permitting, progress camera, custom, accounting), including filter/sort behavior and state handling before users open links or request changes.

## Personas

- Viewer: inspects available links and status.
- Operator: proposes or updates link records through drawer entrypoints.
- Reviewer: verifies review-required links and stale markers.
- Admin: audits policy alignment and archive posture.

## Layout Zones

- Header zone: project title, system filter, freshness timestamp.
- Toolbar zone: search, type chips, state filters, sort controls.
- Primary table zone: grouped links by category.
- Side insights zone: selected link metadata and policy hints.
- State zone: empty/loading/unauthorized/blocked/stale/degraded overlays.

## Component Anatomy

- Filter toolbar with chips for permitting/progress camera/custom/accounting.
- Table with columns: label, launch type, status, review state, last validated.
- Row status pill set: active/stale/blocked/degraded.
- Row action menu (visibility by role).
- Read-only detail panel for selected row lineage and policy flags.

## Actions

- Filter by link category and state.
- Search links by label/system.
- Open add/edit link drawer.
- Open review queue for selected link.
- Open lineage panel from row details.
- Archive view toggle (read-only in this prompt scope).

## States

- Loading: table skeleton rows and disabled toolbar controls.
- Empty: no links exist in selected filters.
- Unauthorized: table withheld, guidance shown.
- Blocked: link exists but policy/mapping blocks launch.
- Stale: freshness warning on rows beyond threshold.
- Degraded: upstream degraded marker on affected rows.
- Ready: row actions visible by role.

## Role/Action Visibility

| Role     | Visible actions                                      | Hidden/disabled actions                    |
| -------- | ---------------------------------------------------- | ------------------------------------------ |
| Viewer   | filter/search, open row details, open lineage panel  | add/edit/review/archive controls hidden    |
| Operator | viewer actions, open add/edit drawer, request review | approve/reject/archive finalization hidden |
| Reviewer | operator actions, open review decision affordances   | global registry admin actions hidden       |
| Admin    | all row and filter actions, archive posture controls | none in UX scope                           |

## Responsive Behavior

- Desktop: full table with persistent side insights panel.
- Tablet: table collapses secondary columns into expandable row detail.
- Mobile: card list with sticky filters and per-card action menu.
- State banners remain top anchored across breakpoints.

## Accessibility

- Table headers expose sort state to screen readers.
- Filter chips are keyboard-toggleable with clear selected state labels.
- Row action menus support keyboard open/close and escape semantics.
- Status pills include accessible text equivalents.
- Empty and unauthorized panels include focusable recovery navigation.

## Read-Model Inputs

- Project external launch links list (read-only projection).
- URL policy match result per link.
- Mapping readiness and review status snapshots.
- Permission/role projection.
- Freshness and degraded-state tags.

## Workflow Transitions

- Project Launch Links -> Add/Edit Project Link Drawer via add/edit action.
- Project Launch Links -> Custom Link Review Queue via review action.
- Project Launch Links -> HBI Source Lineage Panel via lineage action.
- Project Launch Links -> Launch Pad Home via breadcrumb.
- Transition contracts are UX/future-command only and do not authorize writes.

## Acceptance Criteria

- Required wireframe sections are present with explicit link-category coverage.
- Category filters include permitting/progress camera/custom/accounting.
- Unauthorized/blocked/stale/degraded states are separately defined.
- Role/action visibility differentiates operational vs review/admin actions.
- Read-model dependency list contains only read projections.
