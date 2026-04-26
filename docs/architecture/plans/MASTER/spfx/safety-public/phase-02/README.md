# Safety Field Excellence Dynamic Cutover — Local Code Agent Prompt Package

Generated: 2026-04-25  
Repo: `RMF112018/hb-intel`  
Authoritative branch: `main`

## Purpose

This package provides detailed local-code-agent prompts to implement the Safety Field Excellence dynamic cutover development package.

The implementation objective is to cut over the existing curated/config-driven `hb-intel-homepage` Safety Field Excellence surface into a dynamic, governed, weekly Safety Field Excellence experience powered by the **existing backend Function App currently used by the Safety application**.

The surface must meet homepage flagship standards using:

- `docs/reference/ui-kit/doctrine/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`

## Package Contents

| File | Purpose |
|---|---|
| `00_MASTER_IMPLEMENTATION_PROMPT.md` | Master prompt for the local agent to understand the whole program and execution rules. |
| `01_SCHEMA_AND_ARCHITECTURE_PROMPT.md` | Wave 01: schema, descriptors, docs, provisioning foundation. |
| `02_SCORING_DOMAIN_PACKAGE_PROMPT.md` | Wave 02: scoring, eligibility, exposure, narrative, and payload package. |
| `03_BACKEND_ROLLUP_APIS_PROMPT.md` | Wave 03: backend Function App rollup APIs and candidate generation. |
| `04_TIMER_AND_PUBLISH_WORKFLOW_PROMPT.md` | Wave 04: weekly timer, approval, override, publish, suppress, rollback. |
| `05_HOMEPAGE_DYNAMIC_ADAPTER_PROMPT.md` | Wave 05: homepage source modes, backend read adapter, preview fallback. |
| `06_UIUX_FLAGSHIP_REMEDIATION_PROMPT.md` | Wave 06: homepage doctrine, scorecard, breakpoint, state, and polish pass. |
| `07_HOSTED_CUTOVER_PROOF_PROMPT.md` | Wave 07: package truth, hosted runtime proof, staged cutover, rollback. |
| `08_FINAL_CLOSURE_AND_COMMIT_PROMPT.md` | Final closeout, commit message, evidence, and handoff summary. |
| `09_AGENT_OPERATING_RULES.md` | Standing rules the agent must follow in every wave. |

## How to Use

1. Start with `00_MASTER_IMPLEMENTATION_PROMPT.md`.
2. Run each wave prompt sequentially.
3. Do not allow the agent to skip proof or defer required closure.
4. Require a Plan Summary before each execution wave.
5. Require a closure report after each wave.
6. Commit only after the wave’s verification evidence is captured.

## Non-Negotiables

- Do not build a second backend.
- Do not bypass the existing Safety backend Function App.
- Do not make the homepage client aggregate raw Safety records.
- Do not highlight projects based solely on a single inspection score.
- Do not reward low-activity perfect-score artifacts.
- Do not remove curated fallback before hosted dynamic proof passes.
- No generic enterprise white-card UI.
- No dead CTAs.
- No missing loading/empty/error/preview states.
- Preview fallback must look like the future product state and must be clearly labeled as preview/sample/prospective content.
- Final homepage-grade target is 48+/56 on the attached scorecard with no hard-stop failures.

## Expected Agent Deliverables Per Wave

Each wave must produce:

- Plan Summary
- Files inspected
- Files changed
- Implementation notes
- Validation commands and results
- Runtime/hosted proof where applicable
- Scorecard impact where applicable
- Risks and unresolved issues
- Exact next prompt readiness
