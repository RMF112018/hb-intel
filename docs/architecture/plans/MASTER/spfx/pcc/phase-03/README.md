# PCC Phase 3 Prompt Package

## Purpose

This package contains staged prompts for the Project Control Center (PCC) Phase 3 planning and implementation-readiness track.

The prompt sequence is designed to allow safe Phase 3 planning while Phase 2 provisioning work remains active. Implementation prompts are intentionally gated and must not be executed until the required Phase 2 proof, mutation, validation, and closeout gates are satisfied.

## Prompt Index

| Prompt | File | Gate |
|---:|---|---|
| 01 | `Prompt_01_Phase_3_Concurrent_Readiness_Audit_and_Boundary_Documentation.md` | Concurrent-safe now |
| 02 | `Prompt_02_PCC_Product_Architecture_and_User_Journey_Blueprint.md` | Concurrent-safe now |
| 03 | `Prompt_03_PCC_SPFx_Shell_Design_Spec_Planning_Only.md` | Concurrent-safe now; planning only |
| 04 | `Prompt_04_PCC_Backend_Service_Contract_Design_Planning_Only.md` | Concurrent-safe now; final DTOs Step 4/5 dependent |
| 05 | `Prompt_05_PCC_Admin_Workflow_Readiness_Model.md` | Concurrent-safe now; planning only |
| 06 | `Prompt_06_Phase_3_Implementation_Gate_Review.md` | Phase 2 Step 4 or Step 5 dependent |
| 07 | `Prompt_07_PCC_SPFx_Shell_Scaffold_Gated_Implementation.md` | Phase 2 closeout dependent unless explicitly approved |
| 08 | `Prompt_08_PCC_Backend_Read_Model_Scaffold_Gated_Implementation.md` | Phase 2 Step 5/6 dependent |
| 09 | `Prompt_09_PCC_Site_Health_Drift_Read_Model_Gated_Implementation.md` | Phase 2 Step 6 dependent |
| 10 | `Prompt_10_Non_Production_Rollout_Proof_Package.md` | Phase 2 closeout dependent |
| 11 | `Prompt_11_Production_Rollout_Gated.md` | Production-blocked until separately approved |

## Global Guardrails

These guardrails apply to every prompt in this package unless a later implementation gate explicitly authorizes a narrower exception:

- Treat repo truth as authoritative.
- Do not rely on prior summaries unless validated against current files.
- Do not re-read files that are still within active context or memory.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not introduce new architecture decisions unless repo truth supports them.
- If a true decision is required, record it in an open decision register.
- Preserve Phase 1 and Phase 2 invariants:
  - `@hbc/project-site-template` remains schema/contract/validation-only.
  - `@hbc/project-site-provisioning` remains no-mutation planner/mapper/proof until Phase 2 authorizes executor work.
  - Tenant mutation is blocked by default.
  - Backend executor work waits for Phase 2 mutation gates.
  - SPFx work must not bind to unstable Phase 2 contracts.
  - Procore remains placeholder/deferred unless explicitly authorized later.
  - No Procore secrets.
  - No full Procore mirror.
  - No Procore write-back.
  - No direct SPFx-to-Procore calls.

## Recommended Use

Execute prompts in sequence. Prompts 01 through 05 are planning-safe. Prompt 06 is the first gate-review prompt and should wait until Phase 2 Step 4 or Step 5 produces stable evidence. Prompts 07 through 11 are implementation or rollout prompts and should remain blocked until the stated gates close.
