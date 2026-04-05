# Phase 04 Standards and Best Practices — Shell Extension Product (Lane B)

## Architecture standards

- Keep Lane B separate from Lane A in ownership, runtime seams, and documentation.
- Use supported SharePoint placeholder regions only.
- Treat the shell-extension lane as a real product lane with a narrow purpose, not as an ad hoc patch area.
- Preserve the three-lane model:
  - Lane A — homepage page-canvas product
  - Lane B — shell-extension product
  - Lane C — navigation/governance

## UI and interaction standards

- Use `@hbc/ui-kit/app-shell` as the primary visual entry point.
- Keep shell surfaces lighter and more restrained than homepage surfaces.
- Provide visible keyboard focus.
- Respect reduced-motion preferences.
- Use concise, utility-oriented shell content rather than large editorial compositions.
- Avoid over-animating or over-styling top/bottom placeholder content.

## SharePoint host standards

- Do not replace Microsoft shell chrome.
- Do not hide or suppress native shell elements.
- Do not rely on undocumented DOM anchors or CSS selectors.
- Do not assume placeholders always exist.
- Fail safely when host conditions are missing or unsupported.

## Testing standards

- Add structural tests for runtime seams and placeholder behavior.
- Add tests for safe failure when placeholders are absent.
- Add tests for import discipline where practical.
- Keep phase-level verification green:
  - typecheck
  - lint
  - build
  - test

## Documentation standards

- Update README files so they read as live product/runtime docs.
- Create boundary docs when a new lane becomes real.
- Record completion notes with:
  - status
  - what changed
  - files changed
  - verification results
  - intentional deferrals
- Make repo truth obvious to the next audit pass.

## Best-practice reminders for the code agent

- Do not reread files that are already in your active context unless something changed.
- Prefer the smallest possible supported SharePoint solution.
- Stabilize architecture first, then add visible surface behavior.
- Keep shell logic and homepage logic cleanly separated.
- Be explicit when deferring functionality to later phases.
