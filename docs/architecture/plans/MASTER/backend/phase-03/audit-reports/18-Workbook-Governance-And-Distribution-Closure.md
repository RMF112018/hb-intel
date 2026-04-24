# 18 — Workbook Governance and Distribution Closure (Safety Checklist Template)

## Scope & conclusion

Close the remaining workbook-governance gaps now that the backend parser contract is stronger.

Before this closure, the distributed `Safety Checklist Template.xlsx` opened on the `ParserMeta` support sheet (`activeTab="2"`) and `ParserMeta` was fully visible. Field users opening the template saw parser-authority internals (template marker, contract version, raw-metadata fields) by default, creating a drift risk: an inadvertent manual edit to `ParserMeta` values would silently break parser authority on subsequent uploads.

This closure:

1. Hides `ParserMeta` with `state="veryHidden"` (stronger than `hidden` — does not appear in Excel's right-click "Unhide" dialog).
2. Points the workbook's `activeTab` at `ScoreCard` so the template opens on the intended starting surface.
3. Publishes a single authoritative contract reference at `docs/reference/developer/safety-workbook-parser-contract.md`.
4. Formalizes the regression checklist as an automated vitest guard (`packages/features/safety/src/parser/distributedTemplate.test.ts`, W1–W6).
5. Ships a reproducible transformer (`scripts/update-safety-template-parser-meta-visibility.ts`) so operators can re-apply the same surgical edit to future template revisions without risking workbook corruption.

Closure stamped as `@hbc/functions 00.000.149`.

## Before state (excerpt of `xl/workbook.xml`)

```xml
<bookViews>
  <workbookView … activeTab="2" … />
</bookViews>
<sheets>
  <sheet name="ScoreCard" sheetId="1" r:id="rId1"/>
  <sheet name="ScoringWeights" sheetId="2" r:id="rId2"/>
  <sheet name="ParserMeta" sheetId="3" r:id="rId3"/>
</sheets>
```

## After state (same excerpt)

```xml
<bookViews>
  <workbookView … activeTab="0" … />
</bookViews>
<sheets>
  <sheet name="ScoreCard" sheetId="1" r:id="rId1"/>
  <sheet name="ScoringWeights" sheetId="2" r:id="rId2"/>
  <sheet name="ParserMeta" sheetId="3" state="veryHidden" r:id="rId3"/>
</sheets>
```

## Implementation method — targeted archive edit

Explicit posture:

- **No full-workbook rewrite.** No `xlsx.writeFile`, no `xlsx.write`, no SheetJS write-serialization path, no other library that re-serializes a parsed workbook model.
- **No model-level round-trip.** Only the `xl/workbook.xml` archive entry is deserialized (to XML), edited, and re-serialized; every other archive entry is copied through as raw bytes.

The transformer script `scripts/update-safety-template-parser-meta-visibility.ts`:

1. Reads the `.xlsx` buffer.
2. Walks the zip via a minimal pure-Node parser (Node built-ins only — `node:zlib`, `Buffer`, `DataView`).
3. Runs a read-only structure assertion pass against the raw XML (sheet set, defined names, `ParserMeta!B2` / `!B3` marker values). SheetJS is **not** a dependency of the script.
4. For the `xl/workbook.xml` entry: inflates the raw compressed data, applies the two textual edits (`activeTab="0"` and `state="veryHidden"` on `ParserMeta`), deflates the edited XML, recomputes CRC-32 and sizes, emits a new local-file-header.
5. For every other entry (15 of 16): emits the **raw local-file-header bytes + raw compressed-data bytes** copied from the input, byte-for-byte.
6. Rebuilds the central directory + end-of-central-directory to remain internally consistent with the emitted entries. Preserves each entry's version, flags, method, CRC, sizes, file name, and extra fields in the central-directory record; only `local-header-offset` is recomputed.
7. Post-write verification: re-opens the output and asserts that every non-`xl/workbook.xml` entry's raw local-file-header and raw compressed-data bytes byte-match the input's raw bytes for the same entry. Fails before renaming over the input if any divergence is detected.
8. Idempotent: running the script on an already-closed archive is a no-op at the XML edit level and still performs the full byte-match verification round-trip.

### Preservation claim (technically honest)

- The `xl/workbook.xml` archive entry's uncompressed content changes by exactly the two textual edits above; its compressed-data bytes, compressed-size, uncompressed-size, and CRC-32 are regenerated.
- **Every other archive entry's raw local-file-header bytes AND raw compressed-data bytes are preserved byte-for-byte** (verified by the transformer's post-write verification and by the W2/W3 test against `xl/workbook.xml`).
- Archive container metadata (central-directory offsets, end-of-central-directory record, overall archive size) is regenerated to remain internally consistent with the emitted entries. Overall archive size will differ from the input by the `xl/workbook.xml` entry-size delta plus small central-directory adjustments.

## Invariants guarded (`packages/features/safety/src/parser/distributedTemplate.test.ts`)

All six invariants run against the distributed `.xlsx` on every CI run. W2 and W3 parse `xl/workbook.xml` directly out of the archive — no SheetJS or higher-level workbook abstraction for these two.

| ID | Scope | Rationale |
| --- | --- | --- |
| **W1** | SheetJS `SheetNames` = `[ScoreCard, ScoringWeights, ParserMeta]` (exact order) | A third or fourth sheet added inadvertently would fail |
| **W2** | **Direct `xl/workbook.xml`:** `ParserMeta` `<sheet>` carries `state="hidden"` or `state="veryHidden"`; `ScoreCard` / `ScoringWeights` must be visible | A contributor re-saves the template in Excel and unhides `ParserMeta` |
| **W3** | **Direct `xl/workbook.xml`:** `<workbookView activeTab="…"/>` resolves to `0` | A contributor's Excel saves with `activeTab` pointing at the wrong sheet |
| **W4** | All 18 required defined names present with the exact cell references from the governed contract | Named ranges get renamed or removed during a manual edit |
| **W5** | `ParserMeta!B2` === `SafetyChecklist_v1` and `ParserMeta!B3` === `parse-first-2026-04` | Marker values drift from the parser's accepted set |
| **W6** | `ScoreCard` anchor labels (A1, A3, D3, A4, F4–F7) satisfy the parser regex contract; matrix header row (A9:G9) matches `EXPECTED_RESPONSE_HEADER_LABELS` (case-insensitive) | Visible anchor labels edited in a way that would flip the parser into silent legacy fallback |

## Contract statement (post-closure)

| Dimension | Value |
| --- | --- |
| Template marker (accepted) | `SafetyChecklist_v1` — stored at `ParserMeta!B2`, exposed via defined name `ParserTemplateVersion` |
| Parser contract version (accepted) | `parse-first-2026-04` — stored at `ParserMeta!B3`, exposed via defined name `ParserContractVersion` |
| Distributed template sheets | Exactly three: `ScoreCard` (visible), `ScoringWeights` (visible), `ParserMeta` (`state="veryHidden"`) |
| Active tab at open | `ScoreCard` (`activeTab="0"`) |
| Required defined names | 18 (see `docs/reference/developer/safety-workbook-parser-contract.md`) |
| Required parser seams | `ScoreCard` + `ScoringWeights` visible sheets; `ParserMeta` optional-but-fail-loud-when-present |

## Proof-run evidence (local)

| Step | Command | Result |
| --- | --- | --- |
| 1 | `pnpm exec tsx scripts/update-safety-template-parser-meta-visibility.ts` | Exit 0 on first run (`activeTab: 2 -> 0`, `ParserMeta.state: "" -> "veryHidden"`). Exit 0 on second run (no-op). Post-write byte-match verification PASS. |
| 2 | `unzip -l "…/Safety Checklist Template.xlsx"` | 16 entries, same file names as before |
| 2 | `unzip -p "…/Safety Checklist Template.xlsx" xl/workbook.xml \| grep -Eo '(state="[^"]*"\|activeTab="[^"]*")'` | `activeTab="0"`, `state="veryHidden"` |
| 3 | Distributed-template guard in isolation | **8 passed** (W1 + W2×2 + W3 + W4 + W5 + W6×2) |
| 4 | `packages/features/safety` parser + ingestion suites | **50 passed** |
| 5 | Backend `safety-ingestion` suite | **104 passed** |
| 6 | Parity fixture test | **9 passed** |
| 7 | Backend unit project (full) | **2156 passed, 3 skipped (pre-existing)** |
| 8 | `packages/features/safety` full unit project | **119 passed, 4 skipped (pre-existing)** |

## Residual operational gaps (not resolved in this closure)

- **SPFx-app template delivery.** Field users download the template from SharePoint. A different template served by the SPFx app (out of band from the `docs/` copy) is not in scope of this automated guard. Remediation is SPFx-side.
- **Planning-artifact contract.** `docs/architecture/plans/MASTER/spfx/safety-records/design-pacakge/03A-Checklist-Template-Contract.md` is not removed. Readers reaching it via the design-package folder may miss the new canonical reference. Cross-linking in the new reference doc mitigates but does not eliminate the discoverability gap.

## Out of scope

- Parser contract constant changes (`PARSER_META_SHEET`, `PARSER_TEMPLATE_MARKER_ACCEPTED`, `PARSER_CONTRACT_VERSION_ACCEPTED`). No template-marker or contract-version bumps.
- SPFx client surface. Feature-package SharePoint adapters.
- IaC / Bicep changes. Workflow changes. Telemetry emitter changes.
- Backend hot-path code. The 03A planning-artifact contract in the design-package folder.
- `ParserMeta` cell content modifications (only the sheet's visibility state and the workbook's active-tab pointer change).

## Change set summary

Seven files — three narrow edits, four new files.

Narrow edits (three):

- `docs/architecture/plans/MASTER/spfx/safety-records/Safety Checklist Template.xlsx` — targeted archive edit (only `xl/workbook.xml` content changes; raw per-entry byte preservation for the 15 unchanged entries).
- `backend/functions/package.json` — bump `"version"` to `00.000.149`.
- `scripts/verify-functions-live-parity.test.ts` — bump BASE fixtures (`version` + `HBC_FUNCTIONS_BUILD_VERSION`) to `00.000.149`.

New files (four):

- `scripts/update-safety-template-parser-meta-visibility.ts` — reproducible transformer (pure Node).
- `packages/features/safety/src/parser/distributedTemplate.test.ts` — W1–W6 automated regression guard.
- `docs/reference/developer/safety-workbook-parser-contract.md` — governed contract reference.
- This audit report.
