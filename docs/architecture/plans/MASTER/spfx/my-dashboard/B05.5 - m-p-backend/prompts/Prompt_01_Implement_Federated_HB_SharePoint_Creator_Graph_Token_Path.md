# Prompt 01 — Implement Federated HB SharePoint Creator Graph Token Path

## Objective

Implement the backend credential seam that makes Graph-backed SharePoint list access execute under the **HB SharePoint Creator** app registration by exchanging the Function App UAMI assertion through the federated credential already configured in Entra.

The target identity architecture and current root cause are locked in:

- `supporting/00_Locked_Current_State_And_Root_Cause.md`
- `supporting/01_Operator_Completed_Entra_Federated_Credential_Evidence.md`

Follow the scope and editing guardrails in:

- `supporting/03_Implementation_Guardrails_And_Non_Negotiables.md`

Use the repo inspection map in:

- `supporting/02_Repo_Truth_Inspection_Seams.md`

---

# Required Implementation

## 1. Introduce a shared Graph access-token provider

Create a backend-shared implementation adjacent to the Graph list client, unless current repo taxonomy reveals a more canonical services location. The preferred implementation location is:

```text
backend/functions/src/services/legacy-fallback/federated-graph-token-provider.ts
```

The implementation should expose a small, testable seam such as:

```ts
export interface IGraphAccessTokenProvider {
  getGraphAccessToken(): Promise<string>;
}
```

and a production implementation that:

- reads:
  - `AZURE_TENANT_ID`
  - `AZURE_CLIENT_ID`
  - `HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID`
  - `HBC_LEGACY_FALLBACK_GRAPH_SCOPE` where already appropriate
- uses:
  - `ManagedIdentityCredential({ clientId: AZURE_CLIENT_ID })`
  - `ClientAssertionCredential(AZURE_TENANT_ID, HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID, assertionProvider)`
- requests the managed identity assertion for:
  - `api://AzureADTokenExchange/.default`
- requests the final downstream Graph token for:
  - `https://graph.microsoft.com/.default`
  - or the repo’s existing `HBC_LEGACY_FALLBACK_GRAPH_SCOPE` if that remains exactly equivalent.

## 2. Fail safely and preserve telemetry classification

Credential/federation/token failures must throw a bounded error that remains classifiable by existing My Projects runtime diagnostics as:

```text
stage = token
```

The current classifier keys on the prefix:

```text
graph-list-client: token acquisition failed
```

Preserve that prefix or update the classifier/tests in the same commit so token/federation failures still classify as `token`.

Do not expose:

- raw access tokens;
- managed identity assertion tokens;
- JWT-like fragments;
- client secrets;
- full upstream error bodies beyond already accepted sanitized telemetry conventions.

## 3. Rewire `GraphListClient`

Modify:

```text
backend/functions/src/services/legacy-fallback/graph-list-client.ts
```

so that:

- it no longer directly instantiates `DefaultAzureCredential` for Graph tokens;
- it uses the shared federated token provider as its default production token source;
- it remains unit-testable;
- optional dependency injection may be used if consistent with existing test style.

Preserve:

- native `fetch` Graph call behavior;
- site/list/item pagination behavior;
- list write methods;
- current error style used by downstream diagnostics.

## 4. Confirm all GraphListClient consumers inherit the standardized path

Do not hand-patch one consumer while leaving the shared client direct-UAMI. The required target is shared behavior:

- My Projects project-links read model;
- legacy fallback read / discovery / repository logic;
- other existing backend GraphListClient consumers.

## 5. Preserve Adobe Sign and Table Storage posture

Audit imports/call graph only enough to confirm your patch does not alter:

- Adobe Sign OAuth / refresh / search / action queue code;
- Adobe Sign grant-store or refresh-token store table clients;
- `createAppTableClient(...)`;
- Function App UAMI-based Azure Table auth.

No functional code changes should land in Adobe Sign files for this patch.

---

# Required Microsoft Flow

Implement the supported flow:

```text
ManagedIdentityCredential(clientId: Function App UAMI client ID)
→ getToken(api://AzureADTokenExchange/.default)
→ ClientAssertionCredential(
     tenantId: AZURE_TENANT_ID,
     clientId: HB SharePoint Creator app/client ID,
     assertionProvider: returns the UAMI assertion token
   )
→ getToken(https://graph.microsoft.com/.default)
```

---

# Tests Required

Add or update focused tests to cover the new federated Graph token provider.

At minimum, validate:

1. It creates the managed identity assertion request using:
   - `AZURE_CLIENT_ID`
   - audience `api://AzureADTokenExchange/.default`

2. It creates the app assertion credential using:
   - `AZURE_TENANT_ID`
   - `HBC_LEGACY_FALLBACK_MANAGED_APP_CLIENT_ID`

3. It requests the downstream Graph token using:
   - `https://graph.microsoft.com/.default`
   - or the already-existing equivalent graph-scope setting if repo truth keeps that configurable.

4. It returns the Graph token when both exchanges succeed.

5. It throws a sanitized, bounded, token-classifiable error when:
   - the managed identity assertion token is absent;
   - the final Graph token is absent;
   - required env values are missing or blank.

6. `classifyGraphErrorStage(...)` still returns:
   - `token`
   for federated-token-provider failures surfaced through the Graph list client.

7. Existing My Projects runtime diagnostics tests remain passing.

8. Existing GraphListClient tests remain passing or are updated only as needed for the new injected token-provider seam.

---

# Validation Commands

Run and report exact outcomes:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm exec prettier --check <all changed files>
```

If the repo has a narrower focused test command for the new provider, run that first and include the result, but still run the full Functions validation above.

---

# Completion Criteria

Prompt 01 is complete only when:

- `GraphListClient` no longer obtains Graph tokens directly through `DefaultAzureCredential`.
- Graph tokens are obtained through the federated HB SharePoint Creator app path.
- Token failures remain clearly classifiable as `token`.
- No Adobe Sign implementation files were modified.
- Functions typecheck/test/build all pass.
- The implementation is ready for backend deployment and hosted reproduction.

---

# Required Response Format

Follow:

```text
supporting/05_Commit_Closeout_Template.md
```

For Prompt 01, include:

1. Implementation Verdict
2. Files Changed
3. Key Implementation Details
4. Validation Ledger
5. Deployment / Runtime Proof Instructions
6. Commit Summary and Description

Do not push or deploy unless separately authorized.
