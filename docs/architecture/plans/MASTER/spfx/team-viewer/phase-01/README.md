# TeamViewer Prompt Package

This package was generated from a repo-truth audit of the live `main` branch of:

- `https://github.com/RMF112018/hb-intel.git`

Primary audit target:

- `apps/hb-webparts/src/webparts/hbKudos/`

Objective:

- learn from the **HB Kudos public app** as a reference implementation,
- determine what should be reused, generalized, adapted, or left behind,
- and implement a new premium SPFx people viewer app named `teamViewer` without cloning Kudos workflow/domain behavior.

## Governing authority

Treat the following as binding:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Treat the following as benchmark / workflow / closure authority:

1. `docs/architecture/plans/MASTER/spfx/benchmark/README.md`
2. `docs/architecture/plans/MASTER/spfx/benchmark/02-Kudos-Public-Benchmark-Reference.md`
3. `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
4. `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
5. `docs/architecture/plans/MASTER/spfx/benchmark/05-Code-Agent-Governance-Prompt-Template.md`
6. `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`


## Additional scope lock from follow-up requirements

This package now also assumes the following product requirements are in scope:

1. `teamViewer` is **article-bound**, not a free-floating generic people list.
   - It must receive article-associated team-member content from the article system.
   - Source resolution must account for **host site address / page context** so the correct article family can drive the viewer on sites such as Company Pulse, Project Spotlight, and other future article destinations.
   - The uploaded reference architecture is the planning input for this source model:
     - `HB Articles`
     - `HB Article Team Members`
     - `HB Article Destination Pages`
     - related optional child/configuration lists as needed

2. Team members must support a **bio / resume slide-out** interaction.
   - The slide-out should reuse the **mechanical shell logic discipline** proven by Kudos right-side panels/drawers.
   - The feature must be **implemented for real**, with contracts, component wiring, and validation.
   - It must remain **disabled by default for now** behind an explicit feature flag / config posture until the business turns it on.

## Package contents

- `00-Plan-Summary.md`
- `01-Audit-Summary.md`
- `02-Current-State-Architecture-and-Gap-Register.md`
- `03-Decision-Lock.md`
- `04-Target-Architecture-and-Interaction-Model.md`
- `05-Prompt-01_Architecture-and-Seam-Extraction.md`
- `06-Prompt-02_Data-Contracts-and-Source-Binding.md`
- `07-Prompt-03_Surface-Build-and-Interaction-System.md`
- `08-Prompt-04_Photo-Identity-and-Fallback-System.md`
- `09-Prompt-05_Manifest-Mount-Harness-and-Hosted-Validation.md`
- `10-Prompt-06_Closure-Review-and-Conformance-Scoring.md`

## Execution rule

Run the prompts in order.

Do not blend phases.

Each prompt is a closure unit. The agent must fully inspect, scrub, implement, validate, and close that unit before moving to the next one.

## Core implementation position

`teamViewer` should be implemented as a **new standalone webpart** under `apps/hb-webparts/src/webparts/teamViewer/`, using:

- `@hbc/ui-kit/homepage` as the primary UI entry point,
- selectively generalized people/photo/runtime patterns learned from Kudos,
- new `teamViewer` contracts and view-models,
- zero direct dependency on Kudos workflow/domain contracts.

## Mandatory operating instruction

Every implementation prompt in this package includes the required instruction:

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
