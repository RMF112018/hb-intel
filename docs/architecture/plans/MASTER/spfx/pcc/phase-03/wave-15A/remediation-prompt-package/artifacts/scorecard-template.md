# PCC Wave 15A Scorecard Template

## Scoring Rule

- 14 categories.
- 0-4 points each.
- 56 maximum.
- Final 56/56 requires evidence for every score.
- Scores above 2 require screenshot/test evidence.
- Final 56/56 requires tenant-hosted evidence and accessibility/keyboard validation.

| Category                                | Current Score | Target Score | Gap | Confirmed Issues                                                              | Required Remediation                     | Evidence Required                                          | Covered By Prompt |
| --------------------------------------- | ------------- | ------------ | --- | ----------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- | ----------------- |
| Shell and host fit                      | 1             | 4            | 3   | Shell dominance; SharePoint frame fit not evidence-backed                     | Prompt 02                                | Screenshots at hosted and local widths; host runtime notes |
| Project context                         | 1             | 4            | 3   | Project identity/status/context inconsistent across surfaces                  | Prompt 03                                | Header/context screenshot matrix; component tests          |
| Navigation / IA                         | 1             | 4            | 3   | Module list may not communicate workflow/status/urgency                       | Prompt 02                                | Nav behavior screenshots; router tests                     |
| Command-center hierarchy                | 1             | 4            | 3   | Operational priority hierarchy too flat                                       | Prompt 02/03/04                          | Before/after screenshots; scorecard notes                  |
| Layout/grid/card system                 | 1             | 4            | 3   | Grid allows narrow/unusable composition; card hierarchy flat                  | Prompt 04                                | Footprint tests; responsive screenshots                    |
| Surface composition                     | 2             | 4            | 2   | Core surfaces exist but visual hierarchy varies                               | Prompt 06/07/08                          | Per-surface closeout evidence                              |
| State model                             | 2             | 4            | 2   | PccPreviewState exists; copy/state contract requires stronger standardization | Prompt 05                                | State tests; state-copy screenshot evidence                |
| Preview/read-only/degraded language     | 1             | 4            | 3   | Developer-facing/no-live-data copy risk                                       | Prompt 05                                | Copy review matrix; screenshots                            |
| Interaction affordance                  | 1             | 4            | 3   | Disabled controls need reason/next action                                     | Prompt 05/06/07/08                       | Keyboard/interaction tests; screenshots                    |
| Accessibility and keyboard behavior     | 0             | 4            | 4   | No confirmed PCC-specific axe/keyboard evidence located                       | Prompt 09; each prompt owns local checks | Axe/manual keyboard evidence                               |
| Responsive/container behavior           | 1             | 4            | 3   | Footprint tests exist but browser/tenant fit not proven                       | Prompt 04/09                             | Desktop/tablet/mobile screenshots                          |
| Typography/spacing/tokens/color         | 1             | 4            | 3   | Doctrine compliance not evidenced; one-off drift risk                         | Prompt 04/06/07/08                       | Diff review; visual evidence                               |
| Tenant validation                       | 0             | 4            | 4   | No Wave 15A tenant-hosted evidence found                                      | Prompt 09                                | Tenant URL/build/version/screenshots                       |
| Product confidence / flagship readiness | 1             | 4            | 3   | Cannot claim flagship readiness without closeout package                      | Prompt 09                                | Signed scorecard; closeout; residual risk log              |

## Evidence Links

| Category                                | Evidence File(s) | Reviewer Notes |
| --------------------------------------- | ---------------- | -------------- |
| Shell and host fit                      |                  |                |
| Project context                         |                  |                |
| Navigation / IA                         |                  |                |
| Command-center hierarchy                |                  |                |
| Layout/grid/card system                 |                  |                |
| Surface composition                     |                  |                |
| State model                             |                  |                |
| Preview/read-only/degraded language     |                  |                |
| Interaction affordance                  |                  |                |
| Accessibility and keyboard behavior     |                  |                |
| Responsive/container behavior           |                  |                |
| Typography/spacing/tokens/color         |                  |                |
| Tenant validation                       |                  |                |
| Product confidence / flagship readiness |                  |                |
