# Prompt 06 — Live Tenant Validation and Closeout

## Objective

Validate the embedded Adobe Sign modal in a controlled live tenant environment and prepare closeout documentation.


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


## Prerequisites

- Feature flag deployed but disabled by default.
- Updated Adobe OAuth scopes configured.
- Test user reconnected to Adobe Sign after scope update.
- Test agreement assigned to authenticated user.

## Validation Steps

1. Confirm flag off preserves current external behavior.
2. Enable embedded flag in controlled environment.
3. Load My Dashboard.
4. Confirm pending Adobe Sign action appears.
5. Click `Act Now`.
6. Confirm modal opens:
   - borderless,
   - full-window overlay,
   - grey/blurred My Dashboard background,
   - Adobe document floating above page.
7. Confirm iframe loads or fallback appears.
8. Complete Adobe Sign action if iframe works.
9. Confirm terminal event handling or fallback path.
10. Confirm queue refresh.
11. Confirm item leaves pending queue.
12. Confirm item appears in recent completions.
13. Repeat for approval/acknowledgement/form-fill if available.
14. Test session timeout.
15. Test modal close before completion.
16. Test mobile/tablet breakpoint.

## Required Evidence

Capture:

- before screenshot,
- modal screenshot,
- completion screenshot,
- queue refreshed screenshot,
- recent completion screenshot,
- telemetry query results,
- test command output.

## Closeout Deliverable

Produce:

1. implementation summary,
2. files changed,
3. validated behavior,
4. tenant configuration required,
5. known limitations,
6. production enablement recommendation,
7. rollback plan.
