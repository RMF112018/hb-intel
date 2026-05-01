# HB Document Control Center — Phase 3 Wave 7 Planning Update Prompt Package

## Purpose

This package instructs a local code agent to audit the existing Project Control Center Phase 3 / Wave 7 planning, blueprint, and roadmap documentation and update all Wave 7 references to align with the updated target architecture for **HB Document Control Center**.

## Required outcome

The local code agent must produce a documentation-only update that:

- preserves Phase 3 / Wave 7 as the document-control wave;
- renames the module target to **HB Document Control Center** where appropriate;
- replaces the older two-lane description with the updated three-lane architecture;
- adds project source binding / Project Document Source Registry language;
- adds the `My Project Files` OneDrive working-file lane and hard guardrails;
- adds the complete role/action permission model, including Project Coordinator instead of Project Engineer;
- adds review types, metadata, source-binding, audit, workflow, and validation guidance;
- avoids live code, tenant, deployment, Graph, Procore, Adobe Sign, Document Crunch, package, lockfile, and manifest changes unless separately authorized.

## Files in this package

1. `00_Execution_Instructions.md`
   - Main prompt for the local code agent.

2. `01_Repo_Truth_Audit_Checklist.md`
   - Required audit gates before editing.

3. `02_Target_Architecture_Reference_HB_Document_Control_Center.md`
   - Complete target architecture definition to use as the authoritative reference for the documentation update.

4. `03_Documentation_Update_Instructions.md`
   - Specific docs to inspect/update and expected content changes.

5. `04_Validation_and_Closeout_Instructions.md`
   - Required validation, proof, and closeout format.

6. `05_Fresh_Reviewer_Prompt.md`
   - Optional reviewer prompt for a second agent/session after local changes are made.

## Strict scope

Documentation-only. Do not modify application source, backend source, package files, lockfiles, SPFx manifests, deployment workflows, tenant settings, or live integration code unless the user explicitly authorizes a later implementation step.
