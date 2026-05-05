# Wireframe 05 — External System Registry

## Purpose

Define the read-focused registry visibility screen for external system launch types, status posture, and policy lineage used by project workflows.

## Personas

- Viewer: inspects available launch types and registry status.
- Operator: validates system availability before link proposals.
- Reviewer: confirms registry context during review decisions.
- Admin: audits global configuration posture.

## Layout Zones

- Header zone: registry title, taxonomy scope, refresh metadata.
- Taxonomy panel zone: launch type groups and counts.
- Registry table zone: system entries with status and policy linkage.
- Detail panel zone: selected system metadata and lineage references.
- State zone: loading/empty/unavailable/degraded/unauthorized.

## Component Anatomy

- Launch type filter rail sourced from launcher taxonomy.
- Registry table columns: system code, launch type, status, policy source, notes.
- Status banner for global degraded/unavailable conditions.
- Read-only detail tabs: metadata, policy pointers, lineage pointers.

## Actions

- Filter registry by launch type.
- Search by system name/code.
- Open source-lineage panel for selected system.
- Navigate back to launch pad or project links.

## States

- Loading: filter and table skeletons.
- Empty: no systems for selected taxonomy filter.
- Available: registry entries loaded.
- Unavailable: registry source currently not available.
- Degraded: partial status data from dependent source.
- Unauthorized: registry details restricted.

## Role/Action Visibility

| Role     | Visible actions                                    | Hidden/disabled actions                |
| -------- | -------------------------------------------------- | -------------------------------------- |
| Viewer   | filter/search/read details                         | no admin edit affordances              |
| Operator | viewer actions and context navigation              | no registry modify/archive affordances |
| Reviewer | operator actions with review context markers       | no global config mutation controls     |
| Admin    | full read visibility, governance metadata surfaces | runtime write controls out of scope    |

## Responsive Behavior

- Desktop: table + detail split view.
- Tablet: stacked table and expandable detail cards.
- Mobile: list cards with accordion metadata sections.
- Taxonomy filter rail collapses into chip scroller on mobile.

## Accessibility

- Table/list semantics preserved across responsive modes.
- Filter controls labeled and operable via keyboard.
- Status changes announced through live region text.
- Detail tabs expose aria-selected and role semantics.

## Read-Model Inputs

- Launch type taxonomy registry (taxonomy only, not full SOR catalog).
- External system definition projection.
- URL policy pointer metadata.
- Freshness/degraded status indicators.
- Role permissions projection.

## Workflow Transitions

- External System Registry -> Launch Pad Home via breadcrumb.
- External System Registry -> Project Launch Links via context action.
- External System Registry -> Source Lineage Panel for selected record.
- Navigation transitions only; no write behaviors authorized.

## Acceptance Criteria

- Registry screen stays read-model oriented.
- Launcher taxonomy is treated as classification aid only.
- State model includes unavailable and degraded behaviors.
- Role visibility excludes write/command execution semantics.
- All required sections present.
