# Wireframe 01 — Launch Pad Home

## Purpose

Define the External Systems Launch Pad landing experience that summarizes available systems, project context readiness, and actionable state banners before users open project-specific link workflows.

## Personas

- Viewer: reads launch availability and system status.
- Operator: opens project links and monitors stale/degraded indicators.
- Reviewer: checks pending review counts and source-health warnings.
- Admin: verifies global registry posture and policy availability.

## Layout Zones

- Header zone: page title, project picker, last refresh, help link.
- Global state zone: empty/loading/unauthorized/blocked/stale/degraded banners.
- Bento overview zone: system tiles grouped by launch type taxonomy.
- Queue summary zone: review count, mapping correction count, audit alerts.
- Footer context zone: source-lineage hint and data freshness statement.

## Component Anatomy

- Command-center header with breadcrumb and project selector.
- Status banner stack with severity icon, short diagnosis, next-read action.
- Bento card grid: card title, system badge, availability chip, last sync marker.
- Summary cards: review queue, stale mappings, degraded systems.
- Read-only metadata panel: data timestamp and source lineage anchor.

## Actions

- Select project context.
- Open project launch links screen.
- Open review queue summary.
- Open mapping/source health summary.
- Open audit history summary.
- Open source-lineage panel.

## States

- Loading: skeletons for header, tiles, and summary cards.
- Empty: no launch definitions available for selected scope.
- Unauthorized: user can view shell but not launch content.
- Blocked: policy or mapping prerequisite missing.
- Stale: data older than freshness threshold.
- Degraded: upstream source degraded per degraded-state matrix input.
- Ready: full tile grid with actionable navigation.

## Role/Action Visibility

| Role     | Visible actions                                      | Hidden/disabled actions          |
| -------- | ---------------------------------------------------- | -------------------------------- |
| Viewer   | project select, open read-only detail panels         | no approve/archive affordances   |
| Operator | all viewer actions, open add/edit drawer entrypoints | no final approve/reject controls |
| Reviewer | all operator actions, open review queue filters      | no registry admin edit controls  |
| Admin    | all actions, registry and policy navigation          | none in UX scope                 |

## Responsive Behavior

- Desktop: four-column bento tile layout with persistent summary rail.
- Tablet: two-column tiles, summary rail drops below primary tiles.
- Mobile: single-column cards, sticky filter/action bar, condensed metadata chips.
- Container-fit behavior follows existing SPFx bento and command-center layout standards.

## Accessibility

- Keyboard sequence: header controls -> banners -> tiles -> summary cards -> footer context.
- Visible focus rings on all interactive cards and links.
- Banner changes announced via polite/urgent live regions by severity.
- Tile availability chips include text labels; no color-only semantics.
- Minimum contrast and spacing align with existing SPFx surface-quality standard.

## Read-Model Inputs

- Launch type taxonomy (read-only).
- Registry availability summary (read-only).
- Project context identity and permissions snapshot (read-only).
- Degraded-state evaluation summary (read-only input from degraded-state matrix).
- Queue counters and freshness timestamps (read-only).

## Workflow Transitions

- Home -> Project Launch Links when user selects a system tile.
- Home -> Custom Link Review Queue when queue summary selected.
- Home -> Mapping Source Health when mapping summary selected.
- Home -> Audit History when audit summary selected.
- Home -> HBI Source Lineage Panel when lineage link selected.
- Transitions define UX/future-command intent only; no runtime write behavior authorized.

## Acceptance Criteria

- Screen includes all required wireframe-spec sections.
- All core states render distinct banner treatment with deterministic copy placeholders.
- Role visibility matrix clearly distinguishes viewer/operator/reviewer/admin affordances.
- Mobile/tablet/desktop reflow is defined and consistent with repo bento standards.
- Accessibility requirements define keyboard order, announcements, and non-color status semantics.
- Read-model inputs are explicitly read-only with no write contract language.
