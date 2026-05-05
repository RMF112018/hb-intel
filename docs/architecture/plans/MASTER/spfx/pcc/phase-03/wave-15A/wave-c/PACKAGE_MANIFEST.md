# Package Manifest — Wave C Project Context and Surface Header Remediation

## Package identity

- Package: `wave-C-project-context-surface-header-remediation`
- Intended repo placement: `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-C-project-context-surface-header-remediation/`
- Repo audited: `RMF112018/hb-intel @ a79d62155f5dc16936dbfa70d5c8a3cbea34b3e1`
- Audit date: `2026-05-05`
- Scope: PCC Phase 3 Wave 15A / Wave C — Project Context and Surface Header Standard
- Output type: local-code-agent remediation and hardening prompt package
- Implementation posture: staged, repo-truth-first, no backend/API expansion unless an existing model already exposes the required field

## Controlling objective

Standardize and harden how the Project Control Center communicates:

- selected project identity;
- project number and lifecycle/status context;
- current surface name and purpose;
- current operational state;
- next available action or limitation;
- source confidence, freshness, read-only/degraded/blocked posture;
- accessible heading and scan-path hierarchy.

## Current repo-truth posture

Wave C has already been partially/mostly implemented in the audited repo as `Wave 15A Prompt 03`.

Confirmed current implementation includes:

- `PccSurfaceContextHeader` shared primitive.
- Cross-surface usage across all eight primary routed surfaces.
- `PccSurfaceContextHeader.contract.test.tsx`.
- `pccSurfacePostureCopy` centralized posture vocabulary from Prompt 05.
- Product-language cleanup from Prompt 05.
- Shell/header/nav remediation from Prompt 02.

The generated package is therefore framed as a **verification, hardening, and remediation package** rather than a greenfield implementation package. If the local code agent runs on a branch behind Prompt 03, it must first implement the shared primitive and integrations. If it runs on or after commit `a79d62155`, it must avoid redundant rewrites and focus on the residual gaps documented here.

## Required file tree

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15A/wave-C-project-context-surface-header-remediation/
├── PACKAGE_MANIFEST.md
├── README.md
├── docs/
│   ├── 00_WAVE_C_REPO_TRUTH_AUDIT_FINDINGS.md
│   ├── 01_PROJECT_CONTEXT_DOCTRINE_MATRIX.md
│   ├── 02_CURRENT_PROJECT_CONTEXT_INVENTORY.md
│   ├── 03_TARGET_SURFACE_HEADER_CONTRACT.md
│   ├── 04_IMPLEMENTATION_REQUIREMENTS.md
│   ├── 05_SURFACE_APPLICATION_MATRIX.md
│   ├── 06_TEST_AND_VALIDATION_PLAN.md
│   ├── 07_SCREENSHOT_AND_EVIDENCE_PLAN.md
│   └── 08_RISK_DECISION_AND_DEFERMENT_LOG.md
├── prompts/
│   ├── Prompt_01_Project_Context_Scope_Lock_And_File_Map.md
│   ├── Prompt_02_Shared_Project_Context_Model_And_Surface_Header_Component.md
│   ├── Prompt_03_Apply_Surface_Header_To_All_Current_PCC_Surfaces.md
│   ├── Prompt_04_Project_Context_State_Source_Confidence_And_Responsive_Behavior.md
│   ├── Prompt_05_Cross_Surface_Context_Tests_And_Screenshot_Evidence.md
│   └── Prompt_06_Wave_C_Closeout_Evidence_And_Handoff.md
└── artifacts/
    ├── scorecard-impact-template.md
    ├── screenshot-evidence-index-template.md
    ├── source-file-map-template.md
    └── wave-agent-closeout-template.md
```

## Prompt sequence

1. `Prompt_01_Project_Context_Scope_Lock_And_File_Map.md`
   - Verify current state, confirm whether Wave C already exists, and create/update the file map before changes.
2. `Prompt_02_Shared_Project_Context_Model_And_Surface_Header_Component.md`
   - Create or harden the shared context model and shared surface header primitive.
3. `Prompt_03_Apply_Surface_Header_To_All_Current_PCC_Surfaces.md`
   - Ensure every routed surface uses the shared contract without duplicate headers or hard-coded context drift.
4. `Prompt_04_Project_Context_State_Source_Confidence_And_Responsive_Behavior.md`
   - Tighten source confidence, state posture, next action, container fit, and accessibility details.
5. `Prompt_05_Cross_Surface_Context_Tests_And_Screenshot_Evidence.md`
   - Add/update focused tests and capture screenshot evidence.
6. `Prompt_06_Wave_C_Closeout_Evidence_And_Handoff.md`
   - Publish closeout, scorecard impact, residual risks, and handoff to later waves.

## Required validation gates

Minimum command set unless repo truth identifies a stricter current gate:

```bash
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check "<changed files>"
```

Prompt-level focused tests are allowed during iteration, but final closeout must state whether the full PCC suite was run. Any skipped validation must have an explicit, evidence-backed reason.

## Non-claim

This package cannot claim final `56/56` readiness. Tenant-hosted SharePoint evidence, screenshot evidence, keyboard/accessibility evidence, and final scorecard closure remain required in later Wave 15A validation.
