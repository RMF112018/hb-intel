# Gap 6 Projects Contract Reconciliation

## Summary

The repo-owned `Projects` contract, mapper, validation, tests, and all consuming code have been reconciled to the re-baselined Gap 6 target model (P9-G6-01).

Four mismatches between the repo contract and the live SharePoint schema have been resolved:

1. **`viewerUPNs`** — remapped from legacy `field_18` to named column `viewerUPNs`
2. **`addOns`** — remapped from legacy `field_19` to named column `addOns`
3. **`projectLeadId`** — removed (superseded by `leadEstimatorUpn`; SP column `field_17` intentionally absent)
4. **`additionalTeamMemberUpns`** — removed (overlapped with `groupMembers`; SP column intentionally absent)

## Fields Removed

### `projectLeadId`

- **Reason:** Superseded by `leadEstimatorUpn` at the business level. In code, `projectLeadId` was a legacy alias for the project manager role — `projectTeamFields.ts` already bridged `projectLeadId ↔ projectManagerUpn`. All code-level usages have been replaced with `projectManagerUpn`.
- **Removed from:** `IProjectSetupRequest` (`@hbc/models`), `IProjectsListItem` and `PROJECTS_LIST_FIELD_MAP` (`projects-list-contract.ts`), read/write paths in `projects-list-mapper.ts`, request handler pass-through, all consuming frontend and provisioning code
- **Replacement in provisioning:** `IProjectHubSeedData.projectLeadId` → `IProjectHubSeedData.projectManagerUpn`; handoff validation, mapping, and recipient resolution updated; BIC Completed-state owner updated; activation PM assignment updated
- **Replacement in frontend:** PWA TeamStep field binding and labels updated to `projectManagerUpn` / "Project Manager"; accounting detail page updated; estimating app submission path cleaned up

### `additionalTeamMemberUpns`

- **Reason:** Overlapped with `groupMembers`. The `groupMembers` field is now the single authoritative field for standard read/write project team members, derived from the defined role fields (`projectManagerUpn`, `leadEstimatorUpn`, `supportingEstimatorUpns`).
- **Removed from:** `IProjectSetupRequest`, `IProjectsListItem`, `PROJECTS_LIST_FIELD_MAP`, mapper read/write, JSON-array ceiling guard, request handler, `UPSTREAM_TEAM_FIELDS` and `getEligibleTimberscanApprovers` in `projectTeamFields.ts`, `PROJECT_SETUP_FIELD_MAP`, estimating app TeamStepBody people picker and ReviewStepBody display, NewRequestPage form init and submission, uiReviewProjectSetupClient test data

## Fields Retained with Final Semantics

| Field | Semantic | SP Column | SP Type |
|---|---|---|---|
| `groupMembers` | Standard read/write members — core project team. Derived from role fields during normalization. | `field_10` (GroupMembersJson) | Note |
| `groupLeaders` | Elevated workflow/project leaders. Derived from `projectExecutiveUpn` during normalization. | `field_11` (GroupLeadersJson) | Note |
| `viewerUPNs` | Project-level additive read-only exceptions only. Department defaults come from `projectViewerGroups`. | `viewerUPNs` (named) | Note |
| `addOns` | Selected add-on pack slugs. | `addOns` (named) | Note |
| `leadEstimatorUpn` | Authoritative lead estimator assignment. Supersedes the old `projectLeadId` concept. | `leadEstimatorUpn` (named) | Text |

## Test Evidence

- Mapper read/write tests updated: `projectLeadId`/`field_17` and `additionalTeamMemberUpns` assertions removed; `viewerUPNs`/`addOns` assertions updated to use named column names
- Field mapping tests updated: field count 43 → 41; legacy field_N loop adjusted for removed/remapped columns
- Request lifecycle tests updated: removed `projectLeadId` and `additionalTeamMemberUpns` round-trip tests
- Provisioning tests updated: handoff seed data, validation, recipient resolution, BIC owner, and activation all use `projectManagerUpn`
- Feature config tests updated: `getEligibleTimberscanApprovers` no longer includes `additionalTeamMemberUpns`; `normalizeProjectSetupTeamFields` no longer sets `projectLeadId` or includes `additionalTeamMemberUpns` in `groupMembers`
- Estimating app tests updated: factory objects and submission assertions cleaned up
- Field map count: 23 → 22

## Environment Residuals

No new environment residuals introduced by this reconciliation. The existing residuals from P9-G6-01 remain:
- `projectViewerGroups` data not populated (Prompt 3 scope for repo contract; data population is SharePoint Admin scope)
- `submittedByOid`/`completedByOid` environment provisioning tracked under P9-G5
