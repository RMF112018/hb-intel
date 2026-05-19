# Prompt 05 — Security, CSP, Telemetry, and Test Hardening

## Objective

Harden the embedded Adobe Sign modal implementation for security, diagnostics, and regression coverage.


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

1. Review URL policy for:
   - HTTPS only,
   - Adobe approved origins only,
   - iframe eligibility,
   - fallback eligibility.
2. Confirm no tokens or full signing URLs are logged.
3. Add frontend telemetry events:
   ```text
   adobeSign.embedded.resolve.started
   adobeSign.embedded.resolve.result
   adobeSign.embedded.modal.opened
   adobeSign.embedded.frame.load.started
   adobeSign.embedded.frame.loaded
   adobeSign.embedded.frame.timeout
   adobeSign.embedded.message.received
   adobeSign.embedded.message.ignored
   adobeSign.embedded.terminal.detected
   adobeSign.embedded.fallback.presented
   adobeSign.embedded.fallback.opened
   adobeSign.embedded.refresh.started
   adobeSign.embedded.refresh.result
   adobeSign.embedded.modal.closed
   ```
4. Add backend telemetry if not already added:
   ```text
   adobeSign.actionLaunch.resolve.attempt
   adobeSign.actionLaunch.resolve.result
   adobeSign.actionLaunch.policy.result
   adobeSign.actionLaunch.provider.result
   adobeSign.actionLaunch.scope.result
   ```
5. Document required CSP updates.
6. Add or update Playwright tests for mocked embedded flow.

## Required Security Checklist

Confirm:

- no Adobe token in browser,
- no Adobe content proxy,
- no wildcard CSP,
- no wildcard postMessage origin,
- no signing URL durable storage,
- external fallback remains available,
- feature flag default is safe.

## Output

Provide:

- security closeout notes,
- CSP recommendation,
- telemetry event list,
- tests run,
- known live-validation dependencies.
