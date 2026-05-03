# PCC Unified Lifecycle Remaining Gap Remediation Prompt Package

## Purpose

This package instructs a local code agent working in `/Users/bobbyfetting/hb-intel` to address the remaining implementation/detail gaps identified after the targeted repo-truth audit of the updated PCC unified lifecycle documentation.

The package assumes the doctrine docs now exist and are accepted as the governing target architecture. The work is not to redefine the objective. The work is to convert the accepted doctrine into controlled model contracts, read-model seams, SPFx preview UX, security/permission posture, validation tests, and closeout documentation without creating departmental workspaces or duplicate source-of-record claims.

## Execution Order

Run the prompts in sequence. Do not skip ahead unless the earlier prompt is already fully satisfied by repo truth and the agent documents the proof.

1. `prompts/00_repo_truth_revalidation.md`
2. `prompts/01_lifecycle_memory_lens_contracts.md`
3. `prompts/02_traceability_warranty_cross_project_contracts.md`
4. `prompts/03_backend_read_model_routes_and_tests.md`
5. `prompts/04_spfx_clients_fixtures_and_surface_seams.md`
6. `prompts/05_project_home_readiness_and_constraints_ui_integration.md`
7. `prompts/06_unified_search_hbi_grounding_preview.md`
8. `prompts/07_security_retention_permission_model_hardening.md`
9. `prompts/08_validation_closeout_and_commit.md`

## Non-Negotiable Guardrails

- Do not create separate PCC workspaces for preconstruction, operations, warranty, accounting, closeout, executive oversight, or any department.
- Do not create a new standalone app outside the existing PCC shell.
- Do not make PCC the source of truth for Procore, Sage, CRM, Autodesk, Document Crunch, SharePoint, Graph, or other external-system-native records.
- Do not add dependencies or modify `pnpm-lock.yaml` unless the user explicitly authorizes it.
- Do not perform tenant mutation, production rollout, Graph/Procore/Sage writeback, or live external-system writes.
- Keep the first implementation preview-safe, fixture-backed, and source-lineage-forward.
- Preserve the single project operating layer: surfaces, work centers, workflow modules, and lenses are contextual views over one project truth.
- Do not re-read files that are still in the agent's active context or memory; only reopen files when repo truth must be verified or prior context is stale, incomplete, or contradictory.

## Expected Final State

After this prompt sequence is executed, repo truth should include:

- TypeScript contracts for lifecycle events, project memory, role/stage lenses, traceability edges, cross-project references, warranty trace records, obligation/vendor/product trace records, source lineage, and evidence links.
- Deterministic fixtures and regression tests for those contracts.
- Backend read-model provider and GET-only routes for lifecycle, memory, traceability, warranty trace, cross-project references, and unified search/HBI grounding preview where appropriate.
- SPFx API clients and preview-safe fixtures for the new read models.
- Project Home and/or Project Readiness UI seams that surface lifecycle timeline, project memory, related records, and Constraints Log integration without creating module silos.
- A preview-only unified search / Ask-HBI grounding surface or panel that returns cited, permission-aware, source-lineage-backed answers from fixtures only.
- Security, retention, and permission posture documentation for cross-project knowledge reuse.
- A closeout doc proving validation commands, changed files, lockfile MD5, and remaining deferred items.
