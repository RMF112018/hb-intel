# 07 — Prompt 03 — Service Layer and Template Resolution

```text
You are working in the live local HB Intel repo.

Objective:
Implement the Project Spotlight publisher service layer, including post services, child-record services, template-registry access, binding services, and deterministic template/shell/validation resolution.

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
- Implement typed repositories/services for posts, team members, media, template registry, and page bindings.
- Keep raw SharePoint list access out of UI surfaces as much as reasonably possible.
- Implement resolution logic using the architecture-defined drivers such as post family, spotlight type, project stage, article subject, admin override, shell compatibility, validation profile, and renderer profile.
- Make template resolution explicit and inspectable.
- Ensure service outputs are shaped for both preview and publish reuse.
- Add focused unit tests for critical resolver paths where practical.

Required outputs before you stop:
- service/repository layer
- resolution engine
- shared mapping/result contracts
- resolver test evidence
- documentation of the resolution decision path
```
