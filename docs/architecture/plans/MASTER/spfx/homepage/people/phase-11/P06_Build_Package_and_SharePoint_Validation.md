# Phase 06 — Build, Package, and SharePoint Validation

## Objective

Produce the final clean build and prove that the deployed SharePoint-hosted People & Culture output matches the intended remediation.

---

## Operating Instructions

You are working in the live repo for `RMF112018/hb-intel`.

Use repo truth from `main` as authoritative.

Do not re-read files that are already in your active context or memory unless you need to verify drift or resolve uncertainty.

Do not perform timid cosmetic cleanup in place of the structural objective of this phase.

Do not broaden the scope beyond this phase except for small adjacent changes that are directly required to keep the implementation coherent and compiling.

---

## In Scope


- relevant build/package scripts
- clean rebuild of the webparts package
- manifest/package sanity checks relevant to People & Culture
- deployment verification steps and evidence capture


---

## Out of Scope


- additional feature work
- design experimentation
- reopening product architecture decisions from earlier phases


---

## Required Inputs

At minimum, use and reconcile the following where relevant:

- `apps/hb-webparts/src/webparts/peopleCulture/`
- `packages/ui-kit/`
- `apps/hb-webparts/src/homepage/`
- current People & Culture homepage placement and routing seams
- the SPFx UI doctrine governing standard
- the current People & Culture remediation package summary

---

## Required Tasks


1. Identify the correct clean build path for the webparts package from repo truth.
2. Run the required clean rebuild steps.
3. Produce the updated `hb-webparts.sppkg`.
4. Confirm that the expected People & Culture code is present in the output package/build artifacts.
5. Validate the manifest and packaging assumptions relevant to this webpart.
6. Validate deployed rendering in SharePoint as far as the available environment allows.
7. Capture concise proof that the deployed output reflects the remediation and not a stale or partial build.


---

## Required Deliverables


- build note with exact commands used
- final package/build validation note
- deployed-verification note or equivalent evidence summary
- updated `hb-webparts.sppkg` if this phase is executed in an environment that produces artifacts


---

## Validation Requirements


- the package builds cleanly
- the generated artifact contains the intended People & Culture implementation
- SharePoint-hosted rendering reflects the remediation
- no stale-build ambiguity remains for this webpart


---

## Completion Standard


Mark this phase complete only when there is evidence that the package and the deployed SharePoint result reflect the intended People & Culture remediation.
