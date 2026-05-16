# 12 — Acceptance Targets and Scorecard Recovery

## Current Audit Score

```text
28 / 56
```

## Flagship Recovery Target

```text
Target: 50 / 56
Minimum acceptable benchmark-grade threshold: 48 / 56
```

## Target Score Distribution

| Category | Current | Target | Recovery Basis |
|---|---:|---:|---|
| Doctrine and host compliance | 3 | 4 | Preserve host-safe posture and remove generic-card presentation failure. |
| UI-kit / premium-stack compliance | 1 | 3 | Use governed local composition and existing ui-kit exports where already available. |
| Token and styling discipline | 2 | 3 | Move Adobe-specific CSS local; avoid raw ad hoc sprawl; keep tokens central. |
| Purpose-fit sophistication and persona | 2 | 4 | Agreement Activity posture, visible status, authored summaries. |
| Surface composition and hierarchy | 1 | 4 | Remove sparse stretch, rebuild header, lists, states. |
| Homepage integration quality | 2 | 3 | Preserve companion relationship to My Projects, improve balance. |
| Breakpoint and shell-fit quality | 2 | 4 | Card-level responsive modes and compact behavior. |
| Interaction completeness | 2 | 4 | Proper switch semantics, Retry, explicit rows. |
| State-model completeness | 3 | 4 | Author visual state treatment, preserve state breadth. |
| Contract/data/backend seam rigor | 3 | 3 | Preserve current strong seams; use available data better. |
| Identity/media/attribution quality | 2 | 3 | Better sender/date metadata hierarchy. |
| Accessibility and keyboard behavior | 2 | 4 | Stable heading, manual activation switch, proven keyboard behavior. |
| Host-runtime resilience | 2 | 3 | Better hosted posture, evidence-backed noncollision/responsiveness. |
| Validation and closure proof | 1 | 4 | Closeout docs, hosted matrix, re-score. |

## Definition of Benchmark-Grade for This Module

The Adobe Sign module can be called flagship/benchmark-grade only when:

- it visually presents as a premium operational object rather than a generic card;
- empty, loading, degraded, and populated states all look authored;
- the card's height follows authored content and does not stretch into low-value white space;
- keyboard behavior is explicit and tested;
- the responsive posture is intentional across all supported modes;
- hosted proof exists;
- no data contract safety was compromised.

## Hard Stop Failures That Must Not Remain

- interactive content inside the card heading;
- accidental oversized empty card posture;
- repeated ugly missing-date text in completed rows;
- invisible or underpowered state communication;
- unproven keyboard semantics;
- absence of validation/evidence closeout.

## Acceptable Residual Risks

The following may remain only if documented clearly:

- no backend timestamp contract improvement in this package;
- hosted evidence pending because the agent lacks environment access;
- use of native semantic HTML/CSS where a preferred premium primitive is not already exported for My Dashboard without dependency changes.

## Required Closeout Verdict

Prompt 08 must state one of:

1. `Flagship remediation complete and evidence-backed.`
2. `Implementation complete; hosted acceptance evidence remains pending.`
3. `Do not close — residual doctrine gap remains.`

Do not use vague wording.
