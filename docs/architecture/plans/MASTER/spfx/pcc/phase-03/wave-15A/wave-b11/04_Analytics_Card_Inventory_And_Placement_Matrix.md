# Analytics Card Inventory and Placement Matrix

## Principle

Analytics cards must be placed near related operational content where feasible. They should create greater visual depth, but must remain useful, source-aware, and product-grade.

## Required MVP Analytics Cards

### Project Home

| Analytics Card | Related Cards | Chart | Placement |
|---|---|---|---|
| Action Exposure Mix | Priority Actions | donut or stacked horizontal bar | immediately after/near Priority Actions cluster |
| Readiness / Approval Rollup | Project Readiness, Approvals & Checkpoints, Missing Configurations | grouped bar or progress bars | near readiness/approvals row |
| Project Health Trend | Site Health Summary | line/area/sparkline | near Site Health or after first operational row |

### Documents

| Analytics Card | Related Cards | Chart | Placement |
|---|---|---|---|
| Document Source Health Matrix | document source cards | stacked bar or matrix-style grid | beside/after source cards |
| Document Readiness by Lane | SharePoint / OneDrive / external lane content | grouped bar | near lane cards |
| Expiring / Stale / Missing Documents Preview | document reference/status content | bar or line | after source posture |

### Core Tools

| Analytics Card | Related Cards | Chart | Placement |
|---|---|---|---|
| Module Availability Mix | module overview/status | donut or bar | near module overview |
| Access & Responsibility Coverage | Team & Access / Directory | stacked bar | near access/team cards |

### Estimating & Preconstruction

| Analytics Card | Related Cards | Chart | Placement |
|---|---|---|---|
| Handoff Continuity Preview | Preconstruction Handoff | progress / stacked bar | near handoff card |
| Estimate Exposure Preview | Assumptions / Alternates / Exclusions | grouped bar or waterfall-style bar | near estimate context cards |

### Startup & Closeout

| Analytics Card | Related Cards | Chart | Placement |
|---|---|---|---|
| Startup Readiness Completion | Startup Center | progress / grouped bar | near Startup Center |
| Closeout & Warranty Readiness | Closeout / Warranty | stacked bar | near closeout cards |
| Responsibility Coverage | Responsibility Matrix | matrix / progress bars | near Responsibility Matrix |

### Project Controls

| Analytics Card | Related Cards | Chart | Placement |
|---|---|---|---|
| Constraints Aging | Constraints Log | histogram / stacked bar | near Constraints Log |
| Permit / Inspection Readiness | Permits & Inspections | grouped bar | near permits/inspections |
| Risk / Issue Severity Distribution | Risk / Issues / Decisions | donut or stacked bar | near risk/issues cards |

### Cost & Time

| Analytics Card | Related Cards | Chart | Placement |
|---|---|---|---|
| Schedule Milestone Posture | Schedule Monitor | line / milestone bar | near schedule card |
| Procurement / Buyout Exposure | Procurement & Buyout | bar / waterfall-style bar | near procurement/buyout |
| Commitment / Cost Exposure Preview | Commitment / Cost Exposure | bar | near cost exposure card |

### Systems Administration

| Analytics Card | Related Cards | Chart | Placement |
|---|---|---|---|
| Integration Health Summary | Integration Settings / External Systems | donut or stacked bar | near integration settings |
| Configuration Severity | Module Configuration / Control Center Settings | stacked bar | near configuration cards |
| Procore Mapping / Sync Posture | Procore Mapping / Sync Health | gauge-like status bar or grouped bar | near Procore mapping card |

## Placement Rules

1. Place analytics next to the operational content it explains.
2. Use analytics to add visual depth, not to bury operational cards.
3. If a dashboard has limited meaningful operational data, render preview analytics with deterministic sample data and clear explanation.
4. Do not render a chart if the card has no operational question.
5. Do not place all analytics at the bottom unless no related card placement exists.
6. Keep analytics cards direct children of `PccBentoGrid`.

## Suggested Span Defaults

| Analytics Card Type | 12-col span | 10-col span |
|---|---:|---:|
| compact supporting chart | 3 | 3 |
| standard operational chart | 4 | 3 |
| wide comparative chart | 5 | 4 |
| full trend/detail chart | 6 | 5 |

Use dashboard-specific overrides, not global footprint changes.
