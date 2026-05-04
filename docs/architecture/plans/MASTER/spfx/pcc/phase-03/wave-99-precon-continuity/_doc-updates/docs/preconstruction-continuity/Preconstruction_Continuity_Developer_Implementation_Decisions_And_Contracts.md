# Preconstruction Continuity Developer Implementation Decisions And Contracts

## Purpose

Define developer-ready decisions for future implementation while this package remains documentation-only.

## Bounded Context

| Context | Owns | Reads | Future Writes | Never Touches |
|---|---|---|---|---|
| Preconstruction Continuity | projection contracts, memory contributions, traceability candidates, readiness signals | source templates, source records, unified lifecycle contracts | docs/reference JSONs now; future PCC-native records after gate | source-system mutation |
| Go / No-Go Carry-Forward | PCC projection of final GO decision | source-owned decision | projection supersession after source-backed change | original decision workflow |
| Estimating Kickoff | future PCC-native workflow | source workbook mapping | future kickoff records after implementation gate | staffing commitments |
| Project Memory | durable summaries and decisions | preconstruction continuity records | memory records after gate | source-owned raw records |
| HBI | grounded/refusal answer contract | eligible evidence only | query/audit records after future gate | source-of-truth decisions |

## Route Contract

No new shell route is authorized.

Forbidden route/workspace IDs include:

- `preconstruction-continuity`
- `go-no-go`
- `go-nogo`
- `estimating-kickoff`
- `pursuit-workspace`
- `bd-workspace`
- `preconstruction-workspace`
- `project-memory`
- `unified-search`
- `ask-hbi`

Allowed display locations:

- Project Home cards;
- Project Readiness region/module;
- Executive Oversight drill-in;
- Document Control evidence links;
- Priority Actions candidate rail;
- HBI/Ask-HBI panel when already approved by unified lifecycle route/posture;
- future Lessons Learned / Post-Bid Autopsy.

## Field-Level Contract

Every field must be classified as:

- source-owned;
- PCC-native;
- PCC-derived;
- evidence-link;
- display-only;
- computed summary;
- HBI-eligible;
- HBI-blocked;
- cross-project reusable;
- cross-project blocked.

## Visibility Contract

All records must resolve to one of:

- `full`
- `summary-safe`
- `masked`
- `withheld`
- `refusal`
- `degraded`

## Audit Events

Required future audit families:

- `preconstruction.source_link_opened`
- `preconstruction.carry_forward_viewed`
- `preconstruction.redaction_applied`
- `preconstruction.memory_record_created`
- `preconstruction.traceability_edge_created`
- `preconstruction.priority_action_candidate_created`
- `preconstruction.hbi_query_submitted`
- `preconstruction.hbi_refusal_generated`
- `preconstruction.handoff_readiness_changed`
- `preconstruction.evidence_link_added`

## HBI Contract

Grounded HBI output requires:

- at least one visible citation;
- source lineage;
- source system/record ID;
- permission-filtered evidence;
- no source-of-truth language.

Refusal is required when:

- evidence is insufficient;
- source is unavailable/stale beyond safe use;
- required citations are withheld;
- cross-project use is unauthorized;
- answer would expose restricted pursuit/strategy/margin/executive content;
- answer would imply legal/accounting/profit guarantee.

## Test Contract For Future Runtime

Future implementation must test:

- no forbidden routes;
- no external imports/runtime calls;
- redaction and withheld behavior;
- HBI refusal and citation behavior;
- state transition validity;
- source-lineage required;
- priority-action dedupe keys;
- Project Memory contribution safety;
- no workbook mutation;
- no source-system mutation;
- no lockfile change unless authorized.
