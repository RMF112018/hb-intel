# Template Compliance View

## Screen Objective

View comparing required Standard Project Site Template objects with observed objects.

## Primary Users

- Project Manager
- Project Executive
- Manager of Operational Excellence
- PCC Admin
- IT Admin
- Executive Oversight where summary visibility applies

## Layout Sections

1. Header with project name, overall health, source status, and last refreshed timestamp.
2. Filter or category rail where relevant.
3. Primary content area.
4. Evidence/detail drawer or panel when a record is selected.
5. Disabled action area showing role/policy reasons.
6. HBI explanation entry point where evidence is sufficient.

## Field / Column Inventory

- Severity
- Status
- Category
- Affected object
- Source module
- Source status
- Detected timestamp
- Last observed timestamp
- Owner persona
- Action mode
- Evidence count
- Redaction level

## Interaction Rules

- Clicking a finding opens the detail drawer.
- Filters update the view without triggering tenant mutation.
- Stale-source warnings remain visible when stale data is displayed.
- Actions display disabled reasons unless a future command package authorizes execution.
- HBI explanations cite evidence and disclose uncertainty.

## Empty, Loading, Error, and Degraded States

- Empty healthy state: show no findings and completed checks.
- Loading state: preserve layout and announce loading politely.
- Backend unavailable: show degraded banner and safe empty content.
- Source unavailable: show source-specific unavailable state.
- Forbidden: show redacted summary and no sensitive details.
- Fixture only: label fixture source clearly.

## Accessibility Notes

- Keyboard navigation must reach all controls.
- Detail drawers must trap focus and restore focus on close.
- Status chips include text labels.
- Tables use accessible headers.
- Dynamic status updates use appropriate live-region semantics.
- Mobile layout preserves information hierarchy.

## Prohibited Behavior

- No tenant mutation.
- No permission changes.
- No list/library/schema changes.
- No automatic repair.
- No secret display.
- No external-system writeback.
- No legal, accounting, claim, entitlement, delay, or compensability determinations.
