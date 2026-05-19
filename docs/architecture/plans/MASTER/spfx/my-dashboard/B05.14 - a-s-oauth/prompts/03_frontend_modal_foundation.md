# Prompt 03 — Frontend Embedded Modal Foundation

## Objective

Implement the borderless floating Adobe Sign modal shell behind a feature flag.


General execution rules for the local code agent:

- Work from current repo truth only.
- Do not assume prior plans are current if code differs.
- Do not re-read files that are still within your current context or memory.
- Do not implement unsupported Adobe behavior.
- Do not create a custom signing UI.
- Do not proxy Adobe signing content.
- Preserve existing behavior when the embedded feature flag is disabled.
- Keep changes incremental, testable, and reversible.
- Provide concise commit summaries and validation evidence after each prompt.


## Required Work

1. Add frontend API client method for the new action launch route.
2. Add fixture/test implementation.
3. Add runtime feature flag:
   ```text
   MY_DASHBOARD_ADOBE_SIGN_EMBEDDED_ACTIONS_ENABLED
   ```
4. Modify `AdobeSignActionQueueCard` so:
   - flag off = existing external behavior,
   - flag on = embedded launch flow.
5. Create modal files:
   ```text
   AdobeSignEmbeddedActionModal.tsx
   AdobeSignEmbeddedActionModal.module.css
   useAdobeSignEmbeddedAction.ts
   ```
6. Implement modal visual design:
   - borderless,
   - full-window overlay,
   - translucent gray backdrop,
   - blurred My Dashboard background,
   - floating Adobe document,
   - minimal header,
   - iframe body,
   - fallback external launch action.

## Required UX Behavior

- Do not close on backdrop click while action is active.
- Escape should trigger close confirmation if no terminal event has occurred.
- Focus must return to originating `Act Now` button.
- Body scroll must lock while modal is open.
- Modal should support desktop, tablet, and mobile layouts.

## Required Tests

- Modal renders with embedded-ready response.
- Backdrop and iframe render.
- Feature flag off preserves old external behavior.
- Close confirmation appears when active.
- Focus restoration works.

## Output

Provide:

- files changed,
- screenshots if available,
- tests run,
- any CSS/layout caveats.
