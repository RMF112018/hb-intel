# 10 — Gaps, Risks, and Open Questions

## Gaps

| Gap | Type | Why it matters | Recommended action |
|---|---|---|---|
| No focused four-app source-of-truth contract | Documentation gap | current truth is scattered across app code, current-state, data-model docs, and manifests | add subset contract/index doc |
| Project Sites manifest description is stale/conflicting | Documentation drift | misstates runtime filtering behavior | update manifest description and related docs |
| Admin packaging/auth posture is not explicit enough | Config/auth gap | page code uses provisioning API client without a matching manifest declaration | document and validate the intended auth path |
| `Projects` list projection write-ownership is not explicit | Ownership gap | Project Sites depends on data whose upstream writer is not clearly published in subset docs | add field ownership table |
| No focused translation-boundary doc for admin run model vs provisioning status | Contract gap | same lifecycle semantics appear in two model families | publish translation/projection rule |
| Project Sites depends on imported `field_N` names | Schema fragility | list-schema changes could break runtime | document current schema + plan migration path |

## Risks

| Risk | Likelihood | Impact | Notes |
|---|---|---:|---|
| Hidden admin auth mismatch in production packaging | Medium | High | manifest/page/backend posture not yet fully normalized |
| `Projects` list schema drift breaks Project Sites | Medium | Medium-high | mitigated by display-name fallbacks, but still fragile |
| Data freshness assumptions between request/provisioning and Projects list become implicit | Medium | High | especially around `siteUrl` and `year` |
| Admin and provisioning run vocabularies drift over time | Medium | Medium-high | same failure classes already mirrored |
| Identifier confusion (`projectId` vs `projectNumber` vs `pid`) causes downstream mistakes | High | Medium | especially in docs, support, and future app work |

## Open questions

1. **What is the exact authoritative write path into the HBCentral `Projects` list for the fields consumed by Project Sites?**
2. **Is Admin intentionally using a non-manifested auth path for provisioning API access, or is the SPFx package contract incomplete?**
3. **What is the approved long-term relationship between provisioning runs and admin generalized runs: coexistence, projection, or eventual convergence?**
4. **Are there any additional Admin lanes already live in code that materially depend on the Admin Control Plane host beyond the fetched provisioning-oversight page?**

## Immediate follow-on actions

1. Validate Admin runtime auth against the packaged SPFx deployment model.
2. Add one focused subset source-of-truth document for identifiers and `Projects` list projection ownership.
3. Correct stale Project Sites package/document language.
4. Publish a short admin/provisioning run-boundary note before more admin features are added.
