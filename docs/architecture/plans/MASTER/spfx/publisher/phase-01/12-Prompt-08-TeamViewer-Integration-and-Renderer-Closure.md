# 12 — Prompt 08 — Team Viewer Integration and Renderer Closure

```text
You are working in the live local HB Intel repo.

Objective:
Fully close the Team Viewer integration path for the Project Spotlight shell and ensure the current renderer contract, adapter logic, and empty-state behavior are correct.

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
- Audit the existing Team Viewer code path in repo truth before modifying it.
- Confirm the actual property contract that must be supplied within the Project Spotlight shell.
- Build or refine the adapter from structured team-member child rows to Team Viewer inputs.
- Support article/post-bound data loading as intended.
- Confirm the expected handling for zero-team, small-team, and larger-team cases within the current MVP.
- Keep any profile-detail drawer or advanced flags behind the intended defaults/feature flags.
- Do not overgeneralize the renderer contract beyond what the architecture and shell need right now.

Required outputs before you stop:
- Team Viewer contract confirmation
- Team Viewer adapter logic
- empty-state and density/layout behavior notes
- hosted or local evidence that Team Viewer receives the correct bound data
```
