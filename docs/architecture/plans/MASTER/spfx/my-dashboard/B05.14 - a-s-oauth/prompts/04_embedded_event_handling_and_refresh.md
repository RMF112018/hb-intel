# Prompt 04 — Embedded Event Handling and Queue Refresh

## Objective

Implement validated Adobe embedded event handling and queue refresh behavior.


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

1. Create:
   ```text
   adobeSignEmbeddedEvents.ts
   useAdobeSignEmbeddedEvents.ts
   adobeSignEmbeddedTelemetry.ts
   ```
2. Listen for `window.message`.
3. Validate `event.origin` against backend-provided allowed origins.
4. Normalize Adobe events into internal event kinds.
5. Ignore invalid-origin events.
6. Telemetry-track unknown valid-origin events without breaking UX.
7. Treat terminal events as refresh triggers.
8. Refresh:
   - pending queue/home read model,
   - recent completions when applicable.
9. Add iframe load timeout behavior.
10. Present fallback when load timeout or embed failure occurs.

## Required Terminal Handling

Handle or safely classify:

- signing completed,
- approval completed,
- acceptance completed,
- acknowledgement completed,
- form filling completed,
- rejection,
- delegation,
- cancellation,
- session timeout,
- Adobe error.

If exact Adobe event names differ from the normalized assumptions, build the event parser to be tolerant and document the observed shape.

## Required Tests

- valid origin accepted,
- invalid origin ignored,
- terminal event triggers refresh,
- unknown event is non-breaking,
- iframe timeout presents fallback,
- refresh failure shows recoverable state.

## Output

Provide:

- event parser summary,
- refresh behavior summary,
- tests run,
- any Adobe event-shape assumptions requiring live validation.
