# 08 — State/Error Truthfulness Matrix (Prompt-02)

## Upload surface

| Surface state | Before | After | Bounded support details |
| --- | --- | --- | --- |
| Configuration/bootstrap failure | Often collapsed into generic upload/period failure text | Explicit configuration/bootstrap seam headline and corrective action | None unless backend command provides bounded fields |
| Auth failure | Blended with generic command failure text | Explicit backend auth seam failure text | `requestId` when available |
| Preview blocker (422) | Could appear as generic command error | Explicit preview-blocked seam message (`preview blocker`) | `requestId`, `failureClass`, `previewFailureClass` |
| Commit command failure | Generic “transport failed” framing | Explicit commit seam failure | `requestId`, `failureClass`, `previewFailureClass` when present |
| Read-side list failure | Mixed with upload command messaging | Explicit read-side list seam message | none by default |

## Review surface

| Surface state | Before | After | Bounded support details |
| --- | --- | --- | --- |
| Replay auth failure | Generic replay failure copy | Explicit replay auth seam messaging | `requestId` when available |
| Replay command failure | Generic replay failure copy | Explicit replay command seam failure | `requestId`, `failureClass`, `previewFailureClass` when present |
| Replay config/bootstrap failure | Generic failure fallback | Explicit hosted bootstrap/config seam messaging | none by default |
| Replay read-side list failure | Generic failure fallback | Explicit read-side list seam messaging | none by default |

## Outcome surface

| Terminal state | Before | After | Bounded support details |
| --- | --- | --- | --- |
| Non-committed terminal states | Authored state text, limited support context | Authored state text plus collapsed support details when curated fields exist | `requestId`, `failureClass`, `previewFailureClass` |
| Committed | Success framing | Unchanged success framing | no support disclosure unless bounded fields are present |

## Curation policy

- Support details are shown in collapsed disclosures by default.
- Only these fields are surfaced:
  - `requestId`
  - `failureClass`
  - `previewFailureClass`
- No raw backend payload/stack trace dumping on UI surfaces.
