# PCC Unified Lifecycle Documentation Update Prompt Package

Date: 2026-05-03

## Purpose

This package instructs a local code agent working in `/Users/bobbyfetting/hb-intel` to make documentation-only updates that align the Project Control Center (PCC) architecture with the repo-truth audit findings.

The goal is to lock PCC as one unified, lifecycle-aware project operating layer, not a collection of departmental workspaces or siloed modules.

## Package Contents

1. `00_MASTER_INSTRUCTIONS.md` — governing instructions for the full documentation update sequence.
2. `01_REPO_TRUTH_REVALIDATION_PROMPT.md` — local repo-truth validation prompt.
3. `02_UNIFIED_OBJECTIVE_ARCHITECTURE_PROMPT.md` — creates the main unified lifecycle doctrine document.
4. `03_LIFECYCLE_MEMORY_LENS_DOCS_PROMPT.md` — creates the lifecycle spine, project memory, and role/stage lens docs.
5. `04_TRACEABILITY_SEARCH_KNOWLEDGE_DOCS_PROMPT.md` — creates traceability, warranty, knowledge reuse, and HBI grounding docs.
6. `05_EXISTING_DOC_ALIGNMENT_PROMPT.md` — amends existing PCC docs and registers to reference the new doctrine.
7. `06_VALIDATION_CLOSEOUT_PROMPT.md` — validates docs, proves no runtime/lockfile changes, and creates closeout.
8. `reference/REPO_AUDIT_FINDINGS_SUMMARY.md` — audit findings the agent must preserve.
9. `reference/DOCUMENT_UPDATE_TARGET_MAP.md` — new docs and existing docs to update.
10. `reference/LOCAL_VALIDATION_COMMANDS.md` — command checklist for proof.

## Execution Order

Run the prompts in numerical order. Do not skip Prompt 01. Do not proceed to Prompt 05 until the new doctrine documents from Prompts 02–04 are in place.

## Critical Scope Rule

This is a documentation-only package. The local code agent must not implement runtime source code, SPFx UI, backend routes, model contracts, fixtures, tests, or package/dependency changes unless a later authorized implementation package explicitly instructs that work.
