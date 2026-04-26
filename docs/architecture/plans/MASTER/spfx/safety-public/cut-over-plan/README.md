# Safety Field Excellence Dynamic Cutover Development Package

Generated: 2026-04-25

## Objective

This package instructs the cutover of the current `hb-intel-homepage` Safety Field Excellence surface from a curated/config-authored homepage module to a dynamic, governed weekly safety-excellence surface powered by the backend Function App already used by the `hb-intel-safety` application.

The implementation must preserve the current homepage shell/zone architecture, interact with the existing Safety backend Function App, and produce a flagship-grade homepage surface that complies with:

- `docs/reference/ui-kit/doctrine/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`
- `homepage-uiux-audit-checklist.md`
- `homepage-uiux-audit-scorecard.md`

## Package Contents

1. `00_Plan_Summary.md` — executive implementation summary and cutover thesis.
2. `01_Current_Repo_Truth_and_Target_State.md` — current-state findings, target architecture, and source-of-truth rules.
3. `02_Backend_Function_App_and_Data_Pipeline.md` — Function App integration, schema, rollup, timer, approval workflow, and API contracts.
4. `03_Homepage_Surface_and_UIUX_Requirements.md` — homepage surface, preview fallback, UI doctrine, shell-fit, state model, and flagship acceptance gates.
5. `04_Phased_Implementation_Plan.md` — wave-by-wave execution plan with sequencing and acceptance criteria.
6. `05_Agent_Prompt_Package.md` — fresh-session prompts for implementation waves.
7. `06_Verification_and_Hosted_Proof.md` — package truth, hosted runtime proof, scorecard gate, and rollback evidence.
8. `07_Risk_Register_and_Governance.md` — risks, mitigations, governance, anti-patterns, and safety recognition controls.

## Non-Negotiable Cutover Rules

- Do not make the homepage client compute safety excellence from raw inspection/finding/project-week lists.
- Do not select highlights based solely on one inspection score.
- Do not reward low-activity perfect-score artifacts.
- Do not redesign the entire homepage shell to solve this feature.
- Do not bypass the backend Function App currently used by the Safety application.
- Do not remove curated fallback until hosted proof demonstrates dynamic production readiness.
- Do not ship a generic enterprise white-card surface.
- If no dynamic data is available, the fallback must be a polished preview of the intended future state, not an empty apology card.
- The final implementation must reach flagship/benchmark-grade acceptance according to the scorecard: target 48+/56 with no hard-stop failures.

## Expected Delivery Pattern

Each implementation wave must produce:

- Plan Summary
- Files changed
- Tests run
- Runtime/hosted proof where applicable
- Scorecard impact
- Risks and next-wave readiness
