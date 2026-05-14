# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Executive Recommendation

**Recommended provisioning method:** create a **dedicated repo-native TypeScript provisioner** for the My Projects source-list schema expansion, implemented as a narrowly scoped operator-run script and backed by shared provisioning utilities factored from the existing legacy fallback provisioning lane.

Recommended script shape:

```text
scripts/provision-my-projects-source-list-schema.ts
```

Recommended implementation posture:

- Default to **dry-run**; require explicit `--apply` for mutation.
- Target only the two existing HBCentral lists:
  - `Projects`
  - `Legacy Project Fallback Registry`
- Never recreate either list.
- Never delete or recreate existing fields automatically.
- Create only missing compatible fields.
- Mark wrong-type fields as blocking drift requiring operator remediation.
- Emit auditable JSON evidence for every run.
- Reuse the existing SharePoint/PnP-style field creation semantics where appropriate, but factor them into a shared utility so the legacy fallback script and the new My Projects provisioner no longer duplicate logic.
- Run the existing read-only readiness verifier after mutation and treat `ready: true` as closure evidence.

## Why this is the best fit

The repo already has a mature provisioning pattern for SharePoint lists and fields: app-only token acquisition, PnP/REST field creation, descriptor-driven schema, compatibility checks, JSON reporting, post-provision validation, and unresolved drift classification. The existing legacy fallback provisioner is close, but not safe enough to reuse directly for this task because it is scoped to legacy fallback lists, can create lists, and does not default to a strict dry-run / explicit-apply posture.

A new dedicated provisioner avoids overloading `scripts/provision-legacy-fallback-lists.ts`, avoids accidental list creation/recreation behavior, and gives operators a clean mutation surface for exactly this schema expansion.

## Best answer to the primary question

Provision the missing My Projects fields using a **repo-native TypeScript provisioner over SharePoint list field APIs** rather than ad hoc portal edits, one-off PnP PowerShell, or direct Graph calls as the primary path. Use Microsoft Graph or SharePoint REST for verification/reporting where helpful, but keep the source of truth in repo descriptors and TypeScript tests.

## Required schema delta

### `Projects`

Add the following fourteen target fields if absent, all as `Note` / MultiLineText columns, not required, not indexed:

| Internal Name | Target Type | Required | Indexed | Storage / Semantics |
|---|---:|---:|---:|---|
| `leadEstimatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `estimatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `idsManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectAccountantUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectAdministratorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectCoordinatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `superintendentUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `leadSuperintendentUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `leadProjectManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `projectExecutiveUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `safetyCoordinatorUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `qcManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |
| `warrantyManagerUpns` | Note / MultiLineText | No | No | JSON-serialized `string[]` |


### `Legacy Project Fallback Registry`

Add the same fourteen target fields above, plus:

| Internal Name | Target Type | Required | Indexed | Storage / Semantics |
|---|---:|---:|---:|---|
| `procoreProject` | Text | No | No | Raw Procore project identifier/token |

## Critical caveat from operator-provided tenant evidence

The app-registration JSON confirms `HB SharePoint Creator` / app ID `08c399eb-a394-4087-b859-659d493f8dc7`. The Function App JSON confirms the deployed runtime is currently associated with UAMI client ID `77ad3593-5414-4122-a649-74916f8c0d7a`. Those are different identities. The provisioning command must run as the identity that actually has the required list-schema mutation permissions.

That means one of the following must be true before `--apply`:

1. The operator runs the provisioner using the `HB SharePoint Creator` app registration credential path, for example `AZURE_CLIENT_ID=08c399eb-a394-4087-b859-659d493f8dc7` plus the appropriate tenant/secret/certificate credential, or a pre-acquired `SHAREPOINT_BEARER_TOKEN`; or
2. The Function App UAMI `77ad3593-5414-4122-a649-74916f8c0d7a` is separately proven to have the required Microsoft Graph / SharePoint application permissions and HBCentral resource access.

## Method not recommended as primary

- **Direct Microsoft Graph columnDefinition script:** technically viable and officially supported, but less repo-conformant than the existing descriptor/PnP-style provisioning lane and would duplicate schema/drift semantics unless wrapped in the same repo abstractions.
- **PnP PowerShell-only runbook:** viable for an emergency operator action, but too weak for repeatability, automated testability, drift detection, and evidence closure unless paired with a repo-native verifier.
- **Portal/manual edits:** not recommended. No deterministic artifact, no unit tests, no repeatable drift detection, and too easy to create wrong internal names.
- **Modify the legacy fallback provisioner in place only:** not preferred. It risks mixing legacy-list creation duties with a different source-list expansion duty.

## Recommended operator run sequence

1. Confirm execution identity: app registration vs Function App UAMI.
2. Run read-only schema readiness:
   ```bash
   pnpm tsx scripts/verify-my-project-role-fields.ts --json
   ```
3. Run the new provisioner in dry-run mode:
   ```bash
   pnpm tsx scripts/provision-my-projects-source-list-schema.ts --json
   ```
4. Review JSON evidence for only expected `missing` fields and no wrong-type blockers.
5. Run with explicit apply:
   ```bash
   pnpm tsx scripts/provision-my-projects-source-list-schema.ts --apply --json
   ```
6. Re-run readiness verification and archive the `ready: true` JSON.
7. Run backfill dry-runs, then apply only after schema readiness is proven:
   ```bash
   pnpm tsx scripts/backfill-my-project-role-arrays.ts --json
   pnpm tsx scripts/backfill-my-project-role-arrays.ts --apply --json
   pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --json
   pnpm tsx scripts/backfill-my-project-legacy-registry-fields.ts --apply --json
   ```
8. Re-run readiness and functional read-model smoke checks.
