# 00 — Plan Summary

## Objective

Implement the **Project Spotlight publisher application** as a structured SPFx publishing workflow that creates and manages Project Spotlight posts using SharePoint list-backed editorial records and publishes each approved post as a **new page** on:

- `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`

using the Project Spotlight XML template saved at:

- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/`

as the **canonical v1 page-shell source**.

## Solution model

### Editorial truth
- authoritative post content lives in SharePoint lists
- the post master record drives publish behavior
- child records hold variable-cardinality team and media data
- template registry rows govern shell compatibility and validation
- page-binding rows govern durable page lineage

### Destination-page truth
- the destination page is a rendered shell and durable URL endpoint
- it is not the system of record for authoring truth
- page creation and republish logic must respect shell and template versions

### Current v1 shell model
The approved XML shell currently expresses these active blocks:
- OOB Page Title / banner
- OOB Text for subheading
- OOB Text for body
- `teamViewer`
- OOB Image Gallery

### Explicit non-goals for v1
- no Company Pulse support
- no dual-destination branching logic
- no manual-by-default SharePoint canvas composition
- no hidden secondary-image requirement in validation
- no silent page regeneration without binding/version tracking

## Implementation priorities

1. repo-truth discovery and scope lock
2. list architecture and typed domain contracts
3. service layer and template resolution
4. XML-shell-based page generation
5. content-to-shell mapping and durable page binding
6. authoring UI and workflow actions
7. validation and preview
8. Team Viewer integration closure
9. testing, hosted vetting, and final build proof

## Success standard

The implementation is only complete when:

- a structured Project Spotlight post can be authored without raw page editing
- the publish path creates a new page on the Project Spotlight site from the XML shell
- the page receives mapped banner, subhead, body, Team Viewer, and gallery content
- page-binding records prove durable linkage and version lineage
- preview and publish are driven by the same resolution pipeline
- hosted verification proves the implementation on the target SharePoint surfaces
