# Article Publisher Wiring Audit Package

## Objective
Validate whether the rebranded Article Publisher application on the live repo `main` branch is correctly wired to the actual HBCentral publisher list architecture and whether its workflow / publish logic is operationally sound.

## Source authority used
- Repo implementation authority: `RMF112018/hb-intel` main branch
- Tenant schema authority: uploaded `publisher-list-schema-report.md`
- Rebranding authority: uploaded `publisher-rebranding-report.md`
- Hosted surface under review: `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Article-Publisher.aspx`

## Package contents
- `00-Audit-Summary.md`
- `01-List-by-List-Wiring-Assessment.md`
- `02-Workflow-Logic-Assessment.md`
- `03-Findings-Register.md`
- `04-Recommended-Remediation-Sequence.md`



## Rebranding alignment note
This package has been updated to reflect the app rebrand from **Project Spotlight Publisher** to **Article Publisher**. Per the rebranding report, that refactor changed app identity, file/symbol names, and packaging copy only. It did **not** change destination behavior, workflow behavior, list schema, validation logic, or supported destinations. Accordingly, this audit now refers to the app as **Article Publisher**, while preserving destination-specific findings that still correctly reference **Project Spotlight** and the tenant’s `HB Article*` list family.

## Top conclusion
The current Article Publisher implementation is **not correctly wired** to the actual tenant list architecture. The shell bootstrapping and web part mount linkage are present, but the data model beneath the UI is built around a different “Project Spotlight Post” schema than the tenant’s actual `HB Article*` schema.

## Highest-risk themes
1. Wrong SharePoint list titles in the repository descriptors.
2. Wrong parent/child key model (`PostId` in code vs `ArticleId` in tenant lists).
3. Wrong field names and enum values across the master record, child records, template registry, workflow history, and publishing errors.
4. Promotion rules are not wired at all.
5. Publishing-error writes are not implemented.
6. “Publish” orchestration does not fully implement tenant-aligned history, error, archive/withdraw, or page-publish behavior.

## Recommended next step
Generate a tightly bounded remediation prompt package that closes the highest-priority category first:

**Category 1 — schema and repository realignment**
- Replace the current `Project Spotlight *` list-descriptor model with the actual `HB Article*` list model.
- Rebuild the typed contracts and row mappers against the tenant schema.
- Rewrite repository reads/writes before touching UI refinements.

After that, proceed in separate bounded waves for:
1. workflow/history/error alignment,
2. template-resolution and publish-pipeline alignment,
3. hosted verification and closure.
