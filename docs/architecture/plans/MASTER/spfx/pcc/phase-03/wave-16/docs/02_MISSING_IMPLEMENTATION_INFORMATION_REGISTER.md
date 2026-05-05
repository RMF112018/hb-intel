# 02 — Missing Implementation Information Register

## Critical Missing Information

| # | Missing Information | Why It Matters | Gap-Closure Output |
| ---: | --- | --- | --- |
| 1 | Runtime DTO/read-model contract | Current runtime model is too thin for Wave 16 | `ControlCenterSettingsReadModel` contract and submodel shapes |
| 2 | Fixture data strategy | UI/tests need deterministic realistic scenarios | fixture matrix and sample scenario definitions |
| 3 | Schema-to-model map | Prevents ad hoc field mapping | table mapping SharePoint fields to DTO fields |
| 4 | Role/action/redaction matrix | Required for visibility, disabled actions, and tests | persona/category/action matrix |
| 5 | Effective value algorithm | Prevents inconsistent override logic | deterministic algorithm and pure-helper test cases |
| 6 | Change request lifecycle | Prevents accidental command implementation | status model, local UX rules, future command payload |
| 7 | Wave 14 handoff | Required for approval/governance seam | approval/checkpoint handoff payload and routing rules |
| 8 | Priority Actions rules | Required for cross-surface signals | candidate types, severity, dedupe, suppression, resolution |
| 9 | UI component/state map | Prevents monolithic or generic settings page | component tree, state ownership, test hooks |
| 10 | UX copy catalog | Required for governance clarity | disabled/redacted/degraded/security/HBI copy |
| 11 | HBI examples | Required for no-authority/refusal enforcement | allowed/refused examples and citation payload |
| 12 | Audit vocabulary | Required for stable business audit semantics | event catalog and payload shape |
| 13 | Security/secret display contract | Prevents secret leakage | exact table/drawer/HBI/audit presentation rules |
| 14 | Acceptance criteria | Gives developer a Definition of Done | checkable implementation criteria |
| 15 | Test matrix | Prevents under-tested guardrails | behavior-to-test mapping |
| 16 | Dependency posture | Prevents unnecessary lockfile changes | explicit no-new-dependency default |
| 17 | Performance/list-scale posture | Prevents list threshold and scan issues | indexed-query and pagination/truncation guidance |
| 18 | Mobile behavior detail | Prevents weak responsive implementation | table-to-card, drawer-to-panel, sticky actions rules |

## Beneficial Additions

- File-by-file implementation map.
- Guardrail assertions by prompt.
- Data-state vocabulary for degraded/loading/empty/access-denied states.
- Cross-surface source-lineage rules.
- Reviewer checklist for implementation readiness.
