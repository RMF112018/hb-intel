# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Copy and Content Rules

## Forbidden visible copy

Remove or prevent these strings from rendering in employee-facing production or preview:

- `Leadership Message reader`
- `Leadership Message Reader`
- `Sample executive byline`
- `Sample role`
- `Sample pull quote`
- `Sample message body`
- `Sample audience`
- `Cadence`
- `Archive group`
- `Preview layout`
- `This sample structure previews...`
- `Executive byline not provided.`

## Production copy replacements

| Current / bad copy | Replacement |
|---|---|
| `Leadership Message reader` | actual Foleon title or `A message from leadership` |
| `Leadership Message Reader` | `A message from leadership` |
| `Preview layout` | `Preview only` or `Preview content` |
| `Sample executive byline` | omit |
| `Sample role` | omit |
| `Sample pull quote...` | omit unless real `pullQuote` exists |
| `Sample message body...` | `Preview content shown for layout validation only.` |
| `Sample audience` | omit |
| `Cadence` | omit |
| `Archive group` | omit |
| `Executive byline not provided.` | omit or `From leadership` if governed |

## CTA copy rules

| Condition | CTA copy |
|---|---|
| live and no video indicator | `Read the leadership message` |
| live and unknown content mode | `Open full message` |
| live with video/rich-media indicator | `Watch the message` |
| external-only | `Open in Foleon` |
| preview-only | disabled/no primary CTA; supporting copy says `Preview content shown for layout validation only.` |
| no live message | optional `View previous messages` only if archive exists |
| blocked | disabled CTA label reflects target action, reason text explains why unavailable |

## State copy

### Live

- Header: `A message from leadership`
- State: `Current`
- Summary fallback if missing: omit summary rather than inventing one.
- CTA: `Read the leadership message`

### Preview

- Header: `Leadership message preview`
- State: `Preview only`
- Body: `Preview content shown for layout validation only. A live leadership message will appear here when a Foleon item is selected and published.`
- CTA: no production CTA.

### No live message

- Header: `A message from leadership`
- State: `No current message`
- Body: `No leadership message is featured right now. A new message will appear here when it is published in Foleon.`

### External-open-only

- Header: `A message from leadership`
- State: `Opens in Foleon`
- CTA: `Open in Foleon`
- Helper: `This message opens in a new tab.`

### Blocked / unavailable

- Header: `A message from leadership`
- State: `Unavailable`
- Body: `The current leadership message cannot be opened from HB Central right now.`
- Reason examples:
  - `This Foleon item is missing an approved viewer URL.`
  - `This Foleon item cannot open in the embedded viewer.`
  - `This Foleon item requires a new-tab experience.`

## Tone

- Executive-grade.
- Calm.
- Direct.
- Employee-facing.
- No implementation terms.
- No apologetic filler.
- No “coming soon” unless it is a controlled empty state.
