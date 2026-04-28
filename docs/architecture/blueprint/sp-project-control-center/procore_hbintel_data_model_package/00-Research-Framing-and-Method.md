# Procore REST API Research Framing and Method

## Objective
Define a practical, analytics-oriented target data model for integrating Procore into SharePoint / HB Intel for a general contractor. The model is designed to support:
- company-level rollups
- portfolio and region benchmarking
- project operational drilldown
- cost/change/risk analytics
- field/document/quality/safety correlations
- executive and project-team dashboards

## Research posture
This package is based primarily on current official Procore developer materials and official Procore support/developer guides, with emphasis on:
- developers.procore.com REST API reference pages
- developers.procore.com documentation pages
- procore.github.io documentation pages that mirror the official Procore Developers documentation repository
- official support guidance only when useful to explain migration or platform behavior

## What was researched
The review covered the current API surface broadly enough to identify analytically relevant domains across:
- general/company-level resources
- company-level master/reference data
- project-level core administration
- financials/cost/change/payment resources
- project-management/workflow resources
- design/documentation resources
- quality/safety/compliance resources
- field execution and labor/equipment/productivity resources
- lifecycle/platform constraints that materially affect integration design

## Modeling principles used
1. Do not replicate everything 1:1 into SharePoint.
2. Preserve Procore source identifiers on every canonical entity.
3. Prefer conformed dimensions for company, project, user, vendor, WBS, location, and time.
4. Treat large operational streams as facts/events, not as list-shaped master records.
5. Use snapshots deliberately where Procore already exposes them or where periodic extraction materially improves analytics.
6. Separate source-native objects from HB Intel canonical entities.
7. Preserve cross-tool join paths even when Procore tool boundaries are separate in the API.
8. Promote only high-value entities into the first-wave canonical model.

## Practical interpretation standard
Each tool family was assessed for:
- business purpose
- scope level
- grain
- important joins
- historical utility
- analytical value to a GC
- operational-only value
- canonical inclusion recommendation

## Output logic
This package is layered:
1. Company-level canonical model
2. Portfolio / cross-project analytical model
3. Project-level operational model
4. Transaction / event model
5. Recommended enterprise canonical model for SharePoint / HB Intel

## Caveats
- Procore’s official reference surface is broad and continues to evolve.
- Some tool families show mixed maturity (for example, coexistence of legacy and newer workflow/versioning patterns).
- Some endpoint families are more useful as operational sources than as long-lived analytical tables.
- The recommendation intentionally filters the surface for GC analytical usefulness rather than mirroring the entire product catalog.