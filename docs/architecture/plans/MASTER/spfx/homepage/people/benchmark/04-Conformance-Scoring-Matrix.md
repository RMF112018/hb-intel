# 04 — Conformance Scoring Matrix

## Purpose

Use this matrix to score every homepage webpart against the Kudos public benchmark, with the two doctrine files treated as governing authority.

## Governing authority

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

A strong score does not excuse doctrine violations.

## Scoring scale

- **0** = absent / broken / non-credible
- **1** = weak / partial / materially below standard
- **2** = acceptable but clearly below benchmark
- **3** = strong / near-benchmark
- **4** = benchmark-grade or better for its purpose

## Pass threshold

### Minimum category rule
No category may score below **2** unless formally accepted as an exception.

### Overall rule
A homepage webpart should normally score:
- **32+ / 40** to close as homepage-grade
- **36+ / 40** for flagship surfaces

### Doctrine override rule
A webpart may not close as homepage-grade if it has material unresolved doctrine violations, even if the numeric score is otherwise passing.

## Matrix

| Category | Description | Score 0-4 | Notes |
|---|---|---:|---|
| Purpose-fit sophistication and persona expression | Premium, deliberate surface appropriate to the webpart’s mission and content persona |  |  |
| Interaction completeness | Full journey coverage, not a shallow display-only experience |  |  |
| Shared primitive discipline | Correct use of governed shared primitives and constrained entrypoints |  |  |
| Contract / data rigor | Explicit, testable, typed, repo-truth-based data handling |  |  |
| Backend seam quality | Correct source binding, refresh behavior, failure handling, runtime reliability |  |  |
| State orchestration | Clear view-state modeling and deterministic interaction flows |  |  |
| UX completeness | Loading, empty, error, success, detail, and no dead controls |  |  |
| Identity / media / attribution | Correct handling of people, media, and display attribution where applicable |  |  |
| Accessibility / host behavior | Keyboard/focus credibility, doctrine compliance, and SharePoint-hosted resilience |  |  |
| Validation / closure proof | Screenshots, runtime evidence, defects, and explicit pass/fail closure |  |  |

## Required written interpretation

After scoring, add these sections:

### Doctrine compliance
List any doctrine obligations that were validated or violated.

### Persona-fit strengths
List where the webpart expresses the correct persona while staying inside the HB design family.

### Strengths
List where the webpart meets or exceeds benchmark expectations.

### Gaps
List where the webpart materially trails the Kudos benchmark or drifts away from its proper persona.

### Required remediation
List the items that must be closed before acceptance.

### Accepted exceptions
List only the gaps that were deliberately and explicitly accepted.

## Enforcement rule

This scorecard is not advisory only.
It must drive the decision whether the webpart is allowed to close.

A visually cloned “same webpart, different name” outcome is not a passing result even if the surface appears polished.
