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

- Run ID: accessibility-1778273044978
- Generated: 2026-05-08T20:44:23.360Z
- Total issue rows: 145
- Severity summary: major 77, moderate 55, review 13

## Issue Counts By Type
- axe-violation: 15
- aria-name-missing: 11
- disabled-reason-missing: 1
- focus-indicator-missing: 28
- contrast-needs-review: 15
- touch-target-size: 66
- hover-only-risk: 8
- reduced-motion-risk: 1
- dialog-focus-needs-review: 0

## approvals (Approvals)

### axe-violation

- ID: A11Y-ISSUE-0063
- Severity: review
- Selector: n/a
- Rule: aria-allowed-role
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / minor / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: ARIA role should be appropriate for the element
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0064
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

- ID: A11Y-ISSUE-0065
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

### contrast-needs-review

- ID: A11Y-ISSUE-0066
- Severity: moderate
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

- ID: A11Y-ISSUE-0067
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

### touch-target-size

- ID: A11Y-ISSUE-0068
- Severity: review
- Selector: button:nth-of-type(1)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 395.953125x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0077
- Severity: major
- Selector: button:nth-of-type(10)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 409.59375x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0078
- Severity: major
- Selector: button:nth-of-type(11)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 426.671875x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0079
- Severity: major
- Selector: button:nth-of-type(12)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 358x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0069
- Severity: major
- Selector: button:nth-of-type(2)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 420.515625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0070
- Severity: major
- Selector: button:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 382.140625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0071
- Severity: major
- Selector: button:nth-of-type(4)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 396.734375x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0072
- Severity: major
- Selector: button:nth-of-type(5)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 380.046875x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0073
- Severity: major
- Selector: button:nth-of-type(6)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 395.953125x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0074
- Severity: major
- Selector: button:nth-of-type(7)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 630x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0075
- Severity: major
- Selector: button:nth-of-type(8)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 407.859375x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0076
- Severity: major
- Selector: button:nth-of-type(9)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 387.25x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0080
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

### axe-violation

- ID: A11Y-ISSUE-0134
- Severity: review
- Selector: n/a
- Rule: aria-allowed-role
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / minor / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: ARIA role should be appropriate for the element
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0135
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

- ID: A11Y-ISSUE-0136
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

### contrast-needs-review

- ID: A11Y-ISSUE-0137
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

- ID: A11Y-ISSUE-0138
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

- ID: A11Y-ISSUE-0139
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

### axe-violation

- ID: A11Y-ISSUE-0040
- Severity: review
- Selector: n/a
- Rule: aria-allowed-role
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / minor / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: ARIA role should be appropriate for the element
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0041
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

- ID: A11Y-ISSUE-0043
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

- ID: A11Y-ISSUE-0042
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

- ID: A11Y-ISSUE-0044
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

- ID: A11Y-ISSUE-0045
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

### touch-target-size

- ID: A11Y-ISSUE-0046
- Severity: major
- Selector: button:nth-of-type(1)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 122.796875x29
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0047
- Severity: major
- Selector: button:nth-of-type(2)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 122.796875x29
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0048
- Severity: major
- Selector: button:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 122.796875x29
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0049
- Severity: major
- Selector: button:nth-of-type(4)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 177x29
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0050
- Severity: major
- Selector: button:nth-of-type(5)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 177x29
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0051
- Severity: major
- Selector: button:nth-of-type(6)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 177x29
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0052
- Severity: major
- Selector: button:nth-of-type(7)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 177x29
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0053
- Severity: major
- Selector: button:nth-of-type(8)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 177x29
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0054
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

### axe-violation

- ID: A11Y-ISSUE-0081
- Severity: review
- Selector: n/a
- Rule: aria-allowed-role
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / minor / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: ARIA role should be appropriate for the element
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0082
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

- ID: A11Y-ISSUE-0083
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

### focus-indicator-missing

- ID: A11Y-ISSUE-0084
- Severity: moderate
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

- ID: A11Y-ISSUE-0085
- Severity: moderate
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

- ID: A11Y-ISSUE-0086
- Severity: moderate
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

- ID: A11Y-ISSUE-0087
- Severity: moderate
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

- ID: A11Y-ISSUE-0088
- Severity: moderate
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

- ID: A11Y-ISSUE-0089
- Severity: moderate
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

- ID: A11Y-ISSUE-0090
- Severity: moderate
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

- ID: A11Y-ISSUE-0091
- Severity: moderate
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

- ID: A11Y-ISSUE-0092
- Severity: moderate
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

- ID: A11Y-ISSUE-0093
- Severity: moderate
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

- ID: A11Y-ISSUE-0094
- Severity: moderate
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

- ID: A11Y-ISSUE-0095
- Severity: moderate
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

- ID: A11Y-ISSUE-0096
- Severity: moderate
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

- ID: A11Y-ISSUE-0097
- Severity: moderate
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

- ID: A11Y-ISSUE-0098
- Severity: moderate
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

- ID: A11Y-ISSUE-0099
- Severity: moderate
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

- ID: A11Y-ISSUE-0100
- Severity: moderate
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

- ID: A11Y-ISSUE-0101
- Severity: moderate
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

- ID: A11Y-ISSUE-0102
- Severity: moderate
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

- ID: A11Y-ISSUE-0103
- Severity: moderate
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

- ID: A11Y-ISSUE-0104
- Severity: moderate
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

- ID: A11Y-ISSUE-0105
- Severity: moderate
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

- ID: A11Y-ISSUE-0106
- Severity: moderate
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

- ID: A11Y-ISSUE-0107
- Severity: moderate
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

- ID: A11Y-ISSUE-0108
- Severity: moderate
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

- ID: A11Y-ISSUE-0109
- Severity: moderate
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

- ID: A11Y-ISSUE-0110
- Severity: moderate
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

- ID: A11Y-ISSUE-0111
- Severity: moderate
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

- ID: A11Y-ISSUE-0112
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

### touch-target-size

- ID: A11Y-ISSUE-0113
- Severity: review
- Selector: button:nth-of-type(1)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 114.84375x25
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0122
- Severity: major
- Selector: button:nth-of-type(10)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 151.625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0123
- Severity: major
- Selector: button:nth-of-type(11)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 151.625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0124
- Severity: major
- Selector: button:nth-of-type(12)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 231.203125x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0125
- Severity: major
- Selector: button:nth-of-type(13)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 161.140625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0126
- Severity: major
- Selector: button:nth-of-type(14)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 159.21875x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0127
- Severity: major
- Selector: button:nth-of-type(19)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 1292x43
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0114
- Severity: major
- Selector: button:nth-of-type(2)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 151.625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0128
- Severity: major
- Selector: button:nth-of-type(20)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 1292x43
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0129
- Severity: major
- Selector: button:nth-of-type(21)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 1292x43
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0130
- Severity: major
- Selector: button:nth-of-type(25)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 1292x43
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0131
- Severity: major
- Selector: button:nth-of-type(26)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 1292x43
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0115
- Severity: major
- Selector: button:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 151.625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0116
- Severity: major
- Selector: button:nth-of-type(4)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 151.625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0117
- Severity: major
- Selector: button:nth-of-type(5)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 151.625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0118
- Severity: major
- Selector: button:nth-of-type(6)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 151.625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0119
- Severity: major
- Selector: button:nth-of-type(7)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 151.625x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0120
- Severity: major
- Selector: button:nth-of-type(8)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 260.28125x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0121
- Severity: major
- Selector: button:nth-of-type(9)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 260.28125x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0132
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

### reduced-motion-risk

- ID: A11Y-ISSUE-0133
- Severity: major
- Selector: n/a
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-78, EV-81, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Validate reduced-motion preferences are respected for animations and transitions.
- Recommended action: Honor reduced-motion settings for risky transitions and rerun reduced-motion checks.
- Artifact policy: operator-review-required; operator-review-required

## project-home (Project Home)

### axe-violation

- ID: A11Y-ISSUE-0001
- Severity: review
- Selector: n/a
- Rule: aria-allowed-role
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / minor / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: ARIA role should be appropriate for the element
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0002
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 95 / serious / n/a
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

- ID: A11Y-ISSUE-0004
- Severity: moderate
- Selector: a:nth-of-type(22)
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

- ID: A11Y-ISSUE-0003
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

### disabled-reason-missing

- ID: A11Y-ISSUE-0005
- Severity: major
- Selector: button:nth-of-type(52)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-74, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm disabled controls communicate a clear reason and recovery path to users.
- Recommended action: Provide disabled-reason semantics and rerun accessibility evidence capture.
- Artifact policy: operator-review-required; operator-review-required

### focus-indicator-missing

- ID: A11Y-ISSUE-0006
- Severity: major
- Selector: div > div > section > button
- Rule: n/a
- Focus step: 1
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds 208.890625x23; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: n/a
- EV refs: EV-73, EV-75, EV-78, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Confirm keyboard focus remains visible and unambiguous during navigation.
- Recommended action: Fix focus-visible styling/logic and rerun keyboard focus observations.
- Artifact policy: operator-review-required; operator-review-required

### contrast-needs-review

- ID: A11Y-ISSUE-0007
- Severity: major
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 95 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0008
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

### touch-target-size

- ID: A11Y-ISSUE-0009
- Severity: major
- Selector: button:nth-of-type(1)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 208.890625x23
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0018
- Severity: major
- Selector: button:nth-of-type(10)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 55.328125x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0019
- Severity: major
- Selector: button:nth-of-type(11)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 69.84375x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0020
- Severity: major
- Selector: button:nth-of-type(12)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 69.875x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0021
- Severity: major
- Selector: button:nth-of-type(13)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 101.0625x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0022
- Severity: major
- Selector: button:nth-of-type(14)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 264.90625x25.59375
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0023
- Severity: major
- Selector: button:nth-of-type(15)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 172.546875x25.59375
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0024
- Severity: major
- Selector: button:nth-of-type(16)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 244.578125x25.59375
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0025
- Severity: major
- Selector: button:nth-of-type(17)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 328.09375x25.59375
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0026
- Severity: major
- Selector: button:nth-of-type(18)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 202.203125x25.59375
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0010
- Severity: major
- Selector: button:nth-of-type(2)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 56.328125x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0011
- Severity: major
- Selector: button:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 46.171875x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0012
- Severity: major
- Selector: button:nth-of-type(4)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 55.328125x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0013
- Severity: major
- Selector: button:nth-of-type(5)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 69.84375x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0014
- Severity: major
- Selector: button:nth-of-type(6)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 69.875x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0015
- Severity: major
- Selector: button:nth-of-type(7)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 101.0625x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0016
- Severity: major
- Selector: button:nth-of-type(8)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 56.328125x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0017
- Severity: major
- Selector: button:nth-of-type(9)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 46.171875x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0027
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

- ID: A11Y-ISSUE-0055
- Severity: review
- Selector: n/a
- Rule: aria-allowed-role
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / minor / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: ARIA role should be appropriate for the element
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0056
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 146 / serious / n/a
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

- ID: A11Y-ISSUE-0057
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

### contrast-needs-review

- ID: A11Y-ISSUE-0058
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 146 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0059
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

### touch-target-size

- ID: A11Y-ISSUE-0060
- Severity: review
- Selector: button:nth-of-type(1)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 295.734375x20.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0061
- Severity: major
- Selector: button:nth-of-type(2)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 295.734375x20.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0062
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

- ID: A11Y-ISSUE-0140
- Severity: review
- Selector: n/a
- Rule: aria-allowed-role
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / minor / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: ARIA role should be appropriate for the element
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0141
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 40 / serious / n/a
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

- ID: A11Y-ISSUE-0142
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

### contrast-needs-review

- ID: A11Y-ISSUE-0143
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 40 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0144
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

- ID: A11Y-ISSUE-0145
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

### axe-violation

- ID: A11Y-ISSUE-0028
- Severity: review
- Selector: n/a
- Rule: aria-allowed-role
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 1 / minor / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: ARIA role should be appropriate for the element
- EV refs: EV-72, EV-73, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Review this summarized axe rule finding and validate impact and affected controls in context.
- Recommended action: Inspect related component markup/state and rerun the accessibility lane after remediation.
- Artifact policy: operator-review-required; operator-review-required

### aria-name-missing

- ID: A11Y-ISSUE-0030
- Severity: moderate
- Selector: a:nth-of-type(22)
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

- ID: A11Y-ISSUE-0029
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

- ID: A11Y-ISSUE-0031
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

### touch-target-size

- ID: A11Y-ISSUE-0032
- Severity: major
- Selector: button:nth-of-type(1)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 105x27
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0033
- Severity: major
- Selector: button:nth-of-type(2)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 212.15625x27
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0034
- Severity: major
- Selector: button:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 77.78125x27
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0035
- Severity: major
- Selector: button:nth-of-type(4)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 77.78125x27
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0036
- Severity: major
- Selector: button:nth-of-type(5)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 469.703125x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0037
- Severity: major
- Selector: button:nth-of-type(6)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 469.703125x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0038
- Severity: major
- Selector: button:nth-of-type(7)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 469.703125x28.390625
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0039
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
