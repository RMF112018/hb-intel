# 03 — Developer Decision Records to Capture

## Decisions That Must Be Made Explicit Before Runtime Work

| Decision ID | Decision | Required Output |
| --- | --- | --- |
| W16-DDR-001 | Composite vs granular settings route rollout | Confirm initial runtime implements one composite `GET /settings` route unless repo conventions require staged subroutes. |
| W16-DDR-002 | Existing `PccSettingsReadModel` upgrade vs bridge | Prefer smallest safe extension/bridge; prohibit parallel architecture. |
| W16-DDR-003 | Fixture-first vs backend opt-in | Preserve fixture-first SPFx posture unless existing PCC config enables backend opt-in. |
| W16-DDR-004 | Change request UX behavior | Confirm read-only/local UX only; no live submit unless future command gate authorizes it. |
| W16-DDR-005 | Role/action/redaction source | Confirm Team & Access/persona inputs are read-only source for visibility and disabled reasons. |
| W16-DDR-006 | HBI authority boundary | Confirm HBI explanation/citation/refusal only; no approval/mutation/recommendation-as-authority. |
| W16-DDR-007 | Secret reference presentation | Confirm reference-only display and redaction classes; no raw values. |
| W16-DDR-008 | Priority Actions authority | Confirm settings signals may generate candidates/references only; no automatic external execution. |
| W16-DDR-009 | Audit event scope | Confirm business audit is distinct from Microsoft 365/Purview/Entra audit. |
| W16-DDR-010 | Dependency posture | Confirm no new dependency by default; require separate authorization for package/lockfile changes. |
| W16-DDR-011 | Mobile table behavior | Confirm breakpoint where table becomes cards and drawer becomes full-screen panel. |
| W16-DDR-012 | Acceptance bar | Confirm tests required before implementation closeout. |

## Decision Record Format

Use this format in any new Wave 16 gap-closure decision doc:

```markdown
## W16-DDR-XXX — <Decision Title>

**Decision:** <clear final decision>

**Rationale:** <why this is the correct implementation posture>

**Repo-truth anchors:** <files inspected>

**Implementation effect:** <what developer should do>

**Prohibited interpretation:** <what must not be inferred>

**Test implications:** <tests required>
```
