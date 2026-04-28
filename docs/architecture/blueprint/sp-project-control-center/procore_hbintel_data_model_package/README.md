# Procore REST API -> SharePoint / HB Intel Data Model Package

This package contains a research-backed proposal for translating the current Procore REST API surface into a layered, analytics-oriented data model for SharePoint / HB Intel.

## Package contents
- `00-Research-Framing-and-Method.md` — research posture, source hierarchy, modeling principles
- `01-Procore-API-Surface-Inventory.md` — synthesized map of the Procore API surface
- `02-Tool-by-Tool-Endpoint-Catalog.csv` — domain-by-domain catalog with scope, grain, and inclusion recommendations
- `03-Canonical-Entity-Inventory.md` — canonical entity inventory by role and grain
- `04-Company-Level-Model.md` — company/master-data layer
- `05-Portfolio-Level-Model.md` — cross-project analytical layer
- `06-Project-Level-Model.md` — project drilldown model
- `07-Transactional-and-Event-Level-Model.md` — granular operational facts/events
- `08-Relational-Mapping-Concepts.md` — source-to-canonical mapping rules and bridge concepts
- `09-Endpoint-to-Entity-Crosswalk.csv` — endpoint family to canonical entity mapping
- `10-SharePoint-HB-Intel-Integration-Recommendations.md` — practical landing/storage guidance
- `11-Analytics-Use-Cases-and-Questions.md` — executive, PM/PX, cost, field, and quality use cases
- `12-Core-vs-Extended-Scope-Recommendation.md` — minimum, practical, and strategic scope variants
- `13-Assumptions-Gaps-and-API-Limitations.md` — API maturity, access, and modeling caveats
- `canonical_model.json` — machine-usable canonical model summary
- `endpoint_entity_crosswalk.json` — machine-usable version of the endpoint/entity mapping
- `entity_relationships.csv` — canonical relationship map
- `extraction_priority_matrix.csv` — recommended extraction order and cadence
- `star_schema_recommendation.md` — dashboard/reporting star-schema guidance
- `sharepoint_storage_pattern_recommendation.md` — what belongs in SharePoint vs external storage

## Recommended implementation posture
Do not mirror all Procore data directly into SharePoint lists. Use:
1. Raw extraction/archive store
2. Canonical relational layer
3. Curated HB Intel / SharePoint materializations
4. Selective document-library publishing only where collaboration benefits justify it

## Best initial target
Start with the **Recommended practical model** and prioritize:
- company / project / user / vendor / WBS masters
- budget views, snapshots, change events, budget changes
- commitments, invoices, direct costs, owner-side billing
- RFIs, submittals, correspondences
- observations, inspections, incidents, punch
- daily-log and labor/production detail that materially improves project-health analytics
