# Prompt 02 — Project Spotlight SharePoint List Data Source Wiring

## Objective

Replace the current hardcoded manifest-driven operating model with a SharePoint list-backed content path using the provided `Homepage Project Spotlights` list, while preserving a narrow, controlled fallback only if repo truth requires one for local/demo/package safety.

---

## SharePoint source

Use this list as the intended authoring source:

- `https://hedrickbrotherscom.sharepoint.com/:l:/s/HBCentral/JADvLnv0cpkIT4efISyXzsq2Aa__8DCtUecvBuuaPMd2fAY?e=P0wGez`

### Required fields to map

- `Title`
- `ProjectId`
- `ProjectUrl`
- `HomepageEnabled`
- `IsFeatured`
- `DisplayOrder`
- `Headline`
- `Summary`
- `LocationText`
- `Sector`
- `PrimaryImage`
- `PrimaryImageAltText`
- `StatusLabel`
- `StatusVariant`
- `StrategicEmphasis`
- `FreshnessDate`
- `FreshnessSource`
- `MilestonesCompleted`
- `MilestonesTotal`
- `MilestoneSummary`
- `CtaLabel`
- `CtaUrl`
- `ProjectTeamMembers`
- `Audience`
- `StaleAfterDays`
- `PublishStart`
- `PublishEnd`

---

## Required implementation goals

1. Introduce a typed list-item mapping path from SharePoint rows into the existing Project Spotlight normalized shape.
2. Preserve current ranking intent:
   - featured first
   - then display order
   - then freshness
   - then other tie-breaks only if needed
3. Respect publish window, homepage enablement, and audience filtering.
4. Preserve the current editorial architecture rather than turning the surface into a raw SharePoint dump.
5. Keep the implementation narrow to Project Spotlight and its directly supporting homepage seams.

---

## Required work

### A. Data contracts
- add or refine the typed contract for raw SharePoint list items
- add mapping types for normalized spotlight data
- keep the contract naming clear and local unless a broader homepage contract already exists

### B. Data retrieval seam
- identify the correct SPFx-safe data retrieval path already used or expected in the repo
- wire the Project Spotlight webpart to retrieve list items from the SharePoint list
- do not invent a forbidden access pattern if doctrine or repo truth already defines one

### C. Normalization
Map the raw fields into the Project Spotlight shape.

Required mapping intent:
- `Title` → title
- `Headline` → highlight headline
- `Summary` → summary
- `LocationText` → location
- `Sector` → sector
- `PrimaryImage` + `PrimaryImageAltText` → image object
- `StatusLabel` + `StatusVariant` → status
- `FreshnessDate` + `FreshnessSource` → freshness
- `MilestonesCompleted` + `MilestonesTotal` + `MilestoneSummary` → milestone presentation model
- `CtaLabel` + `CtaUrl` or `ProjectUrl` → CTA
- `ProjectTeamMembers` → team member collection
- `HomepageEnabled`, `PublishStart`, `PublishEnd`, `Audience`, `StaleAfterDays` → visibility/governance logic

### D. Fallback policy
If repo truth requires a fallback path for local packaging/demo safety:
- keep it narrow
- keep it explicit
- do not let it remain the primary operating model

---

## Deliverables

### 1. Files changed
List all files changed and why.

### 2. Data-flow summary
Explain the runtime data path from SharePoint list item to rendered spotlight item.

### 3. Mapping table
Show the exact field-to-prop mapping.

### 4. Validation
At minimum validate:
- typecheck/build for affected package
- mapping logic correctness
- graceful no-data / invalid-data handling
- that the list-backed source is the intended primary source

---

## Hard constraints

- Do not redesign the UI in this prompt beyond what is necessary to support the new data path.
- Do not widen into unrelated homepage webparts.
- Do not break the existing webpart package.
- Do not re-read files still in current context unless needed.
