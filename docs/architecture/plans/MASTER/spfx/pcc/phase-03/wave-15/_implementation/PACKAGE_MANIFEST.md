# Package Manifest — PCC Wave 15 External Systems Launch Pad Implementation Prompt Set

## Package Name

`pcc_wave15_external_systems_launch_pad_implementation_prompt_set`

## Purpose

Provide a comprehensive, developer-ready, staged implementation prompt package for PCC Phase 3 Wave 15 `External Systems Launch Pad`.

This package is intentionally more instructive than a lightweight prompt set. It embeds the repo-truth findings, target architecture, required model/read-model/UX/backend seams, hard guardrails, web-research implications, validation commands, closeout expectations, and token-efficiency instructions needed to reduce local-agent rediscovery.

## Content Inventory

| Path | Purpose |
| --- | --- |
| `README.md` | Package use instructions, execution rules, and prompt order |
| `PACKAGE_MANIFEST.md` | Inventory, package limitations, and hard usage rules |
| `docs/00_EXISTING_WAVE_15_DOCUMENTATION_MAP.md` | Canonical Wave 15 docs/artifacts/wireframes and current disposition |
| `docs/01_REPO_TRUTH_AUDIT_SUMMARY.md` | Remote repo-truth audit findings and mandatory local revalidation |
| `docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md` | End-to-end staged implementation plan and dependencies |
| `docs/03_TARGET_ARCHITECTURE_AND_RUNTIME_SCOPE.md` | External Systems Launch Pad runtime scope and non-scope |
| `docs/04_DATA_MODEL_AND_READ_MODEL_CONTRACTS.md` | Shared model, fixture, read-model, and DTO contracts |
| `docs/05_SPFX_UX_IMPLEMENTATION_BLUEPRINT.md` | Surface anatomy and wireframe-to-component implementation guide |
| `docs/06_BACKEND_AND_ROUTE_BLUEPRINT.md` | GET-only backend mock provider and route extension plan |
| `docs/07_SECURITY_URL_POLICY_AND_HBI_GUARDRAILS.md` | URL policy, no-secret posture, HBI allowed/refused rules |
| `docs/08_SHAREPOINT_LIST_AND_INDEX_POSTURE.md` | List, field, index, retention, and storage guidance |
| `docs/09_TESTING_VALIDATION_AND_CLOSEOUT_GATES.md` | Required tests, validations, closeout evidence, and commit expectations |
| `docs/10_WEB_RESEARCH_SYNTHESIS.md` | Research findings and implementation implications |
| `docs/11_LOCAL_AGENT_TOKEN_EFFICIENCY_GUIDE.md` | Instructions to reduce local agent token use and repeated discovery |
| `prompts/01_Wave_15_Implementation_Readiness_Audit.md` | Read-only local repo-truth audit prompt |
| `prompts/02_Shared_Models_Fixtures_And_Domain_Contracts.md` | Models, fixtures, enums, schemas, and pure helpers prompt |
| `prompts/03_Backend_GET_Only_Mock_Read_Model_Family.md` | Backend mock provider and GET-only route family prompt |
| `prompts/04_SPFX_Read_Model_Client_And_Fixture_Parity.md` | SPFx client/fallback/route registry parity prompt |
| `prompts/05_SPFX_Launch_Pad_Surface_Shell.md` | Launch Pad home and project launch links shell prompt |
| `prompts/06_Project_Link_Drawer_Review_Queue_And_URL_Policy_UX.md` | Add/edit drawer, review queue, URL policy preview prompt |
| `prompts/07_Registry_Mapping_Health_Audit_And_Lineage_Surfaces.md` | Registry, mapping health, review detail, audit, HBI lineage prompt |
| `prompts/08_Project_Home_Priority_Readiness_Wave14_And_HBI_Seams.md` | Project Home, Priority Actions, Readiness, Wave 14, HBI seams prompt |
| `prompts/09_Tests_Guardrails_And_Implementation_Closeout.md` | Final test hardening, docs closeout, evidence prompt |
| `prompts/10_Fresh_Reviewer_Prompt.md` | Independent post-implementation reviewer prompt |
| `reference/00_CONTROLLING_OBJECTIVE.md` | Controlling implementation objective |
| `reference/01_REQUIRED_REPO_TRUTH_FILES.md` | Repo file/path inspection checklist |
| `reference/02_CANONICAL_WAVE15_DOCS_AND_ARTIFACTS.md` | Canonical Wave 15 docs/artifact inventory |
| `reference/03_REQUIRED_CONTRACTS_AND_FIELDS.md` | Required contracts/fields/states/action rules |
| `reference/04_HARD_GUARDRAILS.md` | Hard prohibitions and non-negotiables |
| `reference/05_VALIDATION_COMMAND_REFERENCE.md` | Validation command guide |
| `reference/06_RESEARCH_PATTERN_REFERENCE.md` | Research source implications |
| `reference/07_EXPECTED_FILE_CHANGE_MAP.md` | Expected implementation file change map |
| `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` | Reusable closeout template |
| `artifacts/web_research_sources.json` | Machine-readable web research source list |

## Hard Usage Rules

- Execute prompts in order.
- Prompt 01 is read-only and produces no commit.
- Every implementation prompt must begin with the required repo-truth commands and must capture branch, HEAD, status, and lockfile MD5.
- Every prompt must preserve local worktree hygiene; unrelated user-owned drift must not be staged.
- Every prompt must preserve the package's hard guardrails unless the user separately authorizes scope expansion.
- Every prompt must include the required instruction phrase: `Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.`
- Every implementation prompt must include tests and validation evidence in the final response.
- Every commit must include guardrail attestation.
- The local agent must not add dependencies, mutate manifests, rebuild SPPKGs, change tenant configuration, or perform deployment unless a prompt explicitly authorizes it and the user separately approves.

## Package Limitations

- This package was generated from remote GitHub repo truth plus public web research. The generator could not execute local commands in `/Users/bobbyfetting/hb-intel`.
- Local worktree cleanliness, current branch, current HEAD, package-lock state, and local file drift must be revalidated in Prompt 01.
- Public research informs safe implementation posture; it does not authorize cloning product behavior, using external SDKs, adding runtime dependencies, or enabling live external-system operations.
- SharePoint list documentation is treated as schema/contract guidance. Provisioning, tenant list creation, and production configuration remain out of scope unless a later authorized prompt explicitly opens that gate.
