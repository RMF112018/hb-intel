# Wireframe 03 — Add/Edit Project Link Drawer

## Purpose

Define the drawer-based UX for adding or editing project launch links with validation, policy preview, and review routing visibility before future command execution.

## Personas

- Operator: drafts new or updated project links.
- Reviewer: views submitted data before decision.
- Admin: checks policy and taxonomy alignment.

## Layout Zones

- Drawer header zone: mode (add/edit), system type, project context.
- Form body zone: link metadata, URL, category, rationale.
- Validation zone: inline errors, policy warnings, stale mapping warnings.
- Footer action zone: cancel, save draft intent, submit for review intent.

## Component Anatomy

- Drawer shell with close control and unsaved-change indicator.
- Form controls: text inputs, dropdown taxonomy selector, toggle chips.
- URL policy preview panel (read-only policy result).
- Validation summary block with anchored links to fields.
- Footer button group with role-aware visibility.

## Actions

- Open in add mode.
- Open in edit mode.
- Modify fields.
- Trigger validation preview.
- Submit for review intent.
- Cancel/close.

## States

- Draft: default editable form.
- Loading: control skeletons while read model resolves.
- Validation error: blocking errors with field anchors.
- Blocked by policy: URL policy deny state.
- Stale reference: mapping outdated warning.
- Unauthorized: form visible read-only or unavailable.

## Role/Action Visibility

| Role     | Visible actions                                                                   | Hidden/disabled actions                     |
| -------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| Viewer   | none (drawer not launchable)                                                      | all editing and submit controls             |
| Operator | edit fields, validation preview, submit-for-review intent                         | final approve/reject/archive controls       |
| Reviewer | read submitted detail and comparison mode                                         | direct edit/save controls hidden by default |
| Admin    | operator controls plus policy override view indicators (read-only in this prompt) | runtime write execution not authorized      |

## Responsive Behavior

- Desktop: side drawer at 40-50% width with persistent validation panel.
- Tablet: wider drawer with collapsible validation section.
- Mobile: full-screen modal sheet with sticky footer actions.
- Field grouping collapses to single-column on narrow widths.

## Accessibility

- Focus lands on drawer title on open and returns to trigger on close.
- Error summary links move focus to invalid fields.
- Required fields marked semantically and announced.
- Buttons include disabled-state reasons for assistive text.
- Keyboard trap limited to drawer until closed.

## Read-Model Inputs

- Launch type taxonomy options.
- URL policy contract evaluation.
- Existing link record (edit mode).
- Role/permission projection.
- Mapping freshness/readiness indicators.

## Workflow Transitions

- Project Launch Links -> Add/Edit Drawer (open).
- Add/Edit Drawer -> Custom Link Review Queue after submit-for-review intent.
- Add/Edit Drawer -> Project Launch Links on cancel/close.
- Add/Edit Drawer -> Mapping Source Health when stale/block warnings require investigation.
- All transitions are UX/future-command intent only.

## Acceptance Criteria

- Drawer spec includes validation and blocked-by-policy behavior.
- Required fields and error handling are fully described.
- Role visibility explicitly prevents viewer edits.
- Responsive behavior defines desktop/tablet/mobile treatment.
- Read-model inputs stay read-only and avoid write contract language.
