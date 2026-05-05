# 07 — Validation Evidence and 56 Scorecard Gates

## 1. Purpose

This file defines the validation evidence required to close Wave 15A with a 56/56 score.

## 2. Evidence Principle

A score without evidence is not accepted.

Every 4/4 category must include:

- source evidence,
- screenshot evidence,
- test or validation evidence,
- reviewer rationale,
- residual-risk statement.

## 3. Required Screenshot Matrix

Capture screenshots for each major surface:

- Project Home
- Team & Access
- Documents
- Project Readiness
- Approvals
- External Systems
- Control Center Settings
- Site Health

For each surface, capture:

| Mode / Width                                  | Required |
| --------------------------------------------- | -------- |
| SharePoint published mode — large desktop     | Yes      |
| SharePoint published mode — 1440px            | Yes      |
| SharePoint published mode — 1366px            | Yes      |
| SharePoint published mode — constrained width | Yes      |
| SharePoint edit mode                          | Yes      |
| Keyboard focus state                          | Yes      |
| Before screenshot                             | Yes      |
| After screenshot                              | Yes      |

## 4. Required Automated Tests

At minimum:

- Surface routing renders each surface.
- Active nav state is correct.
- Project context renders on every surface.
- State component renders all state variants.
- Disabled controls include explanation or alternative.
- Team & Access does not collapse to narrow-column layout.
- Grid/card span behavior is deterministic.
- No primary surface renders only a generic unavailable state.
- Accessibility checks pass if available in repo test tooling.
- Typecheck passes.
- Unit/component tests pass.
- Build passes.

## 5. Required Manual QA

Manual validation must include:

- Keyboard traversal through nav and primary content.
- Focus visibility.
- Button/link semantics.
- Disabled action comprehension.
- Color contrast review.
- No horizontal overflow.
- No clipped cards.
- No dead canvas caused by broken grid.
- Scroll ownership under SharePoint chrome.
- Published and edit-mode comparison.
- Surface purpose comprehension.

## 6. 56/56 Scorecard Closeout Table

Final closeout must include this table:

| Category                                  | Score | Evidence    | Reviewer Rationale |
| ----------------------------------------- | ----: | ----------- | ------------------ |
| Surface purpose and product clarity       |   4/4 | [link/path] | [rationale]        |
| Project context and operational hierarchy |   4/4 | [link/path] | [rationale]        |
| Information architecture / navigation     |   4/4 | [link/path] | [rationale]        |
| Shell / host fit                          |   4/4 | [link/path] | [rationale]        |
| Layout / grid composition                 |   4/4 | [link/path] | [rationale]        |
| Card hierarchy and density                |   4/4 | [link/path] | [rationale]        |
| Visual hierarchy / scan path              |   4/4 | [link/path] | [rationale]        |
| Typography / spacing / rhythm             |   4/4 | [link/path] | [rationale]        |
| Color / token discipline                  |   4/4 | [link/path] | [rationale]        |
| State model clarity                       |   4/4 | [link/path] | [rationale]        |
| Interaction affordance                    |   4/4 | [link/path] | [rationale]        |
| Accessibility / keyboard confidence       |   4/4 | [link/path] | [rationale]        |
| Responsive/container behavior             |   4/4 | [link/path] | [rationale]        |
| Product confidence / executive polish     |   4/4 | [link/path] | [rationale]        |

## 7. Hard-Stop Validation Failures

Wave 15A cannot close if any of the following remain:

- Any category below 4/4.
- Any surface unusable at supported widths.
- Team & Access narrow-column failure remains.
- Any primary surface dominated by generic unavailable state.
- Project context missing from any surface.
- Disabled controls lack explanation.
- User-facing diagnostic/build language dominates.
- Tenant screenshots are missing.
- Accessibility review is missing.
- Tests are failing.
- Closeout claims 56/56 without evidence.

## 8. Evidence Directory Recommendation

Recommended evidence placement:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/evidence/
```

Suggested subfolders:

```text
evidence/
  screenshots/
    before/
    after/
    tenant-published/
    tenant-edit-mode/
    keyboard-focus/
  tests/
  scorecards/
  accessibility/
  closeout/
```

## 9. Required Final Artifacts

- `Wave_15A_Final_Closeout.md`
- `Wave_15A_Final_56_Scorecard.md`
- `Wave_15A_Screenshot_Evidence_Index.md`
- `Wave_15A_Test_Evidence.md`
- `Wave_15A_Accessibility_Evidence.md`
- `Wave_15A_Phase_3_Closeout_Recommendation.md`
