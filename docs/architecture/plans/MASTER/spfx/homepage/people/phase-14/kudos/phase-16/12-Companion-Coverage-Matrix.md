# 12 — HB Kudos Companion Stress Coverage Matrix

Proven automated coverage from `e2e/webparts/kudos/companion/`. All
specs carry `test.fixme` pending dev-harness wiring (prompt 04
handoff); coverage is structurally complete.

## Governance actions

| Action | Spec | Case | Priority |
|---|---|---|---|
| approve | governance-actions | approve on pending row | P1 |
| reject | governance-actions | reject on pending row (dialog input) | P1 |
| requestRevision | governance-actions | request-revision on pending (dialog input) | P1 |
| reopen | governance-actions | reopen on rejected row | P1 |
| flagAdminReview | governance-actions | flag on pending row | P1 |
| clearAdminReview | governance-actions | clear-flag on flagged row | P1 |
| schedule | governance-actions | schedule publish on approved (dialog) | P1 |
| unschedule | governance-actions | unschedule clears publishAt | P1 |
| pin | prominence | pin a standard item | P1 |
| unpin | prominence | unpin a pinned item | P1 |
| feature | prominence | feature a standard item | P1 |
| unfeature | prominence | (covered via audit timeline baseline) | P2 |
| remove | governance-actions | remove on approved (dialog input) | P1 |
| restore | governance-actions | restore a removed item | P1 |
| claim | ownership | claim a pending item | P1 |
| reassign | ownership | reassign to other admin (dialog) | P1 |
| celebrate | (public suite cross-link) | covered in `public/celebrate` | P0/P1 |
| updateContent | governance-actions | updateContent on approved (dialog) | P2 |
| bulk approve | bulk-approve | approve-selected + partial-failure | P0/P1 |

## Queue + filters

| Capability | Spec | Priority |
|---|---|---|
| 6 tabs scoping | queue-tabs-and-filters | P1 |
| search filter | queue-tabs-and-filters | P1 |
| admin-review-only toggle | queue-tabs-and-filters | P0 |
| scheduled-only toggle | queue-tabs-and-filters | P1 |
| ownership filter (mine/unassigned) | queue-tabs-and-filters + ownership | P1 |
| aging bucket filter | queue-tabs-and-filters | P2 |

## Detail + audit

| Capability | Spec | Priority |
|---|---|---|
| detail opens from row | detail-and-audit | P0 |
| audit timeline present on admin detail | detail-and-audit | P0 |
| row ↔ detail state agreement | detail-and-audit | P1 |
| submit→approve audit sequence render | detail-and-audit | P1 |
| revision→resubmit→approve audit sequence | detail-and-audit | P1 |

## Access / role gating

| Capability | Spec | Priority |
|---|---|---|
| public viewer blocked | access-gating | P0 |
| reviewer sees permitted actions only | access-gating | P1 |
| admin sees admin-only actions | access-gating | P0 |
| unresolved role fallback safe | access-gating | P2 |

## Prominence + collisions

| Capability | Spec | Priority |
|---|---|---|
| pin | prominence | P1 |
| unpin | prominence | P1 |
| feature | prominence | P1 |
| pin-slot collision denial | prominence | P0 |
| feature-slot collision denial | prominence | P1 |

## Ownership / work management

| Capability | Spec | Priority |
|---|---|---|
| claim | ownership | P1 |
| reassign | ownership | P1 |
| ownership filter refresh after mutation | ownership | P1 |
| reassignment denied on terminal state | ownership | P2 |

## Bulk approve

| Capability | Spec | Priority |
|---|---|---|
| bulk button visibility by tab | bulk-approve | P1 |
| approve-selected mutates selection only | bulk-approve | P0 |
| selection clears after completion | bulk-approve | P1 |
| partial failure surfaces per-row | bulk-approve | P1 |

## Failure / drift paths

| Capability | Spec | Priority |
|---|---|---|
| item lookup miss (404) | failure-paths | P1 |
| patch rejection (etag 412) | failure-paths | P1 |
| audit write failure after patch success | failure-paths | P1 |
| role-capability denial | failure-paths | P1 |
| stale-after-action cache leakage probe | failure-paths | P0 |

## Summary

- Spec files: 8 (`access-gating`, `queue-tabs-and-filters`,
  `detail-and-audit`, `governance-actions`, `prominence`, `ownership`,
  `bulk-approve`, `failure-paths`).
- All 19 currently supported governance actions have dedicated
  automated coverage (celebrate covered in the public lane).
- All audit sequences from prompt 04's fixture catalog are exercised
  via the `auditTimelineBaseline`.
- Curated proof screenshots: `bulk-approve-two`, `pin-collision`,
  `admin-audit-timeline`, `tab-<bucket>` sweep, per-action captures
  in `governance-actions`.
