# SF04-T06 — Azure Function + SharePoint List

**Phase Reference:** Foundation Plan Phase 2 (Shared Packages)
**Decisions Applied:** D-01 (sequential enforcement + bypass), D-06 (server-side completion trigger), D-08 (ACK_CONTEXT_TYPES)
**Estimated Effort:** 0.5 sprint-weeks
**Wave:** 1

---

## Objective

Define the `POST /api/acknowledgments` Azure Function contract (request validation, sequential order enforcement, bypass flag, completion detection, BIC/notification dispatch), the `GET /api/acknowledgments` endpoint, and the `HbcAcknowledgmentEvents` SharePoint list schema with its setup script.

---

## 3-Line Plan

1. Define the Azure Function request/response contracts and the sequential enforcement logic (D-01) including bypass flag validation.
2. Specify the completion detection logic and server-side side-effects (D-06): BIC transfer trigger + notification dispatch.
3. Define the SharePoint list schema and setup script.

---

## Azure Function: `POST /api/acknowledgments`

### Endpoint

```
POST /api/acknowledgments
Authorization: Bearer {AAD token}
Content-Type: application/json
```

### Request Body

```typescript
// ISubmitAcknowledgmentRequest (from T02)
{
  contextType: AckContextType;      // Must be a value from ACK_CONTEXT_TYPES (D-08)
  contextId: string;                // Record ID
  partyUserId: string;              // UPN of submitting user
  status: 'acknowledged' | 'declined';
  declineReason?: string;
  declineCategory?: string;
  acknowledgedAt: string;           // Client ISO 8601 timestamp (D-02)
  bypassSequentialOrder?: boolean;  // Requires AcknowledgmentAdmin role (D-01)
}
```

### Azure Function Implementation

```typescript
// api/acknowledgments/post.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getAADClaims, hasRole } from '../auth/aadClaims';
import { getSharePointClient } from '../sharepoint/client';
import { getBicClient } from '../bic/client';
import { getNotificationClient } from '../notification/client';
import type { ISubmitAcknowledgmentRequest } from '@hbc/acknowledgment';

app.http('postAcknowledgment', {
  methods: ['POST'],
  authLevel: 'anonymous', // AAD enforced via token validation below
  route: 'acknowledgments',
  handler: async (req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> => {
    // ── Auth ──────────────────────────────────────────────────────────────
    const claims = await getAADClaims(req);
    if (!claims) return { status: 401, body: 'Unauthorized' };

    const body = (await req.json()) as ISubmitAcknowledgmentRequest;

    // ── Validate contextType (D-08) ───────────────────────────────────────
    const VALID_CONTEXT_TYPES = Object.values(ACK_CONTEXT_TYPES);
    if (!VALID_CONTEXT_TYPES.includes(body.contextType)) {
      return { status: 400, body: `Unknown contextType: ${body.contextType}` };
    }

    const sp = getSharePointClient();

    // ── Fetch existing events for this record ─────────────────────────────
    const existingEvents = await sp.getAcknowledgmentEvents(
      body.contextType,
      body.contextId
    );

    // ── Sequential order enforcement (D-01) ──────────────────────────────
    // Resolve config for this contextType/contextId to get party order.
    // NOTE: Party order is resolved server-side via a registry lookup.
    const config = await getAcknowledgmentConfig(body.contextType, body.contextId);
    if (!config) return { status: 404, body: 'Acknowledgment config not found' };

    if (config.mode === 'sequential') {
      const isAckAdmin = hasRole(claims, 'AcknowledgmentAdmin');
      const currentParty = resolveCurrentSequentialParty(config.parties, existingEvents);

      if (currentParty?.userId !== body.partyUserId) {
        // Out of order — check for bypass (D-01)
        if (!body.bypassSequentialOrder) {
          return {
            status: 403,
            body: `Sequential order violation: expected ${currentParty?.userId ?? 'none'}, got ${body.partyUserId}`,
          };
        }
        if (!isAckAdmin) {
          return {
            status: 403,
            body: 'bypassSequentialOrder requires AcknowledgmentAdmin role',
          };
        }
        // Bypass authorised — will write status: 'bypassed' below
        ctx.log(`Bypass authorised for ${body.partyUserId} by admin ${claims.upn}`);
      }
    }

    // ── Check for decline block (D-09) ────────────────────────────────────
    const isBlocked = existingEvents.some(
      (e) => e.Status === 'declined' && config.parties.find((p) => p.userId === e.PartyUserId)?.required
    );
    if (isBlocked) {
      return { status: 409, body: 'Acknowledgment is blocked by a prior decline' };
    }

    // ── Write event ───────────────────────────────────────────────────────
    const isBypass = config.mode === 'sequential' &&
      body.bypassSequentialOrder &&
      hasRole(claims, 'AcknowledgmentAdmin');

    const eventId = crypto.randomUUID();
    const promptMessage = resolvePromptMessage(config, body.partyUserId);

    await sp.createAcknowledgmentEvent({
      EventId: eventId,
      ContextType: body.contextType,
      ContextId: body.contextId,
      PartyUserId: body.partyUserId,
      PartyDisplayName: claims.displayName,
      Status: isBypass ? 'bypassed' : body.status,
      AcknowledgedAt: body.acknowledgedAt,
      DeclineReason: body.declineReason ?? '',
      DeclineCategory: body.declineCategory ?? '',
      PromptMessage: promptMessage,
      IsBypass: isBypass,
      BypassedBy: isBypass ? claims.upn : '',
    });

    // ── Fetch updated events and compute completion ───────────────────────
    const updatedEvents = await sp.getAcknowledgmentEvents(
      body.contextType,
      body.contextId
    );
    const updatedState = deriveAcknowledgmentState(config, updatedEvents);

    // ── Server-side completion side-effects (D-06) ────────────────────────
    if (updatedState.isComplete) {
      await triggerCompletionSideEffects(
        body.contextType,
        body.contextId,
        updatedState,
        ctx
      );
    }

    // ── Notify pending parties (acknowledgment request notification) ──────
    if (body.status === 'acknowledged' && !updatedState.isComplete) {
      await notifyNextPendingParty(config, updatedState, ctx);
    }

    return {
      status: 200,
      jsonBody: {
        event: { ...body, EventId: eventId, isBypass, bypassedBy: isBypass ? claims.upn : undefined },
        updatedState,
        isComplete: updatedState.isComplete,
      },
    };
  },
});

// ── Completion side-effects (D-06) ───────────────────────────────────────────
async function triggerCompletionSideEffects(
  contextType: string,
  contextId: string,
  state: IAcknowledgmentState,
  ctx: InvocationContext
): Promise<void> {
  try {
    // BIC transfer: acknowledgment completion moves BIC to next owner
    const bicClient = getBicClient();
    await bicClient.recordAcknowledgmentCompletion({ contextType, contextId });
  } catch (err) {
    ctx.error('BIC transfer on acknowledgment completion failed', err);
    // Non-fatal: audit trail is written; BIC sync will catch up
  }

  try {
    // Notification: Watch-tier notification to record owner
    const notifClient = getNotificationClient();
    await notifClient.registerEvent({
      tier: 'watch',
      type: 'acknowledgment-complete',
      contextType,
      contextId,
      trail: state.events,
    });
  } catch (err) {
    ctx.error('Notification dispatch on acknowledgment completion failed', err);
    // Non-fatal: acknowledgment is complete regardless
  }
}
```

---

## Azure Function: `GET /api/acknowledgments`

```
GET /api/acknowledgments?contextType={type}&contextId={id}
Authorization: Bearer {AAD token}
```

### Response

```typescript
// Returns IAcknowledgmentState
{
  config: IAcknowledgmentConfig<unknown>;
  events: IAcknowledgmentEvent[];
  isComplete: boolean;
  currentSequentialParty: IAcknowledgmentParty | null;
  overallStatus: AcknowledgmentStatus | 'partial';
}
```

### Handler summary

1. Validate `contextType` against `ACK_CONTEXT_TYPES`.
2. Fetch events from `HbcAcknowledgmentEvents` list filtered by `ContextType` + `ContextId`.
3. Resolve config for this context type.
4. Run `deriveAcknowledgmentState()` server-side.
5. Return `IAcknowledgmentState`.

---

## SharePoint List: `HbcAcknowledgmentEvents`

### Column Definitions

| Column Name | SP Type | Indexed | Notes |
|---|---|---|---|
| `EventId` | Single line (255) | ✓ | GUID primary key |
| `ContextType` | Choice | ✓ | Values from `ACK_CONTEXT_TYPES` |
| `ContextId` | Single line (255) | ✓ | Record ID — indexed for query performance |
| `PartyUserId` | Single line (255) | ✓ | UPN; indexed for per-user queries |
| `PartyDisplayName` | Single line (255) | ✗ | Display name at event time |
| `Status` | Choice | ✓ | `acknowledged`, `declined`, `bypassed` |
| `AcknowledgedAt` | Date/Time | ✓ | UTC; client timestamp for offline events |
| `DeclineReason` | Multiple lines | ✗ | Free-text reason |
| `DeclineCategory` | Single line (255) | ✗ | Category from `declineReasons[]` |
| `PromptMessage` | Multiple lines | ✗ | Prompt shown at acknowledgment time |
| `IsBypass` | Yes/No | ✓ | True when bypass flag used (D-01) |
| `BypassedBy` | Single line (255) | ✗ | UPN of authorising admin (D-01) |

### Choice Values

**`ContextType`:** project-hub-pmp, project-hub-turnover, project-hub-monthly-review, bd-scorecard, estimating-bid-receipt, admin-provisioning, workflow-handoff

**`Status`:** acknowledged, declined, bypassed

### Query Patterns

```typescript
// All events for a record (primary query)
`?$filter=ContextType eq '${contextType}' and ContextId eq '${contextId}'&$orderby=AcknowledgedAt asc`

// All pending acknowledgments for a user (My Work Feed integration)
`?$filter=PartyUserId eq '${userId}' and Status eq 'pending'`

// All bypass events (admin audit)
`?$filter=IsBypass eq true&$orderby=AcknowledgedAt desc`
```

---

## Setup Script: `scripts/setup-acknowledgment-list.ts`

```typescript
// scripts/setup-acknowledgment-list.ts
// Run once per environment: npx ts-node scripts/setup-acknowledgment-list.ts

import { getSPFxAdminClient } from './lib/spAdmin';

async function setupAcknowledgmentList() {
  const sp = getSPFxAdminClient();

  // Create list
  await sp.web.lists.ensure('HbcAcknowledgmentEvents', 'HB Intel Acknowledgment Events', 100);
  const list = sp.web.lists.getByTitle('HbcAcknowledgmentEvents');

  // Add columns
  await list.fields.addText('EventId', { MaxLength: 255 });
  await list.fields.addChoice('ContextType', {
    Choices: Object.values(ACK_CONTEXT_TYPES),
  });
  await list.fields.addText('ContextId', { MaxLength: 255 });
  await list.fields.addText('PartyUserId', { MaxLength: 255 });
  await list.fields.addText('PartyDisplayName', { MaxLength: 255 });
  await list.fields.addChoice('Status', {
    Choices: ['acknowledged', 'declined', 'bypassed'],
  });
  await list.fields.addDateTime('AcknowledgedAt');
  await list.fields.addMultilineText('DeclineReason', { NumberOfLines: 6 });
  await list.fields.addText('DeclineCategory', { MaxLength: 255 });
  await list.fields.addMultilineText('PromptMessage', { NumberOfLines: 10 });
  await list.fields.addBoolean('IsBypass');
  await list.fields.addText('BypassedBy', { MaxLength: 255 });

  // Create indexes for query performance
  await list.fields.getByInternalNameOrTitle('EventId').update({ Indexed: true });
  await list.fields.getByInternalNameOrTitle('ContextType').update({ Indexed: true });
  await list.fields.getByInternalNameOrTitle('ContextId').update({ Indexed: true });
  await list.fields.getByInternalNameOrTitle('PartyUserId').update({ Indexed: true });
  await list.fields.getByInternalNameOrTitle('Status').update({ Indexed: true });
  await list.fields.getByInternalNameOrTitle('AcknowledgedAt').update({ Indexed: true });
  await list.fields.getByInternalNameOrTitle('IsBypass').update({ Indexed: true });

  console.log('HbcAcknowledgmentEvents list created and indexed successfully.');
}

setupAcknowledgmentList().catch(console.error);
```

---

## Verification Commands

```bash
# Run setup script (DEV environment)
npx ts-node scripts/setup-acknowledgment-list.ts

# Verify list exists in SharePoint (via CLI)
m365 spo list get --title "HbcAcknowledgmentEvents" --webUrl $SP_SITE_URL

# Deploy Azure Function
func azure functionapp publish $FUNCTION_APP_NAME

# Smoke test: POST a test acknowledgment
curl -X POST https://$FUNCTION_APP_NAME.azurewebsites.net/api/acknowledgments \
  -H "Authorization: Bearer $AAD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contextType": "admin-provisioning",
    "contextId": "test-001",
    "partyUserId": "test@hbc.com",
    "status": "acknowledged",
    "acknowledgedAt": "2026-03-08T10:00:00Z"
  }'
# Expected: 200 with updatedState and isComplete

# Smoke test: Verify sequential enforcement (D-01)
# Submit as party 2 without bypass — expect 403
curl -X POST https://$FUNCTION_APP_NAME.azurewebsites.net/api/acknowledgments \
  -H "Authorization: Bearer $PARTY2_TOKEN" \
  -d '{ "contextType": "project-hub-turnover", "contextId": "test-002",
        "partyUserId": "party2@hbc.com", "status": "acknowledged",
        "acknowledgedAt": "2026-03-08T10:01:00Z" }'
# Expected: 403 Sequential order violation
```

<!-- IMPLEMENTATION PROGRESS & NOTES
SF04-T06 completed: 2026-03-09

Files created:
- packages/acknowledgment/src/server.ts — React-free barrel (types + config + utils only)
- backend/functions/src/services/acknowledgment-service.ts — IAcknowledgmentService + Real (SharePoint) + Mock (in-memory)
- backend/functions/src/functions/acknowledgments/stubs.ts — triggerBicCompletion, triggerCompletionNotification, notifyNextPendingParty
- backend/functions/src/functions/acknowledgments/index.ts — POST + GET /api/acknowledgments handlers
- scripts/create-acknowledgment-list.ts — idempotent HbcAcknowledgmentEvents SharePoint list setup (12 columns, 7 context types)

Files modified:
- packages/acknowledgment/package.json — added ./server export entry (dist/src/server.js)
- backend/functions/package.json — added @hbc/acknowledgment workspace dependency
- backend/functions/src/middleware/validateToken.ts — added optional displayName to IValidatedClaims, populated from JWT name claim
- backend/functions/src/services/service-factory.ts — registered acknowledgments service (Real + Mock)
- backend/functions/src/index.ts — imported acknowledgments function registration

Spec adaptations applied:
- Used validateToken() + unauthorizedResponse() (not getAADClaims)
- claims.roles.includes('AcknowledgmentAdmin') for bypass validation
- Client sends parties[] + mode with POST body (no server-side config registry)
- deriveAcknowledgmentState() called with 3 args (config, parties, events)
- BIC/notification as stub functions with logger output
- ./server sub-entry-point uses .js extensions for Node16 compatibility

Verification:
- pnpm --filter @hbc/acknowledgment build ✓
- pnpm --filter @hbc/functions build ✓
- pnpm --filter @hbc/acknowledgment check-types ✓
- pnpm --filter @hbc/functions check-types ✓
- pnpm --filter @hbc/acknowledgment test ✓ (36 tests passing)
-->
