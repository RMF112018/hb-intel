# 02 — Architecture Authority and Operating Rules

## Binding architecture inputs

Treat the following local files as implementation authority:

- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/README.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/00-Plan-Summary.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/01-Full-Detail-Product-and-Content-Model.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/02-List-By-List-Architecture.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/03-Exact-Field-Definitions.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/04-Child-Record-Relationships.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/05-Template-Registry-Schema.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/06-Article-Page-Binding-Schema.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/07-Webpart-Input-Contracts.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/08-Validation-Rules-by-Template.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/09-Editorial-Workflow-and-Lifecycle.md`
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/10-Implementation-Notes-and-Evolution-Rules.md`
- the Project Spotlight XML template saved in this same folder

## Additional governing posture

Apply the repo’s applicable SPFx and shared UI governance where relevant to the selected host package.

At minimum:
- respect the repo’s established package boundaries
- use existing shared primitives where appropriate
- avoid one-off UI patterns when governed shared UI exists
- document any intentional deviations from shared patterns

## Non-negotiable implementation rules

1. Project Spotlight is the only publishing destination.
2. The XML file is the canonical v1 shell authority.
3. The current shell uses OOB banner/text/gallery plus `teamViewer`.
4. The destination page is a rendered shell, not the source of editorial truth.
5. Structured list-backed post records are authoritative.
6. Publish and republish must be mediated through durable page bindings.
7. Shell and template versioning must be explicit.
8. Preview and publish must use the same resolution pipeline.
9. `hbSignatureHero` is a future-compatible renderer path, not an automatic v1 replacement.
10. No silent fallback back into the old dual-destination publisher assumptions.

## Operational rules for the local code agent

- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not perform unrelated refactors.
- Do not assume a successful build means the correct implementation is wired.
- Do not leave docs stale after substantial schema or contract changes.
- Do not close a prompt based on intent; close it based on evidence.

## Required evidence posture

Every prompt execution should leave behind some combination of:
- updated code
- updated docs
- updated provisioning scripts
- test output
- hosted verification notes
- known-gap log
