# Wave 10 Permit & Inspection Control Center — Implementation Prompt Package

Generated: 2026-05-01  
Repo target: `/Users/bobbyfetting/hb-intel`  
Module: Phase 3 / Wave 10 — Permit & Inspection Control Center

## Purpose

This package instructs a local code agent to implement the first controlled Wave 10 module build for the HB Intel / Project Control Center repo.

Wave 10 replaces the narrow legacy **Permit Log** posture with a unified governed **Permit & Inspection Control Center** for:

- permit lifecycle tracking;
- required inspection readiness;
- AHJ launcher visibility;
- permit fee / application value / re-inspection fee exposure;
- failed inspection / correction / reinspection lineage;
- evidence-backed closeout;
- readiness and schedule-risk escalation;
- Priority Actions integration;
- Project Readiness integration;
- Approvals / Checkpoints integration;
- HB Document Control Center evidence posture;
- External Systems posture.

## Folder Structure

```text
wave10_permit_inspection_implementation_prompt_set_v2/
├── README.md
├── PACKAGE_MANIFEST.md
├── docs/
│   ├── 00_EXISTING_WAVE_10_DOCUMENTATION_MAP.md
│   ├── 01_REPO_TRUTH_AUDIT_SUMMARY.md
│   └── 02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md
├── prompts/
│   ├── 01_Wave_10_Implementation_Readiness_Audit.md
│   ├── 02_Shared_Models_And_Fixture_Contracts.md
│   ├── 03_Backend_GET_Only_Mock_Read_Model.md
│   ├── 04_SPFX_Read_Model_Client_And_Fixture_Parity.md
│   ├── 05_SPFX_Permit_Inspection_Control_Center_Surface_Shell.md
│   ├── 06_Priority_Readiness_Approvals_Integration.md
│   ├── 07_Tests_Guardrails_And_Implementation_Closeout.md
│   └── 08_Fresh_Reviewer_Prompt.md
└── reference/
    ├── 00_CONTROLLING_OBJECTIVE.md
    ├── 01_REQUIRED_REPO_TRUTH_FILES.md
    ├── 02_WAVE_10_REQUIRED_FIELDS_AND_STATUSES.md
    ├── 03_HARD_GUARDRAILS.md
    ├── 04_VALIDATION_COMMAND_REFERENCE.md
    └── 05_RESEARCH_PATTERN_REFERENCE.md
```

## Execution Order

Run the prompts in order:

1. `prompts/01_Wave_10_Implementation_Readiness_Audit.md`
2. `prompts/02_Shared_Models_And_Fixture_Contracts.md`
3. `prompts/03_Backend_GET_Only_Mock_Read_Model.md`
4. `prompts/04_SPFX_Read_Model_Client_And_Fixture_Parity.md`
5. `prompts/05_SPFX_Permit_Inspection_Control_Center_Surface_Shell.md`
6. `prompts/06_Priority_Readiness_Approvals_Integration.md`
7. `prompts/07_Tests_Guardrails_And_Implementation_Closeout.md`
8. Use `prompts/08_Fresh_Reviewer_Prompt.md` in a separate fresh session after Prompt 07 is committed.

## Non-Negotiable Guardrails

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not add package/dependency changes unless strictly required and explicitly approved.
- Do not change `pnpm-lock.yaml` unless a package/dependency change is separately approved.
- Do not change manifests, workflows, deployment files, or tenant configuration.
- Do not add SPFx packaging/deployment.
- Do not add AHJ scraping, AHJ API calls, AHJ scheduling, AHJ submission, or AHJ status polling.
- Do not add Procore runtime integration.
- Do not add Microsoft Graph runtime integration.
- Do not add SharePoint REST/PnP runtime operations.
- Do not add evidence file upload/sync/storage/mirror behavior.
- Do not add external-system writeback/sync/mirror.
- Do not add backend write routes.
- Do not add direct approval execution unless separately authorized.

## Required Local Verification

Prompt 01 must verify local repo truth before any implementation prompt is executed:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -8
md5 pnpm-lock.yaml
```

If local repo truth differs from this package, the agent must stop and report before editing.
