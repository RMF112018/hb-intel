# Safety Workbook Parser Contract

Single authoritative reference for the Safety Checklist workbook parser contract and distribution posture. Consumed by parser maintainers, operators, and anyone updating the distributed template.

**Source of truth (code):** `packages/features/safety/src/domain/templateContract.ts`
**Reproducible transformer:** `scripts/update-safety-template-parser-meta-visibility.ts`
**Automated regression guard:** `packages/features/safety/src/parser/distributedTemplate.test.ts`
**Closure audit report:** `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/18-Workbook-Governance-And-Distribution-Closure.md`
**Companion planning artifact (not authoritative):** `docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/03A-Checklist-Template-Contract.md`

## Parser contract constants

Published by `packages/features/safety/src/domain/templateContract.ts`.

| Constant | Value |
| --- | --- |
| `PARSER_META_SHEET` | `ParserMeta` |
| `PARSER_TEMPLATE_MARKER_ACCEPTED` | `['SafetyChecklist_v1']` |
| `PARSER_CONTRACT_VERSION_ACCEPTED` | `['parse-first-2026-04']` |
| `SHEET_SCORECARD` | `ScoreCard` |
| `SHEET_SCORING_WEIGHTS` | `ScoringWeights` |
| `REQUIRED_SHEETS` | `[ScoreCard, ScoringWeights]` |

## Required defined names (18)

Every name below must be present in the workbook's defined-name table with the listed cell reference. Enforced by the W4 guard.

| # | Name | Cell reference | Lane |
| ---: | --- | --- | --- |
| 1 | `InspectionDateCell` | `ScoreCard!$B$3` | Legacy metadata |
| 2 | `InspectionNumberCell` | `ScoreCard!$E$3` | Legacy metadata |
| 3 | `ProjectSiteCell` | `ScoreCard!$B$4` | Legacy metadata |
| 4 | `KeyFindingsLines` | `ScoreCard!$A$143:$A$148` | Key findings (line-oriented) |
| 5 | `KeyFindingsVisualBlock` | `ScoreCard!$A$143:$G$148` | Key findings (visual block) |
| 6 | `TotalYesCell` | `ScoreCard!$G$4` | Summary totals |
| 7 | `TotalNoCell` | `ScoreCard!$G$5` | Summary totals |
| 8 | `TotalNACell` | `ScoreCard!$G$6` | Summary totals |
| 9 | `SafetyScoreCell` | `ScoreCard!$G$7` | Weighted safety score |
| 10 | `ParserTemplateVersion` | `ParserMeta!$B$2` | Parser marker |
| 11 | `ParserContractVersion` | `ParserMeta!$B$3` | Parser marker |
| 12 | `ParserInspectionDateRaw` | `ParserMeta!$B$4` | Parser raw metadata |
| 13 | `ParserInspectionNumberRaw` | `ParserMeta!$B$5` | Parser raw metadata |
| 14 | `ParserProjectSiteRaw` | `ParserMeta!$B$6` | Parser raw metadata |
| 15 | `ParserReportingWeekStart` | `ParserMeta!$B$11` | Parser reporting period |
| 16 | `ParserReportingWeekEnd` | `ParserMeta!$B$12` | Parser reporting period |
| 17 | `ParserReportingPeriodLabel` | `ParserMeta!$B$13` | Parser reporting period |
| 18 | `ParserKeyFindingsNormalized` | `ParserMeta!$B$14` | Parser key findings |

## Required parser seams

### `ScoreCard` sheet (visible)

Anchor cells enforced by `validateTemplate.ts`:

| Cell | Contract | Enforcement |
| --- | --- | --- |
| `A1` | Title — must match `/Construction Site Safety/i` | Warning-only in parser; W6 guard enforces |
| `A3` | Date label — must match `/^date$/i` | Fail-loud in parser |
| `D3` | Inspection-number label — must match `/insp/i` | Fail-loud in parser |
| `A4` | Project/site label — must match `/project\|site/i` | Fail-loud in parser |
| `F4` | Total Yes label — must match `/total\s*yes/i` | Fail-loud in parser |
| `F5` | Total No label — must match `/total\s*no/i` | Fail-loud in parser |
| `F6` | Total N/A label — must match `/total\s*n\/?a/i` | Fail-loud in parser |
| `F7` | Safety Score label — must match `/safety\s*score/i` | Fail-loud in parser |

Matrix header row (A9:G9) — exact (case-insensitive) match per `EXPECTED_RESPONSE_HEADER_LABELS`:

| Cell | Label |
| --- | --- |
| `A9` | `Item` |
| `B9` | `Yes` |
| `C9` | `No` |
| `D9` | `N/A` |
| `E9` | `Notes` |
| `F9` | `Score` |
| `G9` | `Inspection Flag` |

Response matrix rows: `A10:G124` (12 sections, header rows at section boundaries, response rows elsewhere).

User-entry cells: `B3` (date), `E3` (inspection number), `B4` (project/site).

### `ScoringWeights` sheet (visible)

Section weights in rows 2–13. Each row's column A must contain a section number. Fail-loud in parser if any row missing.

### `ParserMeta` sheet (hidden — `state="veryHidden"`)

Optional but **fail-loud when present**. The parser treats markers as present if **any** of:

- The `ParserMeta` sheet exists, OR
- The `ParserTemplateVersion` defined name exists, OR
- The `ParserContractVersion` defined name exists.

When markers are present, the following invariants are fail-loud enforced by `validateTemplate.ts`:

- `ParserMeta!B2` = `SafetyChecklist_v1` (must match `PARSER_TEMPLATE_MARKER_ACCEPTED`).
- `ParserMeta!B3` = `parse-first-2026-04` (must match `PARSER_CONTRACT_VERSION_ACCEPTED`).
- Required metadata fields (`ParserInspectionDateRaw`, `ParserInspectionNumberRaw`, `ParserProjectSiteRaw`) are readable and well-formed.
- Reporting period is **all-or-nothing**: if any of `ParserReportingWeekStart` / `ParserReportingWeekEnd` / `ParserReportingPeriodLabel` is present, all three are required.
- Key findings are authorized via one of: `KeyFindingsLines` named range, `KeyFindingsNormalized` entry inside `ParserMeta`, or `ParserKeyFindingsNormalized` defined name.

Field layout in `ParserMeta`:

| Cell | Field |
| --- | --- |
| `B2` | `ParserTemplateVersion` — `SafetyChecklist_v1` |
| `B3` | `ParserContractVersion` — `parse-first-2026-04` |
| `B4` | `ParserInspectionDateRaw` |
| `B5` | `ParserInspectionNumberRaw` |
| `B6` | `ParserProjectSiteRaw` |
| `B11` | `ParserReportingWeekStart` |
| `B12` | `ParserReportingWeekEnd` |
| `B13` | `ParserReportingPeriodLabel` |
| `B14` | `ParserKeyFindingsNormalized` |

## Distribution posture

Enforced by `packages/features/safety/src/parser/distributedTemplate.test.ts` (W1–W6):

- Exactly three sheets — `ScoreCard`, `ScoringWeights`, `ParserMeta` — in that order.
- `ParserMeta` has `state="veryHidden"` (does not appear in Excel's right-click "Unhide" dialog). `ScoreCard` and `ScoringWeights` are visible.
- Active tab at open = `ScoreCard` (`<workbookView activeTab="0"/>`).
- All 18 defined names present with the cell references in the table above.
- `ParserMeta!B2` = `SafetyChecklist_v1`; `ParserMeta!B3` = `parse-first-2026-04`.
- `ScoreCard` anchor cells satisfy the parser regex contract; matrix header row matches the parser's exact labels.

## Regression checklist (operator)

Follow these steps whenever the distributed template changes:

1. Re-save the workbook from Excel if you have made visible-content edits (label text, formulas, formatting).
2. Run the reproducible transformer:
   ```bash
   pnpm exec tsx scripts/update-safety-template-parser-meta-visibility.ts
   ```
   - Should exit `0` and print either an edit summary (`activeTab: 2 -> 0`, etc.) or `already closed (no-op: …)`.
3. Run the distributed-template regression guard:
   ```bash
   cd packages/features/safety && pnpm exec vitest run src/parser/distributedTemplate.test.ts
   ```
   - All W1–W6 assertions must PASS.
4. In Excel, open the workbook and confirm it opens on `ScoreCard` (not `ParserMeta`).
5. In Excel, right-click any tab and confirm no `ParserMeta` entry appears in the "Unhide" dialog (this confirms `state="veryHidden"` — `hidden` would list it).
6. In Excel, open the Name Manager (Cmd + F3 / Ctrl + F3) and confirm all 18 defined names are present with the references in the table above.

If any step fails, re-run the transformer; if the transformer itself fails, the workbook has lost required structure (missing defined name, lost sheet, etc.) and the prior version must be restored from git.

## Cross-references

- Audit report (Prompt-04 closure): `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/18-Workbook-Governance-And-Distribution-Closure.md`
- Prior closures: audit reports `15-Graph-Only-Cutover-Closure.md`, `16-Permissions-Tightening-And-Reproof.md`, `17-Deployment-Proof-And-Operator-Readiness.md`
- Telemetry reference (carries `templateVersion` and `parserContractVersion` in `safety.ingestion.*` events): `docs/reference/developer/safety-ingest-telemetry-reference.md`
- Triage runbook (escalation on parser-contract failures): `docs/maintenance/safety-ingest-triage-and-recovery-runbook.md`
- Design-package planning artifact (not authoritative; historical): `docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/03A-Checklist-Template-Contract.md`
