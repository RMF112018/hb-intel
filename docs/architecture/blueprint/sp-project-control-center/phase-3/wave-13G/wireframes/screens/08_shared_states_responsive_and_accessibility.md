# 08 — Shared States, Responsive Behavior, and Accessibility Wireframes

## Locked Decisions Applied

| Decision | Locked Direction |
|---|---|
| MVP posture | Estimating Workbench is included in MVP scope. |
| First implementation | SharePoint/SPFx inside PCC. |
| PCC placement | Mount under `Project Readiness > Estimating Workbench`; no new top-level PCC navigation surface in MVP. |
| Cost-code hierarchy | MVP uses internal HB Cost Codes first; Sage mapping follows in a future phase. |
| Day-one templates | Commercial and Multifamily. |
| Workbook import | Template migration only; no active project workbook import in MVP. |
| Data posture | Workbook-like UX over canonical PCC estimating data records. |
| HBI posture | Grounded review/summarization only; no pricing authority, no award authority. |

## Objective

Define states and interaction behavior that apply to all wireframe groups. These rules prevent implementation drift and ensure the feature works in SharePoint-hosted SPFx contexts.

## Shared States

| State | Required UX |
|---|---|
| Loading | Skeleton cards/tables; no fake data flashes. |
| Empty | Clear explanation and next allowed action. |
| Unauthorized | Explain access limitation and show request-access action if permitted. |
| Read-only | Show data and hide/disable edit actions with reason. |
| Draft | Editable by authorized roles. |
| Internal Review | Limited edit; review actions visible by role. |
| Frozen Baseline | Read-only canonical handoff state. |
| Superseded | Historical; no edit except restore/duplicate if authorized. |
| Archived | Read-only; no mutation actions. |
| Validation stale | Prompt revalidate. |
| SharePoint unavailable | Degraded state, retry, no silent data loss. |
| Conflict detected | Show conflict resolution; do not overwrite silently. |

## Responsive Behavior

### Desktop

- Full shell with left rail and secondary tabs.
- Grid supports horizontal internal scroll if necessary, but page must not cause browser-level horizontal overflow.
- Right side panels visible.

### Tablet

- Left rail may collapse to icons.
- Right panels convert to drawers.
- Grid remains usable with horizontal internal scroll.
- Summary cards wrap.

### Mobile

- Estimating Workbench is review-limited in MVP.
- Editable grid workflow may be blocked or simplified.
- Bid leveling matrix becomes stacked comparison cards or read-only summary.
- Handoff Preview remains reviewable.

## Keyboard Requirements

- Tab order follows visible workflow order.
- Arrow keys move through grid cells where grid is active.
- Enter commits cell edit or opens row detail based on mode.
- Escape cancels edit or closes drawer/modal.
- Ctrl/Cmd+C copies selected cells/rows.
- Ctrl/Cmd+V pastes into allowed selected region.
- Ctrl/Cmd+Z supports local undo where technically feasible for unsaved edits.
- Focus must return to source control after closing modal/drawer.

## Accessibility Requirements

- All controls have accessible names.
- Validation icons have text alternatives.
- Progress bars expose current value and label.
- Severity is not communicated by color alone.
- Modal/drawer focus is trapped while open.
- Screen-reader users can identify active project, active tab, current estimate, and validation summary.
- Reduced motion supported.
- High contrast mode remains usable.

## Error and Conflict Behavior

| Scenario | Required UX |
|---|---|
| Save fails | Keep local edits in pending state and show retry. |
| Concurrent edit | Show conflict banner and changed fields. |
| Validation service fails | Show last known validation and stale warning. |
| Export fails | Show specific export type failure. |
| Snapshot fails | Do not mark snapshot as created; preserve draft. |

## Developer Notes

- Do not depend on hover-only actions.
- Do not bury required actions in row overflow menus only.
- Use explicit disabled reasons for blocked actions.
- Ensure large tables and drawers remain accessible inside SharePoint page canvas.

## Acceptance Criteria

- All primary flows can be operated with keyboard.
- No screen requires native SharePoint list editing.
- Loading/empty/error/unauthorized/frozen states are implemented before live persistence.
- Mobile behavior is explicitly review-limited rather than silently broken.
