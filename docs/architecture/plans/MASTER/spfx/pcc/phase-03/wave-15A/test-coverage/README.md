# PCC 100-Point UI/UX Scorecard Evidence Automation + Audit Support Package

## Objective

This implementation package instructs a local code agent to build a semi-automated scorecard evidence system for the HB Intel Project Control Center (PCC). The system combines:

- Playwright tenant-hosted evidence capture.
- Accessibility and interaction assertions.
- Runtime/console/package evidence.
- Scorecard-to-evidence traceability.
- Doctrine/source/Mold Breaker audit artifacts.
- Human-auditor scoring worksheets.

The intent is not to pretend the entire 100-point score can be calculated by code. The intent is to automate every evidence item that code can honestly capture, organize every scorecard requirement into reproducible artifacts, and clearly identify where expert review remains required.

## Tenant Target

```text
https://hedrickbrotherscom.sharepoint.com/sites/26999HBCentralTestProject
```

If the PCC web part is installed on a specific SharePoint page rather than the site root, set `PCC_LIVE_PAGE_URL` to that exact page URL.

## Governing Documents

The implementation must reference and align to these governing files:

- `docs/explanation/design-decisions/con-tech-ui-study.md`
- `docs/explanation/design-decisions/con-tech-ux-study.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md`

## Current Repo-Truth Assumptions

- Root `package.json` already has Playwright and root e2e scripts.
- `apps/project-control-center/package.json` is currently Vitest/Vite-only and does not have a PCC-specific Playwright lane.
- Existing live SharePoint testing pattern should be followed: environment-gated, storageState-based, no local web server, no production mutation.
- PCC Wave 15A wave-b3 `data-pcc-*` markers should be used as the primary selector/evidence contract.

## Package Contents

- `PACKAGE_MANIFEST.md`
- `docs/` — full plan, architecture, traceability, scorecard support, safety, and validation documents.
- `prompts/` — sequenced implementation prompts for a local code agent.
- `schemas/` — JSON schemas for evidence manifest, findings register, and scorecard output.
- `templates/` — starter config/env/templates for implementation.
- `checklists/` — hard-stop and scorecard audit worksheets.

## Implementation Principle

Playwright is the evidence engine. The scorecard audit system is the evaluation framework. Expert review remains required for Mold Breaker differentiation, cognitive-load judgment, construction-specific clarity, and final scoring.
