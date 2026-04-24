# Prompt 04 — Homepage Launcher, UX/A11y, and Release Gates

## Objective

Complete HB Central discoverability, UX integrity, accessibility, and release gates for the Foleon app.

## Governing Authorities

- HB Central homepage/SPFx UI doctrine and benchmark docs
- Microsoft iframe performance guidance
- W3C/WAI iframe and focus guidance
- Existing `@hbc/homepage-launcher` patterns

## Files / Seams to Inspect

- Highlights route
- Content Hub route
- `@hbc/homepage-launcher` registration seam
- route/deep-link handling
- E2E tests
- README/release runbook

## Current Gap

Launcher registration is deferred and UI/a11y states were not inspectable. Even if the app functions, it cannot be broadly released without governed discoverability and supportable states.

## Required Implementation Outcome

- Add or explicitly defer launcher registration with release-scope rationale.
- Prove no iframe appears in homepage/highlights cards.
- Add loading, empty, suppressed, expired, invalid-origin, external-only, and config-error states.
- Ensure keyboard navigation, focus order, link semantics, and iframe titles are covered.
- Add route/deep-link tests for highlights, Reader, and Hub.
- Add release checklist tying repo truth, package truth, runtime truth, list truth, and tenant config truth together.

## Proof of Closure

- E2E test output.
- Accessibility checklist output.
- DOM proof that Highlights route contains no iframe.
- Launcher registration proof or documented exception.
- Release runbook committed.

## Non-Negotiable Instructions for the Local Code Agent

- Use the live repo's `main` branch as the source of truth unless the prompt explicitly tells you to investigate an unmerged branch/commit.
- Do not protect weak patterns because the UI renders, the package builds, or prior summaries said the MVP landed.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes outside the stated Foleon scope.
- Provide proof of closure with exact commands, files changed, and artifacts generated.
- If repo truth contradicts this prompt, stop and report the contradiction clearly before changing code.
