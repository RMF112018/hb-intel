# 16 — Testing and Acceptance Gates

## Documentation gates
Markdown formatting, JSON validation, file inventory, no lockfile/package/runtime mutation.

## Future runtime gates
- GET-only route.
- `readOnly: true` envelopes.
- Secret redaction.
- Role gating.
- Disabled action reason copy.
- Drawer focus behavior.
- Change request validation.
- Wave 14 approval handoff.
- Project override cannot bypass global policy.
- HBI refusal for unsafe setting actions.

## Acceptance question
For every setting, the docs must answer: what it is, who owns it, where it is stored, who can view/request/approve, whether it can be overridden, how it validates, what happens when degraded, what is audited, what is redacted, and what is prohibited.
