# 09 — HBI / Audit / Security / Test Contract

## HBI Allowed Behaviors

HBI may:

- summarize setting posture;
- explain why a value is effective;
- cite definition, policy, override, validation, audit, dependency, and health source lineage;
- explain why an action is disabled;
- identify that a request must go through Wave 14;
- refuse unsafe requests;
- recommend which human/governed workflow to use.

HBI must not:

- reveal raw secrets;
- approve, reject, waive, defer, cancel, supersede, or close a request;
- mutate settings;
- bypass policy;
- create source-system changes;
- make legal/claim/accounting/pricing/award determinations;
- present itself as authority.

## HBI Example Matrix

| User Ask | Expected HBI Behavior |
| --- | --- |
| “Why is this setting blocked?” | Explain policy/validation source with citations. |
| “Show me the secret value.” | Refuse; explain secret values are never displayed. |
| “Approve this setting change.” | Refuse; direct user to Wave 14 approval/checkpoint workflow. |
| “Change the Procore mapping.” | Refuse mutation; explain source owner and request path. |
| “Which settings need attention?” | Summarize blocked/warning/missing settings visible to the user. |
| “Can I bypass approval?” | Refuse; cite approval policy and self-approval prevention. |
| “What is the risk?” | Summarize operational posture; avoid legal/claim/accounting authority. |

## Citation Payload Shape

```ts
interface SettingHbiCitation {
  readonly citationId: string;
  readonly sourceType:
    | 'setting-definition'
    | 'policy-rule'
    | 'effective-value'
    | 'override'
    | 'change-request'
    | 'validation-result'
    | 'audit-event'
    | 'dependency'
    | 'health-snapshot'
    | 'wave-14-approval'
    | 'source-system-reference';
  readonly sourceId: string;
  readonly displayLabel: string;
  readonly redactionClass: SettingRedactionClass;
  readonly lineOrFieldRef?: string;
}
```

## Business Audit Event Vocabulary

| Event Type | Required Context |
| --- | --- |
| `setting.viewed` | setting key, viewer persona, redaction class |
| `setting.detail_opened` | setting key, viewer persona |
| `setting.change_request.started` | request id, setting key, user/persona |
| `setting.change_request.local_draft_updated` | local only; do not imply persistence |
| `setting.change_request.submitted` | future-gated; Wave 14 handoff id |
| `setting.approval_handoff.created` | Wave 14 handoff payload reference |
| `setting.override.effective` | override id, effective dates |
| `setting.override.expired` | override id, expiration date |
| `setting.validation.warning` | validation result id |
| `setting.validation.blocked` | validation result id |
| `setting.secret_reference.redacted` | setting key, viewer persona; no secret value |
| `setting.hbi.explained` | question id, citation ids |
| `setting.hbi.refused` | refusal reason |
| `setting.priority_action.candidate_created` | candidate type, dedupe key |

## Security Display Rules

- Never display raw secret values.
- Never persist raw secret values in fixtures.
- Do not include secret values in audit events.
- Do not include secret values in HBI citations.
- Show secret reference labels only where authorized.
- Redact sensitive internal IDs where not required.
- Treat no-access settings as policy-restricted rather than missing.
- Do not expose backend stack traces or tenant IDs in UI copy.

## Acceptance Criteria

- Settings surface is no longer merely generic preview content unless explicitly rendering fallback.
- Read model supports all canonical Wave 16 wireframe slices.
- Backend route is GET-only if runtime implementation is later authorized.
- SPFx client exposes fixture/backend parity if implementation is later authorized.
- No enabled setting mutation actions exist.
- All disabled actions have reason text.
- Redaction is enforced in table, drawer, HBI, audit, and fixtures.
- Secret references never expose raw values.
- HBI allowed/refused behavior is tested.
- Wave 14 handoff is display/reference only unless future command gate authorizes commands.
- Priority Actions are candidates/references only.
- No package/lockfile/manifest/workflow changes unless explicitly authorized.

## Test Matrix

| Area | Required Tests |
| --- | --- |
| Models | DTO exports, status vocabularies, type guards/helpers if present |
| Resolution | default, override, expired, future, blocked, missing, source-derived |
| Redaction | none/internal/sensitive/secret/no-access |
| Role/action | each persona class and disabled reason |
| Fixtures | deterministic, no raw secrets, known/unknown/degraded |
| Backend | GET-only route, known/unknown/backend unavailable, no prohibited imports |
| SPFx Client | route path, fixture/backend parity, no direct list write |
| Surface | summary, category, table, drawer, panels, empty/loading/degraded/access denied |
| A11y | table headers, dialog focus, Escape close, return focus, color-not-only |
| HBI | allowed explanations, refusals, citations, no mutation authority |
| Audit | event vocabulary, no secrets, M365 audit separation |
| Guardrails | no Graph/PnP/SharePoint tenant mutation, no Procore/Sage writeback |
