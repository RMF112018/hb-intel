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

- Run ID: accessibility-1778491269658
- Generated: 2026-05-11T09:21:24.684Z
- Total issue rows: 87
- Severity summary: major 43, moderate 30, review 14

## Issue Counts By Type
- axe-violation: 16
- aria-name-missing: 10
- disabled-reason-missing: 1
- focus-indicator-missing: 1
- contrast-needs-review: 16
- touch-target-size: 35
- hover-only-risk: 8
- reduced-motion-risk: 0
- dialog-focus-needs-review: 0

## core-tools (Core Tools)

### axe-violation

- ID: A11Y-ISSUE-0037
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

- ID: A11Y-ISSUE-0038
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 2 / serious / n/a
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

- ID: A11Y-ISSUE-0040
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

- ID: A11Y-ISSUE-0039
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

- ID: A11Y-ISSUE-0041
- Severity: major
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 2 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0042
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

- ID: A11Y-ISSUE-0043
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

## cost-time (Cost & Time)

### axe-violation

- ID: A11Y-ISSUE-0076
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

- ID: A11Y-ISSUE-0077
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 10 / serious / n/a
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

- ID: A11Y-ISSUE-0078
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

- ID: A11Y-ISSUE-0079
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 10 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0080
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

- ID: A11Y-ISSUE-0081
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

## documents (Document Control)

### axe-violation

- ID: A11Y-ISSUE-0044
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

- ID: A11Y-ISSUE-0045
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 3 / serious / n/a
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

- ID: A11Y-ISSUE-0046
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

- ID: A11Y-ISSUE-0047
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 3 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0048
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

- ID: A11Y-ISSUE-0049
- Severity: review
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

- ID: A11Y-ISSUE-0050
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

- ID: A11Y-ISSUE-0051
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

- ID: A11Y-ISSUE-0052
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

- ID: A11Y-ISSUE-0053
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

- ID: A11Y-ISSUE-0054
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

- ID: A11Y-ISSUE-0055
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

- ID: A11Y-ISSUE-0056
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

- ID: A11Y-ISSUE-0057
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

## estimating-preconstruction (Estimating & Preconstruction)

### axe-violation

- ID: A11Y-ISSUE-0058
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

- ID: A11Y-ISSUE-0059
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 7 / serious / n/a
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

- ID: A11Y-ISSUE-0061
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 7 / n/a / n/a
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

## project-controls (Project Controls)

### axe-violation

- ID: A11Y-ISSUE-0070
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

- ID: A11Y-ISSUE-0071
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 8 / serious / n/a
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

- ID: A11Y-ISSUE-0072
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

- ID: A11Y-ISSUE-0073
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 8 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0074
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

- ID: A11Y-ISSUE-0075
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
- Count/impact/status: 102 / serious / n/a
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
- Selector: button:nth-of-type(61)
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
- Focus step: 10
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
- Count/impact/status: 102 / n/a / n/a
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
- Measurements: bounds n/axn/a; target 141.765625x25
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
- Measurements: bounds n/axn/a; target 101.0625x19
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
- Measurements: bounds n/axn/a; target 56.328125x19
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
- Measurements: bounds n/axn/a; target 46.171875x19
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
- Measurements: bounds n/axn/a; target 55.328125x19
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
- Measurements: bounds n/axn/a; target 69.84375x19
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
- Measurements: bounds n/axn/a; target 69.875x19
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
- Measurements: bounds n/axn/a; target 101.0625x19
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
- Measurements: bounds n/axn/a; target 148.328125x25
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
- Measurements: bounds n/axn/a; target 119.875x25
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0027
- Severity: major
- Selector: button:nth-of-type(19)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 110.078125x25
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
- Measurements: bounds n/axn/a; target 208.890625x23
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0028
- Severity: major
- Selector: button:nth-of-type(20)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 169.890625x25
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0029
- Severity: major
- Selector: button:nth-of-type(21)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 149.75x25
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0030
- Severity: major
- Selector: button:nth-of-type(22)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 152.59375x25
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0031
- Severity: major
- Selector: button:nth-of-type(23)
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

- ID: A11Y-ISSUE-0032
- Severity: major
- Selector: button:nth-of-type(24)
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

- ID: A11Y-ISSUE-0033
- Severity: major
- Selector: button:nth-of-type(25)
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

- ID: A11Y-ISSUE-0034
- Severity: major
- Selector: button:nth-of-type(26)
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

- ID: A11Y-ISSUE-0035
- Severity: major
- Selector: button:nth-of-type(27)
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

- ID: A11Y-ISSUE-0011
- Severity: major
- Selector: button:nth-of-type(3)
- Rule: n/a
- Focus step: n/a
- Role/tag: n/a / button
- Count/impact/status: n/a / n/a / n/a
- Measurements: bounds n/axn/a; target 125.625x25
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
- Measurements: bounds n/axn/a; target 168.203125x25
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
- Measurements: bounds n/axn/a; target 56.328125x19
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
- Measurements: bounds n/axn/a; target 46.171875x19
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
- Measurements: bounds n/axn/a; target 55.328125x19
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
- Measurements: bounds n/axn/a; target 69.84375x19
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
- Measurements: bounds n/axn/a; target 69.875x19
- Touch target context: threshold 44px; lane accessibility
- Details: n/a
- EV refs: EV-79, EV-80, EV-82
- Pillar refs: P8
- Hard-stop refs: HS-07
- Review prompt: Verify touch target size supports field/tablet interaction reliability.
- Recommended action: Increase target dimensions/spacing and rerun touch-target observations.
- Artifact policy: operator-review-required; operator-review-required

### hover-only-risk

- ID: A11Y-ISSUE-0036
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

## startup-closeout (Project Startup & Closeout)

### axe-violation

- ID: A11Y-ISSUE-0064
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

- ID: A11Y-ISSUE-0065
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 12 / serious / n/a
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

- ID: A11Y-ISSUE-0066
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

- ID: A11Y-ISSUE-0067
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 12 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0068
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

- ID: A11Y-ISSUE-0069
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

## systems-administration (Systems Administration)

### axe-violation

- ID: A11Y-ISSUE-0082
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

- ID: A11Y-ISSUE-0083
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 8 / serious / n/a
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

- ID: A11Y-ISSUE-0084
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

- ID: A11Y-ISSUE-0085
- Severity: moderate
- Selector: n/a
- Rule: color-contrast
- Focus step: n/a
- Role/tag: n/a / n/a
- Count/impact/status: 8 / n/a / n/a
- Measurements: bounds n/axn/a; target n/axn/a
- Touch target context: threshold n/apx; lane n/a
- Details: Axe color-contrast summary. Operator review required.
- EV refs: EV-76, EV-77, EV-82
- Pillar refs: P4, P7, P8
- Hard-stop refs: HS-03, HS-05, HS-07, HS-08
- Review prompt: Manually validate contrast behavior on critical status and action surfaces.
- Recommended action: Adjust color/contrast palette values and rerun contrast-oriented accessibility checks.
- Artifact policy: operator-review-required; operator-review-required

- ID: A11Y-ISSUE-0086
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

- ID: A11Y-ISSUE-0087
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
