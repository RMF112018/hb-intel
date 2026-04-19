# 07 — Proof Plan and Hosted Validation Matrix

## Proof objective
Make it difficult for a screenshot-class host-fit defect to survive or silently return.

## Required proof layers
### Layer 1 — Structural proof
Verify:
- wrapper/shell ownership is preserved
- shared outer fit contract exists
- rail remains outside shell semantics

### Layer 2 — Measurement proof
Verify:
- authoritative width source is defined
- usable width accounting is inspectable
- entry-state selection changes correctly at key thresholds

### Layer 3 — Layout proof
Verify:
- `resolveBandLayout` receives the corrected width truth
- pair-vs-stack decisions remain stable around thresholds
- first-lane logic still works after the measurement correction

### Layer 4 — Hosted visual proof
Verify:
- no right-edge overflow at standard laptop width
- stable layout at tablet landscape
- stable single-column behavior at tablet portrait
- stable narrow behavior at phone portrait equivalent
- stable compact behavior in short-height state when available

## Minimum validation matrix
| Case | Target | What must be shown |
|---|---|---|
| Standard laptop baseline | ~1180–1400 usable width equivalent | No right-edge overflow; first lane begins cleanly; diagnostics truthful |
| Ultrawide desktop | 1600+ usable width equivalent | Premium wide composition without dead-canvas drift |
| Tablet landscape | ~980–1179 usable width equivalent | Correct simplified/stacked behavior where slot comfort requires it |
| Tablet portrait | ~720–979 usable width equivalent | Disciplined single-column entry behavior |
| Phone portrait / narrow equivalent | ~320–719 width equivalent | Immediate narrow layout without horizontal stress |
| Short-height constrained | height below threshold with sufficient width | Compact-banner/short-height posture if harness supports it |

## Preferred tooling posture
Use the narrowest practical mix of:
- unit tests for width/accounting and threshold logic
- component/integration tests for wrapper/shell attributes and no-overflow conditions
- Playwright or equivalent hosted visual checks for desktop/tablet/mobile states

## Closure report template
The final implementation report should include:
1. authoritative outer fit contract now in force
2. usable-width computation method
3. files changed and why
4. diagnostics added or updated
5. tests added or updated
6. hosted validation cases executed
7. explicit statement that the original defect class is no longer reproducible
8. tightly bounded residual risks, if any
