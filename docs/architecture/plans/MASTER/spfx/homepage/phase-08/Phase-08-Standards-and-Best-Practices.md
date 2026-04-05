# Phase 08 Standards and Best Practices

## Accessibility baseline

- Target WCAG 2.1 AA for relevant page-canvas and placeholder surfaces.
- Treat visible focus, readable contrast, semantic landmarks, and keyboard reachability as non-negotiable.
- Prefer explicit labeling and stable structure over clever styling.

## QA posture

- Verify both composed and independent rendering paths where relevant.
- Distinguish clearly between structural verification, browser verification, and inferred assistive-technology behavior.
- Record exact evidence for any release-blocking finding.

## SharePoint-specific discipline

- Respect host-controlled layout and navigation.
- Do not solve usability issues by introducing unsupported host overrides.
- Keep Lane A, Lane B, and Lane C boundaries intact.

## Regression discipline

- Add tests only where they materially protect against recurrence.
- Do not bloat the suite with redundant assertions that restate existing structural tests.
- Preserve bundle-budget posture while making fixes.

## Release discipline

- Tie the release decision to evidence, not optimism.
- Keep the rollout playbook practical for administrators and deployment owners.
- Favor explicit smoke checks and rollback conditions over generic “monitor closely” language.
