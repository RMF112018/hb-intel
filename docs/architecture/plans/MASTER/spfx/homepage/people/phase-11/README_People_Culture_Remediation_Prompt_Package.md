# People & Culture Webpart — Comprehensive Remediation Prompt Package

## Package Objective

This package provides a complete phased prompt set for remediating and rebuilding the **People & Culture** SharePoint webpart and the narrowly related `@hbc/ui-kit` homepage primitives that are constraining the result.

The package is intended for a **local code agent** operating against the live repo.

The package assumes the following:

- the authoritative repo is the live `main` branch of `RMF112018/hb-intel`
- the current implementation under `apps/hb-webparts/src/webparts/peopleCulture/` is the latest intended implementation attempt
- the current rendered result is materially below the premium SPFx bar
- a **structural presentation rebuild** is allowed and expected where justified
- SharePoint host safety, authoring resilience, and packaging correctness remain mandatory

---

## Governing Intent

This package is governed by the attached and previously audited doctrine, especially:

- `UI-Doctrine-SPFx-Governing-Standard.md`
- the People & Culture audit objective prompt
- repo-truth findings from the current People & Culture implementation
- the requirement to avoid timid refinement and weak white-card sameness
- the requirement to preserve host-aware SharePoint behavior

This package is **not** for decorative cleanup.

It is for:

- architecture clarification
- surface-family correction
- rail-first productization
- real CTA and interaction wiring
- sparse-state hardening
- final build/package/deployment proof

---

## Execution Order

Execute the phases in order.

Do **not** skip ahead unless a prior phase explicitly concludes that the prerequisite decisions and outputs are complete.

1. `P00_Repo_Truth_Freeze_and_Product_Decision.md`
2. `P01_Information_Architecture_and_Surface_Blueprint.md`
3. `P02_UI_Kit_Recognition_Primitive_Additions.md`
4. `P03_Homepage_People_Culture_Rebuild.md`
5. `P04_Interaction_and_Destination_Wiring.md`
6. `P05_States_Sparse_Data_and_Authoring_Hardening.md`
7. `P06_Build_Package_and_SharePoint_Validation.md`

---

## Required Working Principles For Every Phase

Apply all of the following in every phase.

- Treat the live repo as authoritative.
- Do not re-read files that are already in your active context or memory unless you have a specific reason to verify drift.
- Prefer structural correction over decorative refinement when the existing composition is weak.
- Do not preserve parallel or deprecated implementations without an explicit reason.
- Do not introduce fake shell chrome or fight the SharePoint host.
- Do not overfit to placeholder demo data.
- Do not mark a phase complete without concrete validation evidence.
- Keep changes narrowly scoped to the stated phase boundaries unless a directly blocking dependency requires a minimal adjacent update.
- Record completion notes at the end of each phase in a concise markdown file in the same working area you use for agent notes.

---

## Repo Paths Expected To Be Central

- `apps/hb-webparts/src/webparts/peopleCulture/`
- `packages/ui-kit/`
- `apps/hb-webparts/src/homepage/`
- `apps/hb-webparts/src/mount.tsx`
- any People & Culture route/page wiring used for archive or destination behavior
- packaging/build scripts relevant to `hb-webparts.sppkg`

---

## Expected End State

By the end of this package, the repo should contain:

- one clear homepage People & Culture implementation strategy
- a rail-first premium People & Culture surface suited to the current homepage placement
- upstream homepage primitive support in `@hbc/ui-kit` where justified
- real CTA destinations and real interaction behavior
- resilient sparse/empty/loading/edit-mode behavior
- build/package proof that the deployed SharePoint output matches the intended remediation

---

## Package Contents

- `People_Culture_Remediation_Package_Summary.md`
- `P00_Repo_Truth_Freeze_and_Product_Decision.md`
- `P01_Information_Architecture_and_Surface_Blueprint.md`
- `P02_UI_Kit_Recognition_Primitive_Additions.md`
- `P03_Homepage_People_Culture_Rebuild.md`
- `P04_Interaction_and_Destination_Wiring.md`
- `P05_States_Sparse_Data_and_Authoring_Hardening.md`
- `P06_Build_Package_and_SharePoint_Validation.md`
