# 04 — Developer Implementation Contracts

## Required Contracts

The local code agent must create or update documentation so the following contracts exist as explicit, developer-readable docs and JSON references:

1. Bounded Context and Ownership Contract
2. Route Taxonomy and Forbidden Routes Contract
3. Record State Machine Contract
4. Field-Level Data Dictionary Contract
5. Permission / Redaction Resolution Contract
6. HBI Retrieval / Citation / Refusal Contract
7. Source-System Integration Contract
8. Audit Event Contract
9. Error / Empty / Degraded State Contract
10. Module Onboarding Contract
11. Test and Acceptance Gate Contract
12. Live Integration Readiness Gate Contract

## Contract Hierarchy

1. Unified lifecycle doctrine controls product posture.
2. System of Record Matrix controls source ownership.
3. Knowledge Reuse Security and Retention Model controls classification/redaction/reuse posture.
4. This developer-contract package controls implementation interpretation.
5. Future module-specific docs must cite and conform to all four above.

## Required Implementation Interpretation

If future implementation conflicts with a contract:

- do not guess;
- do not make silent runtime decisions;
- update docs first;
- add tests proving the closed decision;
- preserve no-departmental-workspace posture;
- preserve no-source-writeback posture unless a future approved prompt explicitly changes it.
