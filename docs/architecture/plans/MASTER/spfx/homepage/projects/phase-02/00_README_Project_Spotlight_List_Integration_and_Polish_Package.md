# Project Spotlight — SharePoint List Integration and Visual Polish Prompt Package

## Objective

Implement the next phase of the **Project Spotlight** homepage webpart in the live `hb-intel` repo by combining two workstreams into one disciplined package:

1. **Replace the hardcoded manifest-driven content model with live SharePoint list sourcing** from the provided `Homepage Project Spotlights` list.
2. **Implement the previously identified high-impact visual polish work** so the webpart moves from structurally correct to signature-grade.

This package is intentionally narrow to the Project Spotlight webpart and its directly supporting homepage seams.

This is **not** a general homepage redesign.
This is **not** a shell-extension task.
This is **not** permission to refactor unrelated homepage webparts.

---

## Primary repo

- `https://github.com/RMF112018/hb-intel`

Treat **repo truth** as authoritative.

---

## Required governance hard gate

All UI development and visual decisions in this package must be governed by the repo’s SPFx homepage UI doctrine and related UI-kit governance documents.

At minimum, the agent must inspect and follow:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/entry-points.md`
- `docs/architecture/blueprint/current-state-map.md` (homepage product and ownership seams)

If repo truth shows other more specific homepage doctrine files now govern this surface, those files must also be used.

Doctrine compliance is a **hard gate**, not a soft suggestion.

---

## SharePoint source to use

Provided SharePoint list URL:

- `https://hedrickbrotherscom.sharepoint.com/:l:/s/HBCentral/JADvLnv0cpkIT4efISyXzsq2Aa__8DCtUecvBuuaPMd2fAY?e=P0wGez`

Treat this as the intended content source for Project Spotlight authoring.

### SharePoint list name

- `Homepage Project Spotlights`

### Required list fields to map

Use the provided list schema exactly as the Version 1 content model.

| Field | Type intent |
|---|---|
| `Title` | project title |
| `ProjectId` | text |
| `ProjectUrl` | hyperlink |
| `HomepageEnabled` | boolean |
| `IsFeatured` | boolean |
| `DisplayOrder` | number |
| `Headline` | note |
| `Summary` | note |
| `LocationText` | text |
| `Sector` | choice |
| `PrimaryImage` | image / url-like source |
| `PrimaryImageAltText` | text |
| `StatusLabel` | choice/text |
| `StatusVariant` | choice/text |
| `StrategicEmphasis` | boolean |
| `FreshnessDate` | datetime |
| `FreshnessSource` | choice/text |
| `MilestonesCompleted` | number |
| `MilestonesTotal` | number |
| `MilestoneSummary` | note |
| `CtaLabel` | text |
| `CtaUrl` | hyperlink |
| `ProjectTeamMembers` | person/group multi-select |
| `Audience` | choice/text |
| `StaleAfterDays` | number |
| `PublishStart` | datetime |
| `PublishEnd` | datetime |

Do not invent a different schema if these fields are sufficient.

---

## Previously identified enhancement priorities to implement

The prompt set below operationalizes the earlier audit findings. The highest-value improvements are:

1. **Media reliability**
   - add safe image handling
   - prevent broken-image presentation
   - add controlled fallback visuals
   - support focal/crop behavior where feasible

2. **Featured hierarchy and flagship expression**
   - move toward a true **70 / 30** editorial split
   - increase featured-image dominance
   - strengthen title/headline/summary hierarchy
   - make the featured surface feel like a homepage story module, not a card

3. **Supporting rail refinement**
   - make it feel like gallery navigation rather than a stacked list
   - strengthen thumbnail presence and interaction quality

4. **Team strip refinement**
   - retain the avatar-strip + flyout model
   - improve copy, warmth, polish, and fallback handling

5. **Header and CTA correction**
   - decouple `View all projects` from the featured item CTA
   - add explicit config / routing for the section-level action

6. **Live list-driven authoring**
   - replace hardcoded manifest content as the operating model
   - preserve manifest/demo fallback only if repo truth supports keeping a non-production seed path

---

## Package structure

1. `01_Project_Spotlight_Repo_Truth_Audit_and_Doctrine_Gate.md`
2. `02_Project_Spotlight_SharePoint_List_Data_Source_Wiring.md`
3. `03_Project_Spotlight_Media_Reliability_and_Image_Fallback_System.md`
4. `04_Project_Spotlight_Featured_Hero_Hierarchy_and_Typography_Polish.md`
5. `05_Project_Spotlight_Supporting_Rail_and_Team_Strip_Refinement.md`
6. `06_Project_Spotlight_Header_CTA_Authoring_and_Property_Pane_Refinement.md`
7. `07_Project_Spotlight_Responsive_Accessibility_and_Performance_Hardening.md`
8. `08_Project_Spotlight_Final_Validation_Documentation_and_Package_Closure.md`
9. `09_Project_Spotlight_List_Integration_and_Polish_Summary.md`

---

## Execution order

Run the prompts in order.

Do not skip ahead to styling before the data-source and doctrine audit are complete.
Do not widen scope into unrelated homepage components.
Do not re-read files that are still in current context unless they changed, the context is stale, or scope expanded.

---

## Success condition

Success is not merely that the webpart still renders.

Success is:

- the webpart is governed by the SPFx homepage UI doctrine,
- the live SharePoint list becomes the intended content source,
- the manifest hardcoded items are no longer the primary operating model,
- the featured area reads as a true flagship homepage story surface,
- the rail and team strip feel premium and intentional,
- broken media states are designed instead of visibly broken,
- and the changes are validated without regressing the existing homepage package.
