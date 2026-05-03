# PCC Bounded Context And Ownership Map

## Purpose

Define the implementation ownership map for PCC unified lifecycle features. This document prevents developers from guessing which surface, context, or system owns a record or behavior.

## Canonical Rules

- PCC shell surfaces own navigation and presentation, not source records.
- PCC modules own PCC-native workflow state only.
- Source systems retain source-owned records.
- PCC-derived records summarize/connect/cite; they do not become source truth.
- HBI reads only permission-filtered, citation-eligible records.

## Bounded Context Table

| Context           | Owns                                                                       | Reads                                                                                         | Future Writes                                          | Never Touches                                      |
| ----------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| Project Home      | command center composition, summary card placement, Ask-HBI placement      | project profile, priority actions, document control, site health, unified lifecycle aggregate | user preferences after settings gate                   | source-system mutation, departmental routes        |
| Project Readiness | readiness rollups, make-ready surface, source-health display               | lifecycle readiness, permits, responsibility, constraints, buyout, unified lifecycle          | PCC-native readiness item state after workflow gate    | Procore/Sage writes, scheduler mutation            |
| Project Memory    | memory records, decision records, assumption records, memory lineage index | source-owned records with permission, PCC-native workflow records                             | PCC-native memory records after persistence/audit gate | source-owned raw records, privileged summarization |
| Traceability      | traceability edges, confidence, related record clusters                    | estimate/scope/commitment/submittal/field/closeout/warranty records                           | PCC-native trace edges after evidence gate             | source ownership, automatic liability conclusions  |
| HBI Search        | grounded/refusal response contract, citation rendering, refusal taxonomy   | eligible evidence, memory, trace edges, source lineage                                        | query audit records after AI governance gate           | live LLM/vector before gate, uncited answers       |
| Team & Access     | access request posture, roster, permission workflow later                  | project team/member/access records                                                            | access requests/execution after admin gate             | direct SPFx Graph mutation                         |
| External Systems  | launch registry, mapping health, missing configuration                     | external-system configuration and mapping status                                              | admin-approved mapping metadata                        | external source records                            |

## Reference JSON

Use `reference/bounded_context_ownership_map.json` as machine-readable source.
