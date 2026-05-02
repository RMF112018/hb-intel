# Wave 11 Workbook Source Mapping

Status: Canonical workbook extraction and source-traceability mapping posture for Wave 11

## Purpose

This document preserves workbook-derived repo truth for Wave 11, defines source-row traceability requirements, and prevents misinterpretation of workbook markers as final runtime or legal semantics.

## Source Files

- `docs/reference/example/Responsibility Matrix - Template.xlsx`
- `docs/reference/example/Responsibility Matrix - Owner Contract Template.xlsx`

## Verified Workbook Posture

### General workbook (`Responsibility Matrix - Template.xlsx`)

- Sheets: `PM`, `Field`
- PM task-text rows: `82`
- Field rows with assignment marks: `27`
- Workbook-derived task-row posture context: `109`
- Strict marked assignment rows total: `98` (`71` PM + `27` Field)

### Owner-contract workbook (`Responsibility Matrix - Owner Contract Template.xlsx`)

- Sheet: `Template`
- Structure: article/page/responsible-party/description columns with party legend
- Posture: schema/placeholder template, not populated default obligation-description rows

## 109 vs 98 Clarification Lock

- `109` must be interpreted as workbook-derived task-row posture context only.
- `98` is the strict marked-assignment posture.
- Governing docs must not imply that 109 represents fully assigned active records.

## Row-Type Classification Contract

Each imported row must be classified before activation:

- responsibility item
- section/header row
- instruction/reminder row
- blank/formatting-only row
- placeholder row
- ambiguous row requiring review

No automatic activation based only on non-empty cells.

## Source Row Traceability Requirements

Every workbook-derived default mapping record must preserve:

- source workbook file
- source sheet
- source row
- source section/category
- source task text (exact)
- source assignment marks by role column
- normalization status
- reviewer decision

## Source Assignment Mark Interpretation Rules

Source assignment marks are source references and must be normalized through governance policy:

- `X` = assigned in source; final normalized role requires policy mapping
- `Support` = support contribution indicator (not automatically `Consulted`)
- `Review` = review role indicator (not automatically `Approver`)
- `Sign-Off` = sign-off indicator (may require decision-rights overlay and approval-step mapping)

Source markers are not self-sufficient final runtime role semantics.

## Role Normalization Policy

Role normalization must map workbook labels to canonical PCC vocabulary without mutating source text:

- preserve source labels (`PX`, `Sr. PM`, `PM2`, `PM1`, `PA`, `Lead Super`, etc.)
- map to canonical PCC role/person vocabulary for product behavior
- preserve explicit normalization notes where mapping is ambiguous

## RACI vs Contract-Party Semantic Separation

The owner-contract legend and internal RACI axis are separate:

- contract-party markers (`O`, `A/E`, `C`) classify contract-party context
- internal RACI values classify internal operating responsibility

Hard rule: contract-party `C = Contractor` is not RACI `C = Consulted`.

## Owner-Contract Placeholder Posture

Current owner-contract workbook content is schema/placeholder posture and should be treated as:

- contract-party structure source
- obligation-reference model scaffold
- mapping workflow scaffold

It is not treated as populated default contract obligation content.

## Human Review and Governance Controls

Human review is required for:

- ambiguous rows
- conflicting marks
- multiple-accountability posture
- role vocabulary mismatches
- contract-party vs RACI collisions

Governed approval is required before default activation into template library posture.

## Integration Boundary Reminders

- Team & Access owns roster/access state.
- HB Document Control Center owns evidence binaries.
- Wave 14 owns approval/checkpoint execution.
- Wave 8 owns framework seams.

## Legal and Runtime Guardrails

- No legal advice.
- No automatic creation of legal obligations.
- No replacement of executed contracts.
- No runtime external-system mutation/writeback claims in this mapping document.

## Prompt Sequencing Note

`Wave_11_Documentation_Closeout.md` is intentionally deferred to Prompt 05.
