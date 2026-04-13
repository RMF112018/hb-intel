# 13 — Prompt 09 — Testing, Hosted Vetting, and Build Proof

```text
You are working in the live local HB Intel repo.

Objective:
Perform the final quality pass: automated validation, hosted vetting, defect closure, and clean build/package proof for the Project Spotlight publisher application.

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
- Add or update automated tests for the critical publish path and important failure modes.
- Execute hosted vetting against the real SharePoint destination path.
- Use the checklist in this package as the closure framework.
- Fix defects found during testing rather than only documenting them, unless they are explicitly deferred with rationale.
- Produce clean build/package proof showing the latest local source was built.
- Prove that no stale source or stale package artifact was used.
- End with a closure note that clearly states what is complete, what remains open, and what should be done next.

Required outputs before you stop:
- automated test evidence
- hosted verification results
- defect-fix summary
- clean build/package proof
- final closure note with residual risks or follow-ups
```
