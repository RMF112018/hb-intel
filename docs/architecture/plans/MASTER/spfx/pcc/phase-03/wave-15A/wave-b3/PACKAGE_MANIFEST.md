# Package Manifest — PCC Wave 15A Prompt 02 Remediation

**Package date:** 2026-05-06  
**Package purpose:** Developer-ready remediation package for the PCC shared bento/card primitive tier contract.  
**Execution target:** Local code agent working in `RMF112018/hb-intel`.  
**Runtime area:** `apps/project-control-center`.  
**Wave:** Phase 3 / Wave 15A.  
**Prompt stage:** Prompt 02 — Shared Bento/Card Primitive Tier Contract Remediation.

## Closed Decisions

This package resolves all decisions needed for implementation. Do not reopen them unless the codebase has already diverged in a way that makes the exact instruction impossible.

| Decision | Final Answer |
| --- | --- |
| Does `PccDashboardCard` get a new tier contract? | Yes. Add `tier?: 'tier1' | 'tier2' | 'tier3' | 'state'`. |
| Does `PccDashboardCard` get a region contract? | Yes. Add `region?: 'command' | 'operational' | 'reference' | 'state' | 'deferred' | 'detail' | 'rail'`. |
| Does `hierarchy` remain? | Yes, as a backward-compatible visual alias. Explicit `tier` wins. Keep `data-pcc-card-hierarchy` during migration. |
| Does the primitive get a heading contract? | Yes. Add `headingLevel?: 2 | 3 | 4`; default by tier. |
| Should cards use `aria-labelledby`? | Yes. If a visible title exists, generate a stable heading id and use `aria-labelledby`. `aria-label` remains fallback only when no visible title exists. |
| Add `rail` and `detail` footprints? | Yes. Add them to all footprint maps and tests. |
| Does `full` remain dashed? | No. Remove global dashed border from full footprint. Dashed/tinted treatments belong to `region='state'` or `region='deferred'`, not layout footprint. |
| Do surfaces need explicit card inventory tests? | Yes. Every routed PCC surface must prove exactly one Tier 1 command card and complete card tier/region coverage. |
| Are backend/read-model changes allowed? | No, except type-only UI props inside app-local UI files if strictly required. |
| Are package installs or lockfile changes allowed? | No. |
| Are live integrations or enabled mutations allowed? | No. |

## Files in This Package

| File | Purpose |
| --- | --- |
| `README.md` | Package overview and execution instructions. |
| `PACKAGE_MANIFEST.md` | This manifest and closed decision register. |
| `00_REMEDIATION_BLUEPRINT.md` | End-state architecture and remediation doctrine. |
| `01_CARD_TIER_REGION_CONTRACT.md` | Exact `PccDashboardCard` API and behavior contract. |
| `02_SURFACE_CARD_INVENTORY_MATRIX.md` | Locked target card inventory for every routed surface. |
| `03_VISUAL_HIERARCHY_AND_TOKEN_SPEC.md` | Tier/region visual design specification. |
| `04_HEADING_ARIA_ACCESSIBILITY_CONTRACT.md` | Heading, ARIA, keyboard, and state accessibility rules. |
| `05_FOOTPRINT_RAIL_DETAIL_SPAN_SPEC.md` | Exact `rail` and `detail` footprint spans and min widths. |
| `06_SURFACE_FIRST_SCREEN_PRIORITY_RULES.md` | Per-surface first-screen and above-fold rules. |
| `07_TEST_ACCEPTANCE_MATRIX.md` | Required tests and expected assertions. |
| `08_SCREENSHOT_AND_HOSTED_EVIDENCE_PLAN.md` | Hosted evidence plan and screenshot matrix. |
| `09_NON_GOALS_AND_HARD_STOPS.md` | Explicit exclusions and stop conditions. |
| `10_IMPLEMENTATION_SEQUENCE.md` | Ordered implementation plan with validation gates. |
| `11_RISK_REGISTER_AND_DECISION_LOG.md` | Risks, mitigations, and resolved decisions. |
| `wireframes/README.md` | Wireframe index. |
| `wireframes/01_PRIMITIVE_CARD_WIREFRAMES.md` | Primitive-level card wireframes. |
| `wireframes/02_SURFACE_WIREFRAMES.md` | Surface-level desktop/laptop/mobile wireframes. |
| `prompts/Prompt_01...md` through `prompts/Prompt_09...md` | Executable local-code-agent prompts. |
| `artifacts/surface_card_inventory.csv` | Machine-readable surface inventory. |
| `artifacts/target_card_contract.json` | Machine-readable primitive contract. |

## Required Repo Validation Commands

Run from repo root unless a command must be scoped otherwise.

```bash
git status --short
git rev-parse HEAD
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center exec tsc --noEmit
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed files>
git diff --check
```

If the package manager scripts differ locally, use the closest repo-truth command and document the substitution in closeout.
