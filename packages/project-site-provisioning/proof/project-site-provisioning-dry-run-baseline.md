# Project Site Provisioning Dry-Run Proof — project-site-provisioning-dry-run-baseline

## Artifact identity

| Field | Value |
| --- | --- |
| Artifact kind | project-site-provisioning-dry-run-proof |
| Artifact version | 0.1.0-dry-run-proof |
| Artifact ID | project-site-provisioning-dry-run-baseline |
| Created at | 2026-04-28T00:00:00.000Z |
| Source commit | (none) |
| Dry-run only | true |
| Tenant mutation allowed | false |

## Source

| Field | Value |
| --- | --- |
| Template package | @hbc/project-site-template |
| Template name | HB Standard Project Site Template |
| Template version | 1.0.0-proposed |
| Contract ref | template-contract.json |
| Source commit | (none) |

## Manifest version

`0.2.0-contract-coverage`

## Mutation gate

| Field | Value |
| --- | --- |
| mutationLocked | true |
| liveMutationAllowed | false |
| requiresHumanApproval | true |
| approvalStatus | not-requested |
| approvedBy | (none) |
| approvedAt | (none) |
| approvalRef | (none) |

## Site plan

| Field | Value |
| --- | --- |
| Plan status | planned |
| Input project number | 26-000-00 |
| Project base number | 26-000 |
| Project base number (no hyphen) | 26000 |
| Resolved URL | /sites/26000 |
| URL status | derived |
| Resolved title | 26-000-00 HB Standard Project Site Baseline |
| Title status | derived |

## Object plan coverage

| Family | Status | Entries | Field count | Required | Optional |
| --- | --- | --- | --- | --- | --- |
| templateManifest | planned | 1 | 19 | 19 | 0 |
| enums | planned | 1 | (n/a) | (n/a) | (n/a) |
| settings | planned | 1 | 25 | 10 | 15 |
| permissions | planned | 1 | 17 | 15 | 2 |
| site | planned | 1 | 48 | 30 | 18 |
| pages | planned | 1 | 7 | 7 | 0 |
| libraries | planned | 1 | 16 | 10 | 6 |
| lists | planned | 1 | 41 | 19 | 22 |
| modules | planned | 1 | 15 | 9 | 6 |
| workflows | planned | 1 | 21 | 19 | 2 |
| integrations | planned | 1 | 42 | 28 | 14 |
| siteHealth | planned | 1 | 18 | 13 | 5 |
| provisioningValidation | planned | 1 | 22 | 16 | 6 |
| validationRules | planned | 1 | (n/a) | (n/a) | (n/a) |

## Integrity and scans

| Field | Value |
| --- | --- |
| plannedHash | 587166e4ae01ff52da01aaf48d90a6ed017919f36a943c135ee6d761d702a584 |
| Hash algorithm | sha256 |
| noSecretScan | ok |
| noProcoreMirrorScan | ok |
| noTenantMutationScan | ok |

## Source coverage

| Field | Value |
| --- | --- |
| Contract families declared | 14 |
| Fixtures processed | 14 |
| Field maps processed | 12 |
| Object catalog rows processed | 18 |

## Warnings

(none)

## Blockers

(none)

## Operator review checklist

- [ ] Confirm template name and version match approved release
- [ ] Confirm site URL convention matches PCC frozen rule
- [ ] Confirm all 14 family slots show "planned" status
- [ ] Confirm plannedHash matches expected baseline (or matches re-derivation)
- [ ] Confirm all three scans report ok
- [ ] Confirm no warnings indicate unexpected placeholder coverage
- [ ] Confirm no blockers
- [ ] Confirm mutation gate remains locked
- [ ] Confirm approvalStatus is not-requested or pending — not approved

---

This proof artifact is a dry-run planning artifact only. It does not create or modify SharePoint, Graph, PnP, Procore, SPFx, backend, or tenant resources.
