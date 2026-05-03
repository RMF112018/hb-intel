# PCC HBI Retrieval Citation And Refusal Contract

## Purpose

Define how HBI may answer project questions from PCC data without becoming a source of truth.

## Grounded Answer Rules

- A grounded answer must include at least one citation.
- Citations must include record type, record ID, source lineage, and excerpt.
- Citations inherit source security and redaction posture.
- Restricted citations may be withheld from unauthorized users.
- If all needed citations are withheld, the answer must refuse.

## Refusal Rules

- A refusal has `grounded: false`, `refused: true`, and `citations: []`.
- Refusal reason must be one of the canonical `PccHbiRefusalReason` values.
- Refusal copy must distinguish insufficient evidence, permission restriction, out-of-scope, cross-project not authorized, and unsupported responsibility conclusion.

## Forbidden HBI Behaviors

- Uncited factual answer.
- Source-of-truth claim.
- Responsibility/blame conclusion from inference alone.
- Cross-project retrieval without authorization.
- Summarization of privileged content.
- Live LLM/vector/search/tool runtime before future gate.

## Reference JSON

Use `reference/hbi_retrieval_citation_refusal_contract.json` as machine-readable source.
