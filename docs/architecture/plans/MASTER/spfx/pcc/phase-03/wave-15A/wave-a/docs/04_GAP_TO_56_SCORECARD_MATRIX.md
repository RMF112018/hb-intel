# 04 — Gap-to-56 Scorecard Matrix

## Purpose

Create the remediation contract between current PCC repo truth and a final evidence-backed 56/56 score.

## Important Scoring Note

The current scores below are **planning baseline scores only**. They are intentionally conservative and must be updated by Prompt 01 after local screenshot, test, and tenant-evidence inspection. They are not a final audit score and must not be used to claim readiness.

## Scorecard Matrix

| Category | Current Score | Target Score | Gap | Confirmed Issues | Required Remediation | Evidence Required | Covered By Prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Shell and host fit | 1 | 4 | 3 | Shell dominance; SharePoint frame fit not evidence-backed | Prompt 02 | Screenshots at hosted and local widths; host runtime notes |
| Project context | 1 | 4 | 3 | Project identity/status/context inconsistent across surfaces | Prompt 03 | Header/context screenshot matrix; component tests |
| Navigation / IA | 1 | 4 | 3 | Module list may not communicate workflow/status/urgency | Prompt 02 | Nav behavior screenshots; router tests |
| Command-center hierarchy | 1 | 4 | 3 | Operational priority hierarchy too flat | Prompt 02/03/04 | Before/after screenshots; scorecard notes |
| Layout/grid/card system | 1 | 4 | 3 | Grid allows narrow/unusable composition; card hierarchy flat | Prompt 04 | Footprint tests; responsive screenshots |
| Surface composition | 2 | 4 | 2 | Core surfaces exist but visual hierarchy varies | Prompt 06/07/08 | Per-surface closeout evidence |
| State model | 2 | 4 | 2 | PccPreviewState exists; copy/state contract requires stronger standardization | Prompt 05 | State tests; state-copy screenshot evidence |
| Preview/read-only/degraded language | 1 | 4 | 3 | Developer-facing/no-live-data copy risk | Prompt 05 | Copy review matrix; screenshots |
| Interaction affordance | 1 | 4 | 3 | Disabled controls need reason/next action | Prompt 05/06/07/08 | Keyboard/interaction tests; screenshots |
| Accessibility and keyboard behavior | 0 | 4 | 4 | No confirmed PCC-specific axe/keyboard evidence located | Prompt 09; each prompt owns local checks | Axe/manual keyboard evidence |
| Responsive/container behavior | 1 | 4 | 3 | Footprint tests exist but browser/tenant fit not proven | Prompt 04/09 | Desktop/tablet/mobile screenshots |
| Typography/spacing/tokens/color | 1 | 4 | 3 | Doctrine compliance not evidenced; one-off drift risk | Prompt 04/06/07/08 | Diff review; visual evidence |
| Tenant validation | 0 | 4 | 4 | No Wave 15A tenant-hosted evidence found | Prompt 09 | Tenant URL/build/version/screenshots |
| Product confidence / flagship readiness | 1 | 4 | 3 | Cannot claim flagship readiness without closeout package | Prompt 09 | Signed scorecard; closeout; residual risk log |

## Hard-Stop Conditions

Any of the following blocks a 56/56 claim:

- No tenant-hosted SharePoint validation.
- No final screenshot evidence.
- No accessibility/keyboard validation.
- Generic unavailable/developer-facing placeholder states still dominate user-facing surfaces.
- Unexplained disabled controls remain on critical paths.
- Project context remains inconsistent across surfaces.
- Grid/card layout can still collapse into unusable narrow columns.
- Team & Access layout collapse remains unresolved.
- Control Center Settings governance ownership remains unclear.
- Site Health does not distinguish security/repair priority.
- Approvals and External Systems remain placeholder-only instead of preview-safe operational content.
- Tests/typecheck/build commands are not executed or fail.
- Closeout docs do not include exact files changed and residual issues.
