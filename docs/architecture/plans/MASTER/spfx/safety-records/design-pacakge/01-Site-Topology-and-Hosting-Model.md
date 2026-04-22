# 01 — Site Topology and Hosting Model

## Objective

Define the exact site-topology and ownership model for the Safety Record Keeping solution.

## Final topology

### 1. Safety site (`/sites/Safety`)

This site is the **experience layer**.

It should host:

- the SPFx Safety Record Keeping application
- application page(s)
- upload library for completed field checklists
- optional review / exception pages
- coordinator / manager user entrypoints

### 2. HBCentral (`/sites/HBCentral`)

This site is the **authoritative data layer**.

It already hosts:

- `Projects`
- `Legacy Project Fallback Registry`

It should also host the new structured safety lists for this solution so they sit beside the canonical project registries and can use same-site relationships / lookup fields where appropriate.

## Why this split is preferred

### Benefits

- keeps the user experience isolated to the Safety-branded site
- keeps the structured data centralized with the enterprise registries
- reduces cross-site reference complexity
- makes same-site relationships with `Projects` more viable
- makes the structured safety data reusable for future HBCentral-based experiences

### Costs

- the application/service must write across site boundaries from `/sites/Safety` UX into `/sites/HBCentral` data
- permissions must be planned explicitly
- the Safety site is not the primary system-of-record site for the structured lists

## Proposed ownership matrix

| Asset / Responsibility | Host Site | Notes |
|---|---|---|
| Application pages / UX | /sites/Safety | SPFx / site pages / app surface |
| Upload landing library | /sites/Safety | Coordinator submits offline checklist workbook |
| Temporary intake review artifacts | /sites/Safety | Optional; can also be omitted if audit list is enough |
| Projects | /sites/HBCentral | Existing canonical project registry |
| Legacy Project Fallback Registry | /sites/HBCentral | Existing fallback registry |
| New structured safety lists | /sites/HBCentral | Authoritative transaction + history store |
| Safety Field Excellence publish snapshots | /sites/HBCentral | Recommended so publishing model lives with source records |

## Recommended cross-site interaction pattern

1. user uploads workbook at `/sites/Safety`
2. app or service stores the original file in the Safety-site upload library
3. ingestion service validates and parses the workbook
4. ingestion service resolves project identity using HBCentral lists
5. ingestion service writes authoritative records to HBCentral safety lists
6. app reads queue / status / results back for user display

## HBCentral list co-location rationale

Because `Projects` and `Legacy Project Fallback Registry` already live on HBCentral, the safest enterprise shape is to place the new structured safety lists there as well. That lets the model use:

- HBCentral item IDs
- project snapshots
- same-site lookup relationships where useful
- consistent query semantics
- simpler future integration with other HBCentral-hosted systems

## Naming convention recommendation

### Safety site assets

- Library: `Safety Checklist Uploads`
- Page: `Safety Record Keeping`
- Optional library: `Safety Intake Review Artifacts`

### HBCentral authoritative lists

- `Safety Reporting Periods`
- `Safety Project Week Records`
- `Safety Inspection Events`
- `Safety Findings`
- `Safety Corrective Actions`
- `Safety Ingestion Runs`
- `Safety Publish Snapshots` (recommended)

## Permission model outline

### Coordinators

- contribute to upload library on Safety site
- view their own or allowed submissions
- no need for broad direct list editing on HBCentral if ingestion is service-mediated

### Safety manager / safety admins

- full review access in the app
- visibility into HBCentral safety records
- override / correction capability where business-approved

### Service account / app principal

- read access to:
  - `Projects`
  - `Legacy Project Fallback Registry`
- write access to:
  - HBCentral safety lists
- read/write access to:
  - Safety upload library and intake audit surfaces

## Structural decision

The app is hosted on Safety. The authoritative structured lists live on HBCentral. This is the governing topology for the remainder of the design.
