# P1-F1-T02: Source of Truth, Custody, and Current Data-Layer Alignment

## 1. Current Repo-Truth Baseline

The current implemented data plane is already hybrid, but not in the way the original Phase 1 A-series documents described it.

### Present custody reality

- Azure Table-backed backend services currently own much of the active domain data path.
- SharePoint remains real for project setup request persistence and provisioning/site/list/document operations.
- Query-hooks and data-access already form the intended downstream consumption boundary.
- PWA My Work source assembly still contains mock domain query seams that must be retired in future implementation.

## 2. Current Data-Layer Misalignment That Future Implementation Must Address

The future implementation program must explicitly address the following current seam gaps:

1. **Durable project registry path**
   - Current state: `createProjectRegistryService()` resolves to an in-memory mock-only service.
   - Required change: replace the in-memory posture with a durable governed identity and mapping service.

2. **Proxy-context startup wiring**
   - Current state: proxy mode is configured in PWA build-time settings, but startup wiring for proxy context is absent from app startup paths.
   - Required change: initialize proxy context explicitly if proxy-backed repositories remain part of the governed runtime path.

3. **Proxy/backend route reconciliation**
   - Current state: several proxy repositories and backend routes do not agree on path shapes.
   - Required change: reconcile route contracts before connector-backed consumption is widened.

4. **Removal of permanent mock domain query dependence**
   - Current state: `apps/pwa/src/sources/domainQueryFns.ts` remains a mock seam.
   - Required change: replace these mock providers with published read-model providers or governed repositories, not direct connector calls.

## 3. Existing Seams the Integration Program Must Reuse

Future implementation must build on, not bypass, the following seams:

| Seam | Required use |
|---|---|
| Backend table-client seam | Governing access path for Azure-backed custody layers |
| Backend domain services | Existing domain service layer to extend or refactor rather than replace ad hoc |
| `@hbc/data-access` | Governing repository and adapter boundary for downstream access |
| `@hbc/query-hooks` | Governing consumer query boundary |
| PWA source assembly | Controlled source-registration seam for My Work and related composition |
| Provisioning handoff config | Existing cross-surface handoff seam |
| Project Hub reconciliation and publication seams | Existing precedent for thin canonical, source-aligned normalization, and publication |

## 4. Current Planning Assumption Change

The original Phase 1 assumption that SharePoint is the active business-domain SoR across core domains is no longer acceptable as umbrella-family planning language.

P1-F1 therefore adopts this replacement framing:

- current repo truth is materially Azure-backed for much of the domain data layer,
- SharePoint remains a real transitional operational and publication surface,
- target custody planning must start from current implemented reality rather than reopening the original SharePoint-native baseline.

## 5. Required Phase 1 Follow-On Reconciliation

The following planning assumptions must be revised later to align to this custody reality:

- SharePoint-native business-domain SoR language in the original A-series docs,
- broad "code complete" claims for the integration surface,
- assumptions that the proxy/backend transport layer is fully reconciled,
- assumptions that the auth route family coverage is fully implemented.
