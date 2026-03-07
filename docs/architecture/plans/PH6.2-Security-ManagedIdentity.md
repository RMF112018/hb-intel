# PH6.2 — Security & Managed Identity

**Version:** 2.0
**Purpose:** Replace every `authLevel: 'anonymous'` endpoint in the backend with Bearer token validation. Configure the Azure AD app registration for the Function App. Enable the system-assigned Managed Identity and grant it the exact SharePoint and Graph permissions each saga step requires. Implement the real `msal-obo-service.ts`. Produce the ADR and developer runbook for the security model.
**Audience:** Implementation agent(s), Azure platform administrator, technical reviewers.
**Implementation Objective:** Zero anonymous production endpoints. All provisioning HTTP routes validate an Entra ID Bearer token. All SharePoint and Graph calls execute under Managed Identity. Local development uses a developer service principal defined in `local.settings.json`.

---

## Prerequisites

- PH6.1 complete and passing.
- Access to the Azure Portal for the HB Intel subscription.
- Azure CLI (`az`) installed locally.

---

## 6.2.1 — Azure AD App Registration

Perform the following steps in the Azure Portal or via Azure CLI. Record all IDs in a secure location (Key Vault or GitHub secrets — never in source code).

**Create the app registration:**
```bash
az ad app create \
  --display-name "HB Intel Functions" \
  --sign-in-audience AzureADMyOrg
```

Record the `appId` (Client ID) from the output as `AZURE_CLIENT_ID`.

**Expose an API scope:**

In the Azure Portal → App Registration → "Expose an API":
- Set Application ID URI: `api://{AZURE_CLIENT_ID}`
- Add scope: `user_impersonation` — Admins and users can consent — Display name: "Access HB Intel Functions"

**Add required Graph permissions (application permissions for Managed Identity — see 6.2.3):**

Do NOT add delegated permissions to the app registration. All Graph/SharePoint calls use Managed Identity (application identity), not user-delegated tokens.

**Record:**
- `AZURE_TENANT_ID` — your Azure AD tenant ID
- `AZURE_CLIENT_ID` — the app registration Client ID
- `AZURE_FUNCTION_APP_URL` — the production Function App URL

---

## 6.2.2 — Bearer Token Validation Middleware

Create `backend/functions/src/middleware/validateToken.ts`:

```typescript
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { HttpRequest } from '@azure/functions';

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;

const JWKS = createRemoteJWKSet(
  new URL(`https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`)
);

export interface IValidatedClaims {
  upn: string;
  oid: string;
  roles: string[];
}

/**
 * Validates the Bearer token from the Authorization header.
 * Returns the validated claims or throws if invalid.
 */
export async function validateToken(request: HttpRequest): Promise<IValidatedClaims> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header');
  }

  const token = authHeader.slice(7);

  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://sts.windows.net/${TENANT_ID}/`,
    audience: `api://${CLIENT_ID}`,
  });

  const claims = payload as JWTPayload & {
    upn?: string;
    preferred_username?: string;
    oid: string;
    roles?: string[];
  };

  return {
    upn: (claims.upn ?? claims.preferred_username) || '',
    oid: claims.oid,
    roles: claims.roles ?? [],
  };
}

/**
 * Returns a 401 response object for unauthenticated requests.
 */
export function unauthorizedResponse(reason: string) {
  return {
    status: 401,
    jsonBody: { error: 'Unauthorized', reason },
  };
}
```

Install `jose` as a production dependency:
```bash
cd backend/functions
npm install jose
```

---

## 6.2.3 — Update All HTTP Endpoints

Update `backend/functions/src/functions/provisioningSaga/index.ts`. Apply the same pattern to all four HTTP handlers (`provisionProjectSite`, `getProvisioningStatus`, `retryProvisioning`, `escalateProvisioning`):

```typescript
import { validateToken, unauthorizedResponse } from '../../middleware/validateToken.js';

app.http('provisionProjectSite', {
  methods: ['POST'],
  authLevel: 'anonymous',  // Azure validates the JWT — 'anonymous' here means
                            // Azure doesn't add its own key check; our middleware does it.
  route: 'provision-project-site',
  handler: async (request, context) => {
    const logger = createLogger(context);

    // 1. Validate Bearer token
    let claims: IValidatedClaims;
    try {
      claims = await validateToken(request);
    } catch {
      return unauthorizedResponse('Invalid or missing Bearer token');
    }

    try {
      const body = (await request.json()) as IProvisionSiteRequest;
      // Overwrite triggeredBy with the validated identity — never trust client-supplied value
      body.triggeredBy = claims.upn;

      if (!body.projectId || !body.projectNumber || !body.projectName) {
        return { status: 400, jsonBody: { error: 'Missing required fields' } };
      }

      // Validate projectNumber format
      if (!/^\d{2}-\d{3}-\d{2}$/.test(body.projectNumber)) {
        return { status: 400, jsonBody: { error: 'projectNumber must match ##-###-## format' } };
      }

      const services = createServiceFactory();
      const orchestrator = new SagaOrchestrator(services, logger);

      orchestrator.execute(body).catch((err) => {
        logger.error('Saga execution failed', {
          projectId: body.projectId,
          correlationId: body.correlationId,
          error: err instanceof Error ? err.message : String(err),
        });
      });

      return {
        status: 202,
        jsonBody: {
          message: 'Provisioning started',
          projectId: body.projectId,
          correlationId: body.correlationId,
        },
      };
    } catch (err) {
      logger.error('Failed to start provisioning', {
        error: err instanceof Error ? err.message : String(err),
      });
      return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
  },
});
```

**Note on `authLevel: 'anonymous'`:** Azure Functions `authLevel` controls whether Azure's own host-level function key is required. Setting it to `'anonymous'` does NOT mean the endpoint is unsecured — our `validateToken` middleware performs the full JWT validation. This is the correct pattern for Entra ID Bearer token auth in Azure Functions v4 Node.js.

---

## 6.2.4 — Managed Identity Configuration

**Enable system-assigned Managed Identity on the Function App:**
```bash
az functionapp identity assign \
  --name <FUNCTION_APP_NAME> \
  --resource-group <RESOURCE_GROUP>
```

Record the `principalId` from the output as `MANAGED_IDENTITY_PRINCIPAL_ID`.

**Grant SharePoint permissions to the Managed Identity:**

The following Microsoft Graph application permissions must be granted to the Managed Identity. These cannot be granted via the Portal UI — use the Azure CLI:

```bash
# Get the SharePoint service principal ID
$SP_ID=$(az ad sp list --display-name "Office 365 SharePoint Online" --query "[0].id" -o tsv)

# Grant Sites.FullControl.All (required for site creation, library creation, permissions)
az ad app permission grant --id $SP_ID --scope "Sites.FullControl.All"

# Grant User.Read.All (required for group member resolution by UPN)
$GRAPH_SP=$(az ad sp list --display-name "Microsoft Graph" --query "[0].id" -o tsv)
az rest --method POST \
  --url "https://graph.microsoft.com/v1.0/servicePrincipals/$GRAPH_SP/appRoleAssignments" \
  --body "{\"principalId\":\"$MANAGED_IDENTITY_PRINCIPAL_ID\",\"resourceId\":\"$GRAPH_SP\",\"appRoleId\":\"<User.Read.All roleId>\"}"
```

**Important:** `Sites.FullControl.All` is a high-privilege permission. Document this in the security ADR and ensure it is scoped to the minimum required. In a future phase, consider scoping to specific site collections.

---

## 6.2.5 — Real `msal-obo-service.ts` Implementation

Replace the existing stub with a real implementation that acquires a token using the Managed Identity:

```typescript
import { DefaultAzureCredential } from '@azure/identity';

export interface IMsalOboService {
  getSharePointToken(siteUrl: string): Promise<string>;
}

/**
 * Production implementation — acquires a token for SharePoint using
 * the Function App's system-assigned Managed Identity.
 * No client secrets, no passwords, no rotation required.
 */
export class ManagedIdentityOboService implements IMsalOboService {
  private readonly credential = new DefaultAzureCredential();

  async getSharePointToken(siteUrl: string): Promise<string> {
    const tenantHost = new URL(siteUrl).hostname; // e.g. hbconstruction.sharepoint.com
    const resource = `https://${tenantHost}/.default`;

    const tokenResponse = await this.credential.getToken(resource);
    if (!tokenResponse?.token) {
      throw new Error('Failed to acquire Managed Identity token for SharePoint');
    }
    return tokenResponse.token;
  }
}
```

Install the Azure Identity SDK:
```bash
cd backend/functions
npm install @azure/identity
```

---

## 6.2.6 — `local.settings.json` for Development

The `local.settings.json` file is gitignored. Each developer creates it locally. Document the required values in `backend/functions/README.md`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_TENANT_ID": "<your-tenant-id>",
    "AZURE_CLIENT_ID": "<app-registration-client-id>",
    "AZURE_CLIENT_SECRET": "<dev-service-principal-secret>",
    "AzureSignalRConnectionString": "<signalr-connection-string>",
    "AZURE_STORAGE_CONNECTION_STRING": "UseDevelopmentStorage=true",
    "SHAREPOINT_TENANT_URL": "https://hbconstruction.sharepoint.com",
    "SHAREPOINT_HUB_SITE_ID": "<hub-site-id>",
    "PROVISIONING_STEP5_TIMEOUT_MS": "90000",
    "ADMIN_SIGNALR_GROUP": "provisioning-admin"
  }
}
```

For local development, use a **developer service principal** (not Managed Identity) so developers don't need Azure IMDS access. `DefaultAzureCredential` will automatically use the client secret from environment variables when `AZURE_CLIENT_SECRET` is set.

---

## 6.2.7 — Create Security ADR

**`docs/architecture/adr/0062-security-managed-identity.md`:**
```markdown
# ADR-0062: API Security — Bearer Token Validation + Managed Identity

**Status:** Accepted
**Date:** 2026-03-07

## Context
All HTTP endpoints in the initial Phase 6 scaffold used authLevel: 'anonymous'.
A production system handling SharePoint site creation cannot have unauthenticated endpoints.

## Decision
All HTTP endpoints validate an Entra ID Bearer token via the `validateToken` middleware
(using the `jose` library). The `triggeredBy` / `submittedBy` fields are always overwritten
with the identity from the validated token — never trusted from the request body.

All SharePoint and Graph API calls use the Function App's system-assigned Managed Identity
(`DefaultAzureCredential`). No client secrets are used for SharePoint access in production.

The timer trigger uses Managed Identity only, with no user context.

## Consequences
Developers must configure a local service principal in `local.settings.json` (gitignored).
`Sites.FullControl.All` is a high-privilege Graph permission — scoping to specific site
collections should be evaluated in a future phase.
```

---

## 6.2 Success Criteria Checklist

- [ ] 6.2.1 Azure AD app registration created; `AZURE_TENANT_ID` and `AZURE_CLIENT_ID` recorded.
- [ ] 6.2.2 `validateToken` middleware implemented with `jose`; all endpoints call it as first step.
- [ ] 6.2.3 `triggeredBy` is always set from the validated token, never from request body.
- [ ] 6.2.4 `projectNumber` format validated as `##-###-##` in the provision endpoint.
- [ ] 6.2.5 Managed Identity enabled on Function App; SharePoint and Graph permissions granted.
- [ ] 6.2.6 `ManagedIdentityOboService` implemented; `MockMsalOboService` retained for test use only.
- [ ] 6.2.7 `local.settings.json` template documented in `backend/functions/README.md`.
- [ ] 6.2.8 ADR-0062 created and committed.
- [ ] 6.2.9 `pnpm turbo run build --filter=backend-functions` passes.

## PH6.2 Progress Notes

_(To be completed during implementation)_

- 6.2.1 completed: YYYY-MM-DD
- 6.2.2 completed: YYYY-MM-DD
- 6.2.3 completed: YYYY-MM-DD
- 6.2.4 completed: YYYY-MM-DD
- 6.2.5 completed: YYYY-MM-DD
- 6.2.6 completed: YYYY-MM-DD
- 6.2.7 completed: YYYY-MM-DD
- 6.2.8 completed: YYYY-MM-DD — ADR-0062 created

### Verification Evidence

- `grep -r "authLevel: 'anonymous'" backend/functions/src/functions --include="*.ts"` → confirm zero HTTP endpoints remain anonymous in production paths — PASS / FAIL
- `pnpm turbo run build --filter=backend-functions` → EXIT 0 — PASS / FAIL
- Manual test: POST to provisioning endpoint without Authorization header → 401 response — PASS / FAIL
- Manual test: POST with valid dev service principal token → 202 response — PASS / FAIL
