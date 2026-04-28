# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Wireframes and States

## A. Live Leadership Message State

```text
┌────────────────────────────────────────────────────────────────────┐
│ A MESSAGE FROM LEADERSHIP                         Current · Apr 2026│
│                                                                    │
│ Building the next chapter together                                 │
│ A concise summary explains the leadership theme and why employees   │
│ should open the full Foleon message.                               │
│                                                                    │
│ Optional real key message / pull quote only if governed metadata    │
│ exists.                                                            │
│                                                                    │
│ [Read the leadership message →]                                    │
│                                                                    │
│ Published Apr 12 · Companywide · Strategy                           │
└────────────────────────────────────────────────────────────────────┘
```

Rules:

- No full message body.
- No `Executive byline not provided`.
- No `Cadence`.
- CTA is visible and unambiguous.

## B. Preview / Sample State

```text
┌────────────────────────────────────────────────────────────────────┐
│ LEADERSHIP MESSAGE PREVIEW                         Preview only     │
│                                                                    │
│ Preview content shown for layout validation                         │
│ This placement will feature the current leadership message once a   │
│ Foleon item is selected and published.                              │
│                                                                    │
│ [Preview not available in production viewer]                        │
│                                                                    │
│ Configure the active Leadership Message in Foleon Manager.          │
└────────────────────────────────────────────────────────────────────┘
```

Rules:

- No sample person names.
- No sample quote.
- No sample audience.
- Preview state reads as admin/author validation, not fake content.

## C. No Live Message State

```text
┌────────────────────────────────────────────────────────────────────┐
│ A MESSAGE FROM LEADERSHIP                         No current message│
│                                                                    │
│ No leadership message is featured right now.                        │
│ A new message will appear here when it is published in Foleon.      │
│                                                                    │
│ [View previous messages]  (only if archive exists)                  │
└────────────────────────────────────────────────────────────────────┘
```

Rules:

- Calm, credible empty state.
- No implication of system failure.

## D. External-Open-Only State

```text
┌────────────────────────────────────────────────────────────────────┐
│ A MESSAGE FROM LEADERSHIP                         Opens in Foleon   │
│                                                                    │
│ Building the next chapter together                                  │
│ This leadership message is available as a Foleon experience.        │
│                                                                    │
│ [Open in Foleon ↗]                                                  │
│                                                                    │
│ This message opens in a new tab.                                    │
└────────────────────────────────────────────────────────────────────┘
```

Rules:

- Do not present as broken.
- Explain that new-tab behavior is expected.

## E. Blocked / Unavailable State

```text
┌────────────────────────────────────────────────────────────────────┐
│ A MESSAGE FROM LEADERSHIP                         Unavailable       │
│                                                                    │
│ Leadership message unavailable                                      │
│ The current message cannot be opened from HB Central right now.      │
│                                                                    │
│ [Open full message] disabled                                        │
│ Reason: This Foleon item is missing an approved viewer URL.          │
└────────────────────────────────────────────────────────────────────┘
```

Rules:

- Use clear, employee-safe reason.
- Keep structured refusal markers for diagnostics.
- Do not expose raw exception text.

## F. Mobile / Narrow State

```text
A MESSAGE FROM LEADERSHIP
Current · Apr 2026

Building the next chapter together

Short summary, max 2-3 lines.

[Read the leadership message]

Published Apr 12
```

Rules:

- Single column.
- CTA remains immediately after summary.
- Optional context collapses to one line or hides.
- No side-by-side media/identity rail.
- Touch target minimum 44 px.

## G. Full-Window Viewer Launch State

```text
[Full-window overlay]
Header:
  Leadership message
  Close button

Body:
  Foleon iframe or preview-safe local placeholder

Close:
  Return focus to the original CTA / launch button.
```

Rules:

- Preserve existing full-window viewer contract.
- Do not offset below SharePoint chrome.
- Maintain origin policy and iframe sandbox.
- ESC and close button return focus.
