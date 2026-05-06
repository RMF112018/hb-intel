# 03 — Surface Layout Usage Inventory

## Objective

Document current routed surface composition and the Wave D target for each surface.

## Routed Surface Inventory

| Surface | Path(s) | Current composition | Confirmed layout concern | Wave D target |
| --- | --- | --- | --- | --- |
| Project Home | `surfaces/projectHome/PccProjectHome.tsx` | 10 direct cards: intelligence, priority actions, site health, documents, readiness, approvals, external systems, team, missing config, recent activity | Broad dashboard can look like peer/equal cards; must preserve direct children | Tier 1 Project Intelligence; Tier 2 Priority Actions / readiness / approvals / docs; Tier 3 snapshots, recent activity, missing config as reference. |
| Team & Access | `surfaces/teamAccess/*` | Header plus role/permission/access-manager lanes; restricted card appears for non-manager | Known severe narrow-column evidence; lane hierarchy can flatten | Tier 1 Team & Access command/context; Tier 2 access manager / request queue; Tier 2 team viewer if primary workflow; Tier 3 reference/persona/status details. |
| Documents | `surfaces/documents/PccDocumentsSurface.tsx` | Header, 3 lane cards, permissions, reviews | Three formal lanes can flatten if equal weight | Tier 1 Document Control context; Tier 2 Project Record and Reviews; Tier 3 My Project Files, external references, permissions. |
| Project Readiness | `surfaces/projectReadiness/PccProjectReadinessSurface.tsx` plus subregions | Many direct cards across readiness, lifecycle, permits, responsibility matrix, constraints, buyout, Procore | Card-heavy; hierarchy can collapse into a long equal-weight wall | Tier 1 readiness hero; Tier 2 blockers, lifecycle map, permit/inspection, responsibility matrix; Tier 3 evidence, downstream modules, Procore source confidence, reference logs. |
| Approvals | `surfaces/approvals/PccApprovalsSurface.tsx` | Home, queue, my approvals, registry, escalation, admin verify, policy, modules, decision history, lineage, HBI boundary | 11 cards with mixed operational/deferred content | Tier 1 approvals home; Tier 2 queue/my approvals/escalation/admin verification; Tier 3 registry, policy, modules, history/lineage/HBI. |
| External Systems | `surfaces/externalSystems/PccExternalSystemsSurface.tsx` | Header, summary, links, review queue, Procore config, registry, mapping, source health, audit, HBI lineage, portal drawer | Many cards with different purposes; drawer excluded from grid | Tier 1 launch pad header; Tier 2 project links/review queue/mapping status; Tier 3 registry/source health/audit/HBI/Procore config. |
| Control Center Settings | `surfaces/controlCenterSettings/PccControlCenterSettingsSurface.tsx` | Header, full settings lanes, wide missing setup | Full-width lanes can waste canvas | Tier 1 governance/settings overview; Tier 2 editable/locked setting groups; Tier 3 missing setup/reference notes. |
| Site Health | `surfaces/siteHealth/PccSiteHealthSurface.tsx` | Overview, checks, drift, repair requests, Procore sync/repair | Repair/security hierarchy needs stronger prioritization | Tier 1 site health overview; Tier 2 checks/drift/repair posture; Tier 3 Procore sync/reference repair requests. |

## Surface-Level Contract to Apply

Every routed surface should expose:

- exactly one Tier 1 command/context card;
- at least one operational content region unless the surface is intentionally unavailable;
- reference cards grouped visually below/after operational regions;
- no unexplained dead canvas above the fold;
- no two unrelated cards with equal visual priority when one clearly drives workflow;
- predictable responsive order: context → critical operation → supporting operation → reference.

## Surface-Specific Notes

### Team & Access

Highest-risk Wave D surface. The local agent must capture before/after screenshots under:

- wide desktop;
- simulated SharePoint constrained width;
- tablet;
- narrow container.

The acceptance test is not simply “no clipped card.” The route must read as a usable access-management surface: header/context first, primary workflow next, supporting/reference lanes after.

### Project Readiness and Approvals

These surfaces are most exposed to equal-weight card sprawl. Avoid solving by making all cards `wide` or `full`; that increases scrolling and dead canvas. Instead, define meaningful operational rows and compact reference rows.

### External Systems

The portal drawer must remain outside the bento grid and must not be counted as a grid child. Any surface tests must account for this intentionally.

### Settings and Site Health

These can be remediated with fewer source changes but still need tier markers and screenshot evidence.
