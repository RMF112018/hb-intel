# PCC Live Accessibility Issue Register

- Review support only.
- Expert review required.
- No final score is calculated.
- No hard stop is passed or failed.
- No EV is finally captured.
- No WCAG conformance result is claimed.
- No Phase 4 readiness is approved.

## How To Use This Register
- Use this register for localized triage and remediation planning.
- Verify each finding manually in source and live evidence context.
- Confirm remediation and rerun the relevant accessibility lane.
- Do not treat issue existence as an automated failure outcome.

- Run ID: accessibility-1778233149040
- Generated: 2026-05-08T09:39:25.607Z
- Total issue rows: 63
- Severity summary: major 41, moderate 20, review 2

## Issue Counts By Type
- axe-violation: 3
- aria-name-missing: 14
- disabled-reason-missing: 0
- focus-indicator-missing: 27
- contrast-needs-review: 11
- touch-target-size: 0
- hover-only-risk: 8
- reduced-motion-risk: 0
- dialog-focus-needs-review: 0

## approvals (Approvals)

### aria-name-missing

- ID: A11Y-ISSUE-0022
- Severity: moderate
- Selector: a:nth-of-type(28)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / a
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0021
- Severity: moderate
- Selector: input[role="combobox"]:nth-of-type(4)
- Rule: n/a
- Focus step: n/a
- Role/tag: combobox / input
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0023
- Severity: major
- Selector: n/a
- Rule: computed-contrast-heuristic
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Computed contrast heuristic is informational only.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0024
- Severity: major
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Confirm critical information or actions are not hover-exclusive.
- Recommended action: Provide non-hover access paths and rerun hover-risk observations.
- Artifact policy: operator-review-required; operator-review-required

## control-center-settings (Control Center Settings)

### aria-name-missing

- ID: A11Y-ISSUE-0056
- Severity: moderate
- Selector: a:nth-of-type(29)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / a
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0057
- Severity: moderate
- Selector: n/a
- Rule: computed-contrast-heuristic
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Computed contrast heuristic is informational only.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0058
- Severity: review
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Confirm critical information or actions are not hover-exclusive.
- Recommended action: Provide non-hover access paths and rerun hover-risk observations.
- Artifact policy: operator-review-required; operator-review-required

## documents (Documents)

### aria-name-missing

- ID: A11Y-ISSUE-0012
- Severity: moderate
- Selector: a:nth-of-type(24)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / a
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0011
- Severity: moderate
- Selector: input[role="combobox"]:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: combobox / input
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0013
- Severity: major
- Selector: n/a
- Rule: computed-contrast-heuristic
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Computed contrast heuristic is informational only.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0014
- Severity: major
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Confirm critical information or actions are not hover-exclusive.
- Recommended action: Provide non-hover access paths and rerun hover-risk observations.
- Artifact policy: operator-review-required; operator-review-required

## external-systems (External Platforms)

### aria-name-missing

- ID: A11Y-ISSUE-0026
- Severity: moderate
- Selector: a:nth-of-type(28)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / a
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0025
- Severity: moderate
- Selector: input[role="combobox"]:nth-of-type(4)
- Rule: n/a
- Focus step: n/a
- Role/tag: combobox / input
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

### focus-indicator-missing

- ID: A11Y-ISSUE-0027
- Severity: major
- Selector: div > header > div > button
- Rule: n/a
- Focus step: 1
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 114.84375x25; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0028
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 15
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1308x64; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0029
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 16
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1308x62; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0030
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 17
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1308x62; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0031
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 18
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1308x62; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0032
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 19
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0033
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 20
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0034
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 21
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0035
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 22
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x45; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0036
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 23
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x45; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0037
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 24
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x45; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0038
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 25
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0039
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 26
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0040
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 27
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0041
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 28
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0042
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 29
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0043
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 30
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0044
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 31
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0045
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 32
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0046
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 33
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0047
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 34
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0048
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 35
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0049
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 36
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0050
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 37
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0051
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 38
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0052
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 39
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0053
- Severity: major
- Selector: li > ul > li > button
- Rule: n/a
- Focus step: 40
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 1292x43; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0054
- Severity: major
- Selector: n/a
- Rule: computed-contrast-heuristic
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Computed contrast heuristic is informational only.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0055
- Severity: major
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Confirm critical information or actions are not hover-exclusive.
- Recommended action: Provide non-hover access paths and rerun hover-risk observations.
- Artifact policy: operator-review-required; operator-review-required

## project-home (Project Home)

### axe-violation

- ID: A11Y-ISSUE-0001
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 4 / serious / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Elements must meet minimum color contrast ratio thresholds
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

### aria-name-missing

- ID: A11Y-ISSUE-0003
- Severity: moderate
- Selector: a:nth-of-type(23)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / a
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0002
- Severity: moderate
- Selector: input[role="combobox"]:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: combobox / input
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0004
- Severity: major
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 4 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0005
- Severity: major
- Selector: n/a
- Rule: computed-contrast-heuristic
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Computed contrast heuristic is informational only.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0006
- Severity: major
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Confirm critical information or actions are not hover-exclusive.
- Recommended action: Provide non-hover access paths and rerun hover-risk observations.
- Artifact policy: operator-review-required; operator-review-required

## project-readiness (Project Readiness)

### axe-violation

- ID: A11Y-ISSUE-0015
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 11 / serious / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Elements must meet minimum color contrast ratio thresholds
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

### aria-name-missing

- ID: A11Y-ISSUE-0017
- Severity: moderate
- Selector: a:nth-of-type(28)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / a
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0016
- Severity: moderate
- Selector: input[role="combobox"]:nth-of-type(4)
- Rule: n/a
- Focus step: n/a
- Role/tag: combobox / input
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0018
- Severity: major
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 11 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0019
- Severity: major
- Selector: n/a
- Rule: computed-contrast-heuristic
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Computed contrast heuristic is informational only.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0020
- Severity: major
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Confirm critical information or actions are not hover-exclusive.
- Recommended action: Provide non-hover access paths and rerun hover-risk observations.
- Artifact policy: operator-review-required; operator-review-required

## site-health (Site Health)

### axe-violation

- ID: A11Y-ISSUE-0059
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 5 / serious / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Elements must meet minimum color contrast ratio thresholds
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

### aria-name-missing

- ID: A11Y-ISSUE-0060
- Severity: moderate
- Selector: a:nth-of-type(29)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / a
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0061
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 5 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0062
- Severity: moderate
- Selector: n/a
- Rule: computed-contrast-heuristic
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Computed contrast heuristic is informational only.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0063
- Severity: review
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Confirm critical information or actions are not hover-exclusive.
- Recommended action: Provide non-hover access paths and rerun hover-risk observations.
- Artifact policy: operator-review-required; operator-review-required

## team-and-access (Team & Access)

### aria-name-missing

- ID: A11Y-ISSUE-0008
- Severity: moderate
- Selector: a:nth-of-type(23)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / a
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0007
- Severity: moderate
- Selector: input[role="combobox"]:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: combobox / input
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-72, EV-74, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm interactive elements expose an accessible name and context-specific purpose.
- Recommended action: Add or correct accessible naming and rerun keyboard + accessibility evidence.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0009
- Severity: major
- Selector: n/a
- Rule: computed-contrast-heuristic
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Computed contrast heuristic is informational only.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0010
- Severity: major
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 0 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Confirm critical information or actions are not hover-exclusive.
- Recommended action: Provide non-hover access paths and rerun hover-risk observations.
- Artifact policy: operator-review-required; operator-review-required

## Reviewer Action Matrix
| Issue Type | Likely Owner / Reviewer | Suggested Action | Evidence Artifact To Check | Rerun Guidance | Review Status |
|---|---|---|---|---|---|
| axe-violation | Accessibility engineer + UI owner | Validate rule context and remediate markup/state | pcc-live-axe-summary.json | Rerun accessibility spec after fix | operator-review-required / expert-review-required |
| aria-name-missing | UI owner + accessibility reviewer | Add/repair accessible names | pcc-live-aria-label-summary.json | Rerun aria + keyboard checks | operator-review-required / expert-review-required |
| disabled-reason-missing | UI owner + UX/content reviewer | Provide disabled reason semantics | pcc-live-aria-label-summary.json | Rerun accessibility spec | operator-review-required / expert-review-required |
| focus-indicator-missing | UI owner + accessibility reviewer | Restore visible focus behavior | pcc-live-keyboard-focus-summary.json | Rerun keyboard focus checks | operator-review-required / expert-review-required |
| contrast-needs-review | Design system + accessibility reviewer | Validate and adjust contrast palette values | pcc-live-contrast-summary.json | Rerun contrast checks | operator-review-required / expert-review-required |
| touch-target-size | UI owner + field usability reviewer | Increase hit area/spacing | pcc-live-accessibility-evidence.json | Rerun touch-target checks | operator-review-required / expert-review-required |
| hover-only-risk | UI owner + UX reviewer | Add non-hover pathways | pcc-live-accessibility-evidence.json | Rerun hover checks | operator-review-required / expert-review-required |
| reduced-motion-risk | UI owner + accessibility reviewer | Respect reduced-motion preferences | pcc-live-accessibility-evidence.json | Rerun reduced-motion checks | operator-review-required / expert-review-required |
| dialog-focus-needs-review | UI owner + accessibility reviewer | Validate dialog trap/restore order | pcc-live-accessibility-evidence.json | Rerun dialog focus checks | operator-review-required / expert-review-required |

> Review support only. Expert review required. No final score is calculated. No hard stop is passed or failed. No EV is finally captured. No WCAG conformance result is claimed. No Phase 4 readiness is approved.
