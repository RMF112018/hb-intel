# My Dashboard — My Projects Diagnostics

## What this is

A sanitized, machine-readable classification of "why are there N projects?" co-located with the My Projects read-model response payload. Operators triaging a hosted-tenant complaint ("user says they see zero projects") read one field — `response.data.diagnostics.classification` — to triage between five distinct causes without inspecting tokens, claims, or Application Insights traces.

The blob is produced deterministically by the backend provider (`my-project-links-read-model-provider.ts`) alongside the existing envelope assembly, passed through the route layer unchanged, and visible on the wire as a normal field of the JSON response. The optional `dataPath` marker (Prompt 02) and the `data-my-work-source-status` DOM marker (existing surface convention) remain the right tools for routing-layer triage; this diagnostics blob is the **provider-layer** classification.

## Classification values

| `classification`               | When it fires                                                                                                  | Meaning                                                                                                                                                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `available`                    | Both sources reach OK, principal resolved, ≥1 role match                                                       | Normal — the user has at least one assigned project                                                                                                                                                                                                               |
| `zero-match-available-sources` | Both sources reach OK, principal resolved, **0** role matches                                                  | The user is authenticated and the data layer is healthy, but no row in either source lists this UPN in any of the 14 canonical role fields (or the legacy 4-field fallback). Triage = data ownership / SharePoint assignment list contents, not auth or transport |
| `partial`                      | At least one source is bounded (`top` ceiling hit) or returned an error, but at least one source produced rows | Some rows may be missing — the response is a best-effort subset. May still include role matches                                                                                                                                                                   |
| `principal-unresolved`         | The actor's UPN claim is missing or not in a valid UPN format                                                  | The token reached the backend but `normalizeUpn(claims.upn)` returned `null`. See `principalUnresolvedReason` for the sub-cause                                                                                                                                   |
| `source-unavailable`           | Both source reads failed                                                                                       | Backend reached + principal resolved, but neither the Projects list nor the Legacy Fallback Registry returned. Triage = SharePoint/Graph transport, app permissions, or tenant connectivity                                                                       |

## Full diagnostics shape

```ts
interface MyProjectLinksDiagnostics {
  classification:
    | 'available'
    | 'zero-match-available-sources'
    | 'partial'
    | 'principal-unresolved'
    | 'source-unavailable';
  principalResolution: 'resolved' | 'unresolved';
  principalUnresolvedReason?: 'missing-upn' | 'invalid-upn-format';
  matchCount: number; // items.length after reconciliation
  projectsSourceStatus: MyWorkReadModelSourceStatus; // per-source readiness, projects list
  legacyFallbackRegistrySourceStatus: MyWorkReadModelSourceStatus; // per-source readiness, legacy fallback registry
}
```

`principalUnresolvedReason` values:

| Reason               | Cause                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `missing-upn`        | `claims.upn` (or fallback `preferred_username`) was empty or whitespace                   |
| `invalid-upn-format` | Claim was present but did not match the UPN regex (e.g., `'mallory'` or `'not-an-email'`) |

## Redaction rule (load-bearing)

The blob contains **only closed-set enums and numeric counts**. By construction it never includes:

- `claims.upn`, `claims.oid`, `claims.preferred_username`, `claims.name`
- The actor's `principalName`, `hbcUserId`, or `displayName`
- Any project name, project number, role string, or other tenant data

The provider test `'redacts: the diagnostics blob never contains the actor UPN, OID, or displayName for any branch'` serializes the blob and asserts the redaction holds for every classification path. Adding a new field to this interface that carries a raw actor value would fail that test.

The `data.actor.principalName` field on the envelope is **not part of the diagnostics blob** — that field is the existing read-model contract and is intentional (the My Projects card consumes it to show "for Avery"). The diagnostics blob is co-located but distinct.

## Where to find it on a hosted tenant

1. Open the My Dashboard SharePoint surface in a tenant browser session.
2. DevTools → Network tab → reload the page or trigger a refresh that hits `/api/my-work/me/project-links`.
3. Inspect the response body. The blob is at `response.data.diagnostics`:

```jsonc
{
  "data": {
    "mode": "backend",
    "sourceStatus": "available",
    "dataPath": "backend-live",
    "data": {
      "moduleId": "my-project-links",
      "actor": { "principalName": "…", "displayName": "…" },
      "summary": { … },
      "items": [ … ],
      "sourceReadiness": { "projects": "available", "legacyFallbackRegistry": "available" },
      "diagnostics": {
        "classification": "zero-match-available-sources",
        "principalResolution": "resolved",
        "matchCount": 0,
        "projectsSourceStatus": "available",
        "legacyFallbackRegistrySourceStatus": "available"
      }
    }
  }
}
```

## Operator triage table

| Reported symptom            | Read `data.diagnostics.classification` | Next step                                                                                                                                                                     |
| --------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "I see zero projects"       | `zero-match-available-sources`         | Confirm the user's UPN appears in one of the 14 canonical role fields on at least one row in Projects or Legacy Fallback Registry. This is a data-ownership problem, not auth |
| "I see zero projects"       | `principal-unresolved`                 | Inspect `principalUnresolvedReason`. If `missing-upn` → token issuance config (upn / preferred_username claim mapping). If `invalid-upn-format` → claim is shaped wrong       |
| "I see zero projects"       | `source-unavailable`                   | Backend reached the route but both SharePoint reads failed — check Graph permissions, network, and per-source health                                                          |
| "Some projects are missing" | `partial`                              | Check `projectsSourceStatus` / `legacyFallbackRegistrySourceStatus`. Bounded means we hit the row ceiling; failed means Graph rejected the read                               |
| "Looks fine"                | `available`                            | Default healthy state                                                                                                                                                         |

## Test-coverage map

| File                                                                                                                                               | Layer    | What it proves                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.test.ts` (Prompt 04 describe block) | Provider | Each of the five classifications is stamped correctly: principal-unresolved (with both reason codes), zero-match-available-sources, available, partial, source-unavailable. Plus a redaction test serializing the blob and asserting no UPN / OID / displayName leakage |
| `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.test.ts` (Prompt 04 assertion)                                           | Route    | `data.diagnostics` passes through the route layer unchanged                                                                                                                                                                                                             |
| `packages/models/src/myWork/MyProjectLinksReadModel.ts`                                                                                            | Contract | Closed-set `MY_PROJECT_LINKS_DIAGNOSTIC_CLASSIFICATIONS` and `MY_PROJECT_LINKS_PRINCIPAL_UNRESOLVED_REASONS` are exported; new classification values added in the future will trip the existing per-branch tests                                                        |

## Out of scope (future)

- Emit `logger.trackEvent('my-project-links.classification', diagnostics)` for Application Insights correlation. Deliberately deferred — the closed-set blob on the response payload is enough for hosted-tenant triage via DevTools and for test assertion.
- Surface the classification in user-facing UI. The frontend `MyProjectsHomeCard` already shows accurate `sourceStatus`-driven banners ("We could not confirm your project assignment identity for this view.", "Project launch sources are currently unavailable.", etc.); the new blob is for operator/test consumption, not end users.

## Hosted acceptance — operator checklist

1. Deploy and reproduce the user's report (or run as the user with `?adminoverride=…` if available).
2. DevTools → Network → `/api/my-work/me/project-links` → response body.
3. Read `response.data.diagnostics.classification` and `principalUnresolvedReason`.
4. Cross-reference with the **Operator triage table** above to identify the corrective action.
5. If `classification === 'zero-match-available-sources'`, the next remediation step is to verify the SharePoint role-list contents — not auth or transport.
