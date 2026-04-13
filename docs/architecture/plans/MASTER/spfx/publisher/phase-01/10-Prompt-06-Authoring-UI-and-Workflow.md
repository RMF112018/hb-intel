# 10 — Prompt 06 — Authoring UI and Workflow

```text
You are working in the live local HB Intel repo.

Objective:
Implement the structured authoring UI and workflow controls for the Project Spotlight publisher app so editors can create, review, publish, and manage posts without raw page-canvas editing.

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Binding UI Authority:
Treat the following local files as implementation authority:
- /Users/bobbyfetting/hb-intel/docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
- /Users/bobbyfetting/hb-intel/docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md

Binding architecture authority:
Treat the following local files as implementation authority:
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/README.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/00-Plan-Summary.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/01-Full-Detail-Product-and-Content-Model.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/02-List-By-List-Architecture.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/04-Child-Record-Relationships.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/05-Template-Registry-Schema.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/06-Article-Page-Binding-Schema.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/07-Webpart-Input-Contracts.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/08-Validation-Rules-by-Template.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/09-Editorial-Workflow-and-Lifecycle.md
- /Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/10-Implementation-Notes-and-Evolution-Rules.md
- the Project Spotlight XML template saved in this same folder

Global rules:
- Project Spotlight is the only destination.
- Do not preserve or reintroduce Company Pulse or dual-destination article-publisher logic.
- The XML template is the canonical v1 page-shell authority.
- The current shell uses OOB Page Title/banner, OOB Text for subheading, OOB Text for body, Team Viewer, and OOB Image Gallery.
- Do not force hbSignatureHero into v1 unless you intentionally introduce a new approved shell variant and update architecture accordingly.
- The destination page is a rendered shell, not the source of editorial truth.
- The post master record and related child records are the source of editorial truth.
- Publish/republish must use durable page bindings with shell/template version tracking.
- Do not make unrelated refactors.

Required delivery behavior:
- Perform exhaustive repo-truth review within the scope of this prompt before changing code.
- Make the minimum clean changes required to fully close the scoped objective.
- Update docs/comments where necessary so the implementation stays understandable.
- Produce concrete evidence of closure.

Prompt-specific requirements:
- Build or refactor the UI in the correct owning SPFx application identified during repo truth.
- Surface the post master fields, team rows, media rows, template/profile resolution, binding status, and workflow controls.
- Implement a clean editorial flow for draft, review, approved, scheduled if applicable, published, archived, and withdrawn states as supported.
- Make binding status visible in the UI.
- Keep the UI aligned to repo governance and shared SPFx/UI patterns where applicable.
- Avoid over-designing the v1 UI with features that are not yet supported by the architecture or services.

Required outputs before you stop:
- authoring UI surfaces
- child-row editing flows
- workflow action wiring
- status/binding visibility
- screenshots or comparable evidence where practical
```
