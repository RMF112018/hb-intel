# Wireframe 09 — HBI Source Lineage Panel

## Purpose

Specify the side-panel UX that explains source lineage for displayed launch, mapping, review, and audit fields so users can verify origin and confidence.

## Personas

- Viewer: validates where displayed values come from.
- Operator: checks whether data is authoritative before link proposals.
- Reviewer: confirms provenance during dispositions.
- Admin: audits lineage completeness and policy boundaries.

## Layout Zones

- Panel header zone: context object, field count, refresh timestamp.
- Field lineage list zone: per-field source mapping and confidence notes.
- Citation zone: source references and policy notes.
- State zone: loading/citation-ready/refusal/unavailable/unauthorized.
- Footer zone: navigation links back to origin screen.

## Component Anatomy

- Slide-over panel shell with close/back controls.
- Field lineage table/cards: ui field, source list, transformation note.
- Confidence and freshness badges.
- Citation block with canonical source links.
- Refusal/insufficient-data message panel.

## Actions

- Open lineage from any supported source screen.
- Filter lineage entries by field domain.
- Expand field detail.
- Navigate to canonical source references.
- Close panel and return to prior workflow state.

## States

- Loading: lineage skeleton placeholders.
- Citation-ready: full lineage with source references.
- Refusal: insufficient provenance confidence.
- Unavailable: lineage service/source unavailable.
- Unauthorized: lineage visibility restricted.

## Role/Action Visibility

| Role     | Visible actions                                     | Hidden/disabled actions               |
| -------- | --------------------------------------------------- | ------------------------------------- |
| Viewer   | open/read lineage and citations                     | no governance edit controls           |
| Operator | viewer actions with field-domain filters            | no reviewer disposition controls      |
| Reviewer | operator actions and review-context lineage anchors | no admin governance overlays          |
| Admin    | all read/citation views and governance badges       | runtime mutation actions out of scope |

## Responsive Behavior

- Desktop: right-side panel occupying ~35% width.
- Tablet: wider overlay panel with collapsible citation section.
- Mobile: full-screen panel with tabbed lineage/citations view.
- Back navigation preserves prior scroll and selection context.

## Accessibility

- Panel open moves focus to heading; close restores prior trigger focus.
- Field rows keyboard navigable with clear expanded/collapsed states.
- Citation links include descriptive labels.
- Refusal/unavailable messages announced through live regions.

## Read-Model Inputs

- Field lineage projection for active context object.
- Source registry pointers and citation metadata.
- Transformation notes and freshness indicators.
- Permission projection and confidence flags.

## Workflow Transitions

- Any supported screen -> Source Lineage Panel (contextual open).
- Source Lineage Panel -> prior screen/context on close/back.
- Source Lineage Panel -> canonical reference docs via links.
- Transitions remain UX/read-model behavior only.

## Acceptance Criteria

- Lineage panel provides deterministic provenance anatomy for each field.
- Refusal and unavailable states are explicitly defined and distinct.
- Role visibility preserves read-only intent in this prompt.
- Accessibility, responsive, and transition behavior is fully specified.
- All required sections present.
