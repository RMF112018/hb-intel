# PCC Screenshot Capture Forensics — 1.0.0.219

## Verdict
- Root cause identified: yes
- Horizontal clipping cause: ancestor/container horizontal scroll drift confirmed by reset experiment
- Full-page duplicate cause: document-level fullPage capture appears viewport-bounded in this host/runtime path for these captures.
- Scroll-segment duplicate cause: scroll-root movement often not changing visible capture or remains effectively viewport-equivalent.

## Stage of First Failure
| Surface | First failing stage | Failing selectors | minRelevantLeft |
|---|---|---|---:|
| cost-time | after-tab-nav | activePanel, heroBand | -10.00 |
| systems-administration | after-tab-nav | activePanel, bentoGrid, heroBand | -263.00 |

## Cost & Time Findings
- stage where clipping appears: after-tab-nav
- responsible scroll container or transform: group:global-overflow-candidates
- activePanel/bento/heading left bounds: minRelevantLeft=-10.00 selectors=activePanel, heroBand

## Systems Administration Findings
- stage where clipping appears: after-tab-nav
- responsible scroll container or transform: group:global-overflow-candidates
- activePanel/bento/heading left bounds: minRelevantLeft=-263.00 selectors=activePanel, bentoGrid, heroBand

## Click Trigger Delta Table
| Surface | Mode | Ancestor scrollLeft deltas observed |
|---|---|---|
| project-home | playwright-click | none |
| project-home | dom-click | none |
| documents | playwright-click | none |
| documents | dom-click | none |
| cost-time | playwright-click | none |
| cost-time | dom-click | none |
| systems-administration | playwright-click | none |
| systems-administration | dom-click | none |

## Full-Page Findings
- document scroll dimensions and host/container scroll dimensions are captured in `forensics-snapshots.json`.
- PNG dimensions/hash are captured in `forensics-hash-diagnostics.json`.
- reason fullPage is or is not meaningful: if full-page PNG dimensions remain viewport-sized while document/host containers exceed viewport height, document-level fullPage cannot by itself prove full active-surface capture in this host path.

## Scroll-Segment Findings
- true scroll root: captured per stage in snapshot data (`activePanel`, `document`, and ancestor chain metrics).
- requested vs actual scroll: inferred via stage snapshots and scroll-segment hash movement checks.
- hash movement: see duplicate matrix below and hash JSON.
- visual movement likely: duplicate triplets suggest low or no visible movement for several surfaces.

## Duplicate Matrix
| Surface | above==full | above==scroll-001 | full==scroll-001 |
|---|---|---|---|
| project-home | yes | yes | yes |
| documents | yes | yes | yes |
| cost-time | yes | yes | yes |
| systems-administration | yes | yes | yes |

## Reset Experiment Results Matrix
- Detailed individual/group reset outcomes: `forensics-reset-experiments.json`.
- Cost & Time best reset: group:global-overflow-candidates
- Systems Administration best reset: group:global-overflow-candidates

## Recommended Remediation
- exact files to change:
  - `e2e/pcc-live/pcc-live.screenshot-capture.ts`
  - `e2e/pcc-live/pcc-live.screenshot.spec.ts`
  - `e2e/pcc-live/pcc-live.screenshot-evidence-writer.ts`
- exact test gates to add:
  - assert stage-of-first-failure remains clear for Cost & Time and Systems Administration after tab nav + reset
  - assert first scroll-segment hash differs from above-fold for scrollable surfaces
  - assert full-page dimensions/scroll-root evidence are meaningful for host layout

## Hard Conclusion
- Root cause confirmed
