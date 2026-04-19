# Prompt-07 Black-Box Validation Matrix

## Purpose
This matrix defines closure evidence for the hb homepage wrapper + launcher + shell as a black-box host-fit system. Evidence is based on semantic diagnostics and stable `data-*` attributes, not incidental markup snapshots.

## Validation Contract
- Shell conformance contract: `data-shell-blackbox-contract="prompt07-blackbox-v1"`
- Launcher contract: `data-hbc-launcher-blackbox-contract="prompt07-blackbox-v1"`
- Wrapper seam contract: `data-hb-homepage-blackbox-contract="prompt07-blackbox-v1"`

## Matrix
| Category | Required Evidence | Representative State/Width | Evidence Source |
| --- | --- | --- | --- |
| Launcher-shell entry alignment | Shared entry authority and matching entry-state seam are verifiable | standard laptop and tablet | `hbHomepageEntryStack.test.tsx`, `hbHomepageLauncherBand.test.tsx` |
| Pairing safeguard | Invalid pairings are prevented or surfaced through deterministic diagnostics/conformance counters | all matrix classes | `shellValidation.test.ts`, `shellHarness.test.ts`, `shellClosureProof.test.ts` |
| Reflow safety | Constrained and short-height states remain governed and diagnosable | phone-landscape and constrained-reflow | `shellHarness.test.ts`, `shellClosureProof.test.ts` |
| No ordinary-content overflow | Width accounting remains deductive and bounded against authoritative width | standard-laptop and expanded ultrawide | `useShellContainer.test.ts`, `shellClosureProof.test.ts` |
| Degraded-state coverage | Core width classes plus degraded states are explicitly exercised | ultrawide, laptop, tablet, phone, short-height | `shellHarness.test.ts`, `shellClosureProof.test.ts` |

## Rendered Output Verification
- Automated assertions use harness/conformance outputs and `data-*` attributes.
- Semi-automated visual checks should capture the canonical shell matrix widths from `SHELL_BREAKPOINT_MATRIX` and compare against the same conformance attributes in test logs.
- If a visual capture appears acceptable but conformance attributes fail, the run is not closure-ready.

## Closure Gate
Prompt-07 is considered closed only when:
1. this matrix remains present and current,
2. targeted tests pass for core/degraded states,
3. no-overflow and no-bad-reflow checks are explicit,
4. launcher-shell alignment is inspectable at runtime,
5. evidence includes concrete test results, not confidence-only statements.
