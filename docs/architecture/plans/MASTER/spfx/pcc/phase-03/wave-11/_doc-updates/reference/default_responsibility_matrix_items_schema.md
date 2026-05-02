# Default Responsibility Matrix Items JSON Schema

This file documents the generated `default_responsibility_matrix_items.json` shape included in this package.

## Purpose

The JSON is a workbook-source extraction artifact for PCC Phase 3 Wave 11 Responsibility Matrix planning. It is intended to seed documentation, traceability, and future implementation planning. It is not a runtime contract and does not create legal obligations.

## Top-Level Keys

- `metadata`: package context, source files, classification policy, and extraction limitations.
- `sources`: workbook/sheet-level extraction inventory.
- `defaultItems`: responsibility rows extracted as actual source items.
- `ambiguousItems`: rows that looked like placeholders, instructions, formatting, or source ambiguities and were not promoted to default responsibility items.

## RACI Normalization Policy Used

| Source Mark | Normalized Value | Notes |
| --- | --- | --- |
| `X` | `R` | Responsible / primary execution role. |
| `Support` | `S` | Supporting. Preserved outside core RACI but still modeled. |
| `Sign-Off` | `A` | Accountable / sign-off role. Requires business confirmation where multiple sign-offs appear. |
| `Review` | `Q` | Quality Reviewer / review role. |
| Blank | `Unknown` | Not assigned; may require review when the row otherwise functions as a responsibility item. |

## Owner-Contract Caveat

The owner-contract workbook uploaded for this package contains placeholder rows (`Article=0`, `Page=0`) and a party-code legend (`O`, `A/E`, `C`) but no prefilled responsibility descriptions. Those placeholders are captured under `ambiguousItems`, not `defaultItems`.
