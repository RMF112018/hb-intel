# Source Register

## Purpose

This register records the primary repo-truth seams and Microsoft authoritative platform references that govern the implementation package.

---

# 1. Repo-Truth Sources

## 1.1 Current My Projects read model

| File | Why it matters |
|---|---|
| `backend/functions/src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.ts` | Current full-list source loading, reconciliation, action builders, telemetry. |
| `backend/functions/src/hosts/my-work-read-model/my-work-read-model-routes.ts` | Current protected route: `GET /api/my-work/me/project-links`. |
| `backend/functions/src/hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver.ts` | Current provider composition and integration seam. |
| `apps/my-dashboard/src/api/myWorkBackendReadModelClient.ts` | Frontend backend read client and fallback shape. |
| `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx` | Existing My Projects UI card data-fetch behavior. |
| `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx` | Home-surface composition. |

## 1.2 Graph/Auth infrastructure currently in repo

| File | Why it matters |
|---|---|
| `backend/functions/src/services/legacy-fallback/graph-list-client.ts` | Graph-native list client; list/site resolution; read/write patterns. |
| `backend/functions/src/services/legacy-fallback/federated-graph-token-provider.ts` | Federated Graph token lane: UAMI assertion → HB SharePoint Creator app token. |
| `backend/functions/src/services/legacy-fallback/hosting-config.ts` | Existing managed app client ID, UAMI, Graph scope, env posture. |
| `backend/functions/src/services/managed-identity-token-service.ts` | Managed identity app-token pattern for Azure/SharePoint adjacent flows. |

## 1.3 Existing timer/manual admin patterns

| File | Why it matters |
|---|---|
| `backend/functions/src/functions/legacyFallbackDiscovery/index.ts` | Existing timer + admin POST run pattern; useful for projection timers and manual rebuild endpoints. |

## 1.4 Existing source-list schema references

| File | Why it matters |
|---|---|
| `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md` | Projects schema, role fields, external launch fields, current indexes. |
| `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md` | Registry schema, matching fields, indexed fields, source semantics. |
| `scripts/verify-my-project-role-fields.ts` | Existing read-only schema verification style. |
| `scripts/provision-my-projects-source-list-schema.ts` | Existing operator-gated provisioning style. |

---

# 2. Microsoft Primary Sources

## 2.1 Graph change notifications and subscriptions

- Create subscription:  
  `https://learn.microsoft.com/en-us/graph/api/subscription-post-subscriptions?view=graph-rest-1.0`

- Change notifications overview / supported resources / subscription lifetimes / latency:  
  `https://learn.microsoft.com/en-us/graph/change-notifications-overview`

- Subscription resource type:  
  `https://learn.microsoft.com/en-us/graph/api/resources/subscription?view=graph-rest-1.0`

- Receive Graph notifications through webhooks:  
  `https://learn.microsoft.com/en-us/graph/change-notifications-delivery-webhooks`

## 2.2 Graph list item delta

- listItem delta:  
  `https://learn.microsoft.com/en-us/graph/api/listitem-delta?view=graph-rest-1.0`

## 2.3 Azure Functions + Service Bus

- Azure Functions Service Bus trigger:  
  `https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-service-bus-trigger`

- Service Bus queues/topics/subscriptions:  
  `https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions`

- Service Bus duplicate detection:  
  `https://learn.microsoft.com/en-us/azure/service-bus-messaging/duplicate-detection`

- Service Bus dead-letter queues:  
  `https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-dead-letter-queues`

- Managed identities for Service Bus:  
  `https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-managed-service-identity`

## 2.4 Azure Table Storage

- Table storage design:  
  `https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-design`

- Authorize Azure Table access using Microsoft Entra ID:  
  `https://learn.microsoft.com/en-us/azure/storage/tables/authorize-access-azure-active-directory`

- Azure built-in storage roles:  
  `https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/storage`

## 2.5 Azure Functions storage considerations

- Storage considerations for Azure Functions:  
  `https://learn.microsoft.com/en-us/azure/azure-functions/storage-considerations`

---

# 3. Interpretation Notes

1. Microsoft Graph list subscriptions require the list resource path:
   ```text
   /sites/{site-id}/lists/{list-id}
   ```

2. The package uses Graph subscriptions only as a **change wake-up mechanism**. Item-level truth comes from `listItem/delta`.

3. `Sites.Read.All` Application permission is the documented subscription permission for list resources and is the final live validation gate.

4. Graph delta supports delete tombstones and `410 Gone` token-resync scenarios.

5. Microsoft Graph webhook delivery guidance supports:
   - fast `202 Accepted` after queue persistence,
   - `5xx` when the notification cannot be durably queued,
   - validation-token responses in plain text.

6. Service Bus Standard is selected because duplicate detection is not supported in Basic.

7. Azure Table Storage is selected because the state is small, durable, key-oriented, and naturally supports optimistic-concurrency patterns through ETags.
