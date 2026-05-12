# HB Intel My Dashboard — B02 Implementation Prompt Package

**Package purpose:** instruct a local Claude Code / Opus 4.7 implementation session to execute **B02 — My Dashboard Hosting, Packaging, Protected API Authentication, and Runtime Development** against current repo truth without overreaching into later My Dashboard batches.

**Prepared:** 2026-05-12  
**Primary planning artifact:** `B02_My_Dashboard_Hosting_Packaging_Auth_And_Runtime_Development.md`  
**Repo truth reviewed:** live `main` state available during package creation  
**Package type:** code implementation prompt package, with supporting implementation plan, gap register, file map, validation requirements, and targeted web-verification notes.

---

## Executive read

B02 is implementation-ready. The live repo already contains the B02 planning artifact, but the runtime/domain work that B02 specifies is still absent:

- no `apps/my-dashboard/` runtime domain,
- no My Dashboard SPFx package solution or manifest,
- no My Dashboard mount/global runtime marker,
- no My Dashboard runtime config/readiness modules,
- no My Dashboard domain registration in `tools/build-spfx-package.ts`,
- no My Dashboard package-truth proof seam.

This package is therefore **code-oriented**, unlike the B01 package, which was primarily a document-authority hardening package.

---

## Execution prerequisites

### Hard prerequisite
Execute the **B01 implementation package** first, or independently confirm that its documentation-authority corrections have already landed. B02 relies on B01 for the authoritative My Dashboard product boundary and the dev-plan batch/index chain.

### Local agent operating rules
Every prompt in this package instructs the implementation agent to:

- inspect the live repo before editing,
- preserve unrelated in-progress work,
- avoid broad or destructive cleanup,
- avoid implementing B03–B08 scope early,
- not re-read files that remain within the agent's current context or memory unless exact current text is needed for patching or drift is suspected,
- provide a grounded closeout with files changed, validations run, skipped validations, and residual risk.

---

## Package contents

### Supporting artifacts
1. `00_B02_Implementation_Package_Overview.md`
2. `01_B02_Repo_Truth_Implementation_Plan.md`
3. `02_B02_Target_Architecture_And_File_Map.md`
4. `03_B02_Validation_And_Closeout_Requirements.md`
5. `04_B02_Implementation_Gap_Register.md`
6. `05_B02_Targeted_Web_Verification_Notes.md`

### Implementation prompts
1. `Prompt_01_Create_My_Dashboard_App_Domain_And_SPFX_Package_Identity.md`
2. `Prompt_02_Implement_My_Dashboard_Runtime_Config_And_Production_Readiness.md`
3. `Prompt_03_Implement_My_Dashboard_Mount_Auth_Bootstrap_And_Runtime_Marker.md`
4. `Prompt_04_Register_My_Dashboard_In_SPFX_Packaging_Orchestrator_And_Package_Truth_Proof.md`
5. `Prompt_05_Validate_B02_Runtime_Packaging_Auth_And_Closeout.md`

---

## Recommended execution order

1. Run Prompt 01.
2. Run Prompt 02.
3. Run Prompt 03.
4. Run Prompt 04.
5. Run Prompt 05.

Do not reorder unless repo truth materially changed after this package was produced.

---

## Scope boundary

### B02 implements
- standalone `apps/my-dashboard` app/domain scaffold,
- standalone My Dashboard SPFx package/manifest identity,
- runtime configuration and production-readiness primitives,
- SPFx `mount.tsx` bootstrap with protected API token-provider seam,
- My Dashboard runtime marker contract,
- packaging orchestrator/domain registry/runtime marker/critical-path integration,
- package-truth proof eligibility and packaging validation posture.

### B02 does **not** implement
- My Work shell UI,
- My Work navigation/router state,
- Adobe Sign Action Queue UI,
- My Work read-model contracts beyond what is strictly necessary for compile safety,
- backend `/api/my-work/me/...` routes,
- Adobe OAuth/provider/token store machinery,
- hosted Playwright evidence lane,
- SharePoint page authoring itself.

Those are downstream batches.

---

## Strong implementation recommendation

Use the B02 artifact as the binding plan, but treat the live repo patterns as the implementation source of truth:

- **Package/manifest posture:** Project Control Center + HB Homepage.
- **Runtime auth bootstrap:** Estimating mount flow.
- **Runtime config/readiness:** Estimating and Accounting runtime config modules.
- **Runtime marker:** Project Control Center mount and build orchestrator proof path.
- **Packaging orchestrator:** `tools/build-spfx-package.ts` current domain registry and proof model.

---

## Expected closeout posture

After Prompt 05, the implementation agent should return:

1. final verdict: `PASS`, `PASS WITH ENVIRONMENT-LIMITED PACKAGING`, or `FAIL`,
2. exact files created/modified,
3. package/version/GUID posture used,
4. validation commands and outcomes,
5. package-truth proof result if packaging was runnable,
6. scope confirmations proving no B03–B08 implementation drift occurred,
7. explicit blockers if Node 18/SPFx packaging prerequisites were unavailable.
