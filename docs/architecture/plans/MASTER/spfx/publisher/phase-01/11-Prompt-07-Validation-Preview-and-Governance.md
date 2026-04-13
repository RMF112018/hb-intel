# 11 — Prompt 07 — Validation, Preview, and Governance

```text
You are working in the live local HB Intel repo.

Objective:
Implement template-aware validation and preview behavior for the Project Spotlight publisher app, using the same underlying resolution pipeline that drives publish.

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

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
- Implement validation rules by template/profile according to the architecture docs.
- Ensure required-field rules align with the current shell and do not reintroduce unsupported requirements such as a hidden secondary-image dependency.
- Implement preview using the same resolution pipeline used by publish.
- Make validation output field-specific and action-oriented.
- Surface shell/version/template drift where it affects publish safety.
- Ensure governance rules are not bypassed by direct UI actions.

Required outputs before you stop:
- validation engine
- preview implementation
- evidence that preview and publish share the same resolution path
- drift/governance visibility in the UI or operational path
- test evidence for critical validation cases
```
