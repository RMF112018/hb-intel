# P1-F1-T12: Implementation, Acceptance, and Readiness Gates

## 1. Implementation Sequencing

The implementation sequence for the P1-F1 family is:

1. Accept the umbrella operating model and custody alignment in T01 through T04.
2. Accept the security, orchestration, and operator model in T05 through T07.
3. Accept the downstream publication boundary and Phase 3 reconciliation in T08.
4. Accept the Wave 1, Wave 2, and Wave 3 structuring in T09 through T11.
5. Treat the authored `P1-F2` through `P1-F19` families as the authorized child-family planning set under the accepted umbrella.

## 2. Required Current Implemented-Seam Changes

Future implementation must address the following concrete seam deltas:

- replace the current in-memory project registry posture with a durable governed identity/mapping service,
- wire proxy context in app startup paths where proxy-backed repositories remain the governed route,
- reconcile proxy repository route assumptions against actual backend routes,
- replace mock PWA domain query providers with published read-model providers,
- preserve the published read-model boundary so connector runtime logic stays out of feature packages.

## 3. Required Phase 1 Planning Assumption Changes

The following original Phase 1 assumptions require later reconciliation:

- SharePoint-native business-domain SoR language in `P1-A1` and `P1-A2`
- broad code-complete claims for the integration surface in the top-level Phase 1 docs
- assumptions that the auth route catalog is fully implemented
- assumptions that the proxy/backend transport surface is already fully reconciled

## 4. Immediate Phase 1 Docs That Need Later Reconciliation

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/package-relationship-map.md`
- `docs/architecture/plans/MASTER/02_Phase-1_Production-Data-Plane-and-Integration-Backbone-Plan.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/README.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A1-Data-Ownership-Matrix.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-A2-Source-of-Record-Register.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-B1-Proxy-Adapter-Implementation-Plan.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C1-Backend-Service-Contract-Catalog.md`
- `docs/architecture/plans/MASTER/phase-1-deliverables/P1-C2-a-Auth-Model-Extension-Proxy-Adapter-and-Route-Catalog.md`

## 5. Acceptance Criteria

P1-F1 is accepted when:

- all 12 `T` files are linked from the master index and from the Phase 1 deliverables README,
- Wave 1, Wave 2, and Wave 3 are all explicitly named,
- the family never claims the Azure-first target is already implemented,
- no connector endpoint structures are invented beyond official-source-supported capability statements,
- current seam changes are explicitly called for,
- downstream publication and consumer boundaries are explicit,
- required Phase 1 and Phase 3 follow-on reconciliation targets are named.

## 6. Readiness Gate for Implementation Use

The child families are now authored. Implementation work should not begin from those families until:

- the official-source gaps called out in each connector family are either resolved or explicitly accepted as staged unknowns,
- the current seam changes in Section 2 are assigned and scheduled,
- downstream publication-boundary consumers are aligned to the family outputs.

That gate exists to prevent:

- connector-family drift,
- reintroduction of stale custody assumptions,
- bypassing the published read-model boundary,
- runtime work that pretends unresolved vendor contracts are already known.
