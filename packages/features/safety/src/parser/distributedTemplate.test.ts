import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';

/**
 * Regression guard for the distributed Safety Checklist Template workbook.
 *
 * W2 and W3 deliberately assert against the raw `xl/workbook.xml` text — not
 * through SheetJS or any higher-level workbook abstraction — because this
 * closure is specifically about the workbook-XML distribution posture.
 *
 * See:
 *   - docs/architecture/plans/MASTER/backend/phase-03/audit-reports/18-Workbook-Governance-And-Distribution-Closure.md
 *   - scripts/update-safety-template-parser-meta-visibility.ts (reproducible transformer)
 *   - docs/reference/developer/safety-workbook-parser-contract.md (governed contract)
 */

const TEMPLATE_PATH = resolve(
  import.meta.dirname,
  '../../../../../docs/architecture/plans/MASTER/spfx/safety-records/Safety Checklist Template.xlsx',
);

const EXPECTED_SHEET_NAMES = ['ScoreCard', 'ScoringWeights', 'ParserMeta'] as const;
const EXPECTED_TEMPLATE_MARKER = 'SafetyChecklist_v1';
const EXPECTED_CONTRACT_VERSION = 'parse-first-2026-04';

interface IDefinedNameExpectation {
  readonly name: string;
  readonly ref: string;
}

const EXPECTED_DEFINED_NAMES: ReadonlyArray<IDefinedNameExpectation> = [
  { name: 'InspectionDateCell', ref: 'ScoreCard!$B$3' },
  { name: 'InspectionNumberCell', ref: 'ScoreCard!$E$3' },
  { name: 'ProjectSiteCell', ref: 'ScoreCard!$B$4' },
  { name: 'KeyFindingsLines', ref: 'ScoreCard!$A$143:$A$148' },
  { name: 'KeyFindingsVisualBlock', ref: 'ScoreCard!$A$143:$G$148' },
  { name: 'TotalYesCell', ref: 'ScoreCard!$G$4' },
  { name: 'TotalNoCell', ref: 'ScoreCard!$G$5' },
  { name: 'TotalNACell', ref: 'ScoreCard!$G$6' },
  { name: 'SafetyScoreCell', ref: 'ScoreCard!$G$7' },
  { name: 'ParserTemplateVersion', ref: 'ParserMeta!$B$2' },
  { name: 'ParserContractVersion', ref: 'ParserMeta!$B$3' },
  { name: 'ParserInspectionDateRaw', ref: 'ParserMeta!$B$4' },
  { name: 'ParserInspectionNumberRaw', ref: 'ParserMeta!$B$5' },
  { name: 'ParserProjectSiteRaw', ref: 'ParserMeta!$B$6' },
  { name: 'ParserReportingWeekStart', ref: 'ParserMeta!$B$11' },
  { name: 'ParserReportingWeekEnd', ref: 'ParserMeta!$B$12' },
  { name: 'ParserReportingPeriodLabel', ref: 'ParserMeta!$B$13' },
  { name: 'ParserKeyFindingsNormalized', ref: 'ParserMeta!$B$14' },
];

/**
 * Anchor-cell expectations. Regex entries mirror the parser's
 * `validateTemplate.ts` contract — case-insensitive "contains" matches. Exact
 * entries mirror the response-matrix header contract in `templateContract.ts`
 * (`EXPECTED_RESPONSE_HEADER_LABELS`).
 */
const ANCHOR_REGEX_CHECKS: ReadonlyArray<{ cell: string; pattern: RegExp }> = [
  { cell: 'A1', pattern: /Construction Site Safety/i },
  { cell: 'A3', pattern: /^date$/i },
  { cell: 'D3', pattern: /insp/i },
  { cell: 'A4', pattern: /project|site/i },
  { cell: 'F4', pattern: /total\s*yes/i },
  { cell: 'F5', pattern: /total\s*no/i },
  { cell: 'F6', pattern: /total\s*n\/?a/i },
  { cell: 'F7', pattern: /safety\s*score/i },
];

const MATRIX_HEADER_LABELS: ReadonlyArray<{ cell: string; label: string }> = [
  { cell: 'A9', label: 'Item' },
  { cell: 'B9', label: 'Yes' },
  { cell: 'C9', label: 'No' },
  { cell: 'D9', label: 'N/A' },
  { cell: 'E9', label: 'Notes' },
  { cell: 'F9', label: 'Score' },
  { cell: 'G9', label: 'Inspection Flag' },
];

// -------- minimal zip reader (same shape as the transformer) --------

const LFH_SIG = 0x04034b50;
const CDE_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;
const EOCD_MIN_LEN = 22;

interface ZipEntryRaw {
  name: string;
  method: number;
  dataRaw: Buffer;
}

function findEocd(buf: Buffer): number {
  const maxScan = Math.min(buf.length, 65535 + EOCD_MIN_LEN);
  for (let i = buf.length - EOCD_MIN_LEN; i >= buf.length - maxScan && i >= 0; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) return i;
  }
  throw new Error('ZIP EOCD record not found');
}

function parseZip(buf: Buffer): ZipEntryRaw[] {
  const eocdOff = findEocd(buf);
  const totalEntries = buf.readUInt16LE(eocdOff + 10);
  const cdOffset = buf.readUInt32LE(eocdOff + 16);
  const entries: ZipEntryRaw[] = [];
  let cursor = cdOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (buf.readUInt32LE(cursor) !== CDE_SIG) {
      throw new Error(`Bad central directory entry at index ${i}`);
    }
    const method = buf.readUInt16LE(cursor + 10);
    const compSize = buf.readUInt32LE(cursor + 20);
    const nameLen = buf.readUInt16LE(cursor + 28);
    const extraLen = buf.readUInt16LE(cursor + 30);
    const commentLen = buf.readUInt16LE(cursor + 32);
    const localOff = buf.readUInt32LE(cursor + 42);
    const name = buf.slice(cursor + 46, cursor + 46 + nameLen).toString('utf8');
    if (buf.readUInt32LE(localOff) !== LFH_SIG) {
      throw new Error(`Missing local file header for ${name}`);
    }
    const lfhNameLen = buf.readUInt16LE(localOff + 26);
    const lfhExtraLen = buf.readUInt16LE(localOff + 28);
    const dataOff = localOff + 30 + lfhNameLen + lfhExtraLen;
    entries.push({
      name,
      method,
      dataRaw: buf.slice(dataOff, dataOff + compSize),
    });
    cursor += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function entryXml(entries: ZipEntryRaw[], name: string): string {
  const e = entries.find((x) => x.name === name);
  if (!e) throw new Error(`Archive entry "${name}" missing`);
  const buf = e.method === 0 ? e.dataRaw : inflateRawSync(e.dataRaw);
  return buf.toString('utf8');
}

// -------- test setup --------

const BUFFER = readFileSync(TEMPLATE_PATH);
const ENTRIES = parseZip(BUFFER);
const WORKBOOK_XML = entryXml(ENTRIES, 'xl/workbook.xml');

describe('Distributed Safety Checklist Template — W1: expected sheet set and order', () => {
  it('workbook.SheetNames equals exactly [ScoreCard, ScoringWeights, ParserMeta]', () => {
    const wb = XLSX.read(BUFFER, { cellStyles: false, sheetStubs: false });
    expect(wb.SheetNames).toEqual([...EXPECTED_SHEET_NAMES]);
  });
});

describe('Distributed Safety Checklist Template — W2: ParserMeta is a hidden support sheet (direct xl/workbook.xml assertion)', () => {
  it('xl/workbook.xml declares state="hidden" or state="veryHidden" on the ParserMeta sheet element', () => {
    const re = /<sheet\b[^>]*\bname="ParserMeta"[^>]*>/;
    const match = re.exec(WORKBOOK_XML);
    expect(
      match,
      'ParserMeta <sheet> element not found in xl/workbook.xml',
    ).not.toBeNull();
    const element = match![0];
    const stateMatch = /\bstate="([^"]*)"/.exec(element);
    expect(
      stateMatch,
      `ParserMeta <sheet> element must carry a state attribute. Got: ${element}. Re-run scripts/update-safety-template-parser-meta-visibility.ts.`,
    ).not.toBeNull();
    const state = stateMatch![1];
    expect(
      ['hidden', 'veryHidden'],
      `ParserMeta sheet state must be "hidden" or "veryHidden" (got "${state}"). Re-run scripts/update-safety-template-parser-meta-visibility.ts.`,
    ).toContain(state);
  });

  it('xl/workbook.xml does not declare state="hidden" or state="veryHidden" on ScoreCard or ScoringWeights', () => {
    for (const visibleSheet of ['ScoreCard', 'ScoringWeights']) {
      const re = new RegExp(`<sheet\\b[^>]*\\bname="${visibleSheet}"[^>]*>`);
      const match = re.exec(WORKBOOK_XML);
      expect(match, `${visibleSheet} <sheet> element not found`).not.toBeNull();
      const element = match![0];
      const stateMatch = /\bstate="([^"]*)"/.exec(element);
      if (stateMatch !== null) {
        expect(
          stateMatch[1],
          `${visibleSheet} must be visible; found state="${stateMatch[1]}" in ${element}`,
        ).toBe('visible');
      }
    }
  });
});

describe('Distributed Safety Checklist Template — W3: active tab is ScoreCard (direct xl/workbook.xml assertion)', () => {
  it('<workbookView activeTab="..." ...> resolves to 0', () => {
    const m = /activeTab="(\d+)"/.exec(WORKBOOK_XML);
    expect(m, 'activeTab attribute missing from <workbookView>').not.toBeNull();
    expect(
      m![1],
      `activeTab must be "0" (index of ScoreCard). Got "${m![1]}". Re-run scripts/update-safety-template-parser-meta-visibility.ts.`,
    ).toBe('0');
  });
});

describe('Distributed Safety Checklist Template — W4: required defined names', () => {
  it('all 18 required defined names are present with expected cell references', () => {
    const wb = XLSX.read(BUFFER, { cellStyles: false, sheetStubs: false });
    const names = wb.Workbook?.Names ?? [];
    const nameIndex = new Map(names.map((n) => [n.Name, n.Ref]));

    const failures: string[] = [];
    for (const expected of EXPECTED_DEFINED_NAMES) {
      if (!nameIndex.has(expected.name)) {
        failures.push(`MISSING: ${expected.name} (expected ref ${expected.ref})`);
        continue;
      }
      const actualRef = nameIndex.get(expected.name);
      if (actualRef !== expected.ref) {
        failures.push(
          `MISMATCH: ${expected.name} — expected ${expected.ref}, got ${JSON.stringify(actualRef)}`,
        );
      }
    }
    expect(
      failures,
      `Defined-name drift in distributed template. Re-run scripts/update-safety-template-parser-meta-visibility.ts or restore the missing names.\n${failures.join('\n')}`,
    ).toEqual([]);
  });
});

describe('Distributed Safety Checklist Template — W5: marker values are authoritative', () => {
  it('ParserMeta!B2 === SafetyChecklist_v1 and ParserMeta!B3 === parse-first-2026-04', () => {
    const wb = XLSX.read(BUFFER, { cellFormula: false, cellStyles: false });
    const sheet = wb.Sheets['ParserMeta'];
    expect(sheet).toBeDefined();
    const b2 = (sheet!['B2'] as XLSX.CellObject | undefined)?.v;
    const b3 = (sheet!['B3'] as XLSX.CellObject | undefined)?.v;
    expect(b2).toBe(EXPECTED_TEMPLATE_MARKER);
    expect(b3).toBe(EXPECTED_CONTRACT_VERSION);
  });
});

describe('Distributed Safety Checklist Template — W6: ScoreCard anchors preserved to the parser contract', () => {
  it('anchor labels (A1/A3/D3/A4/F4-F7) satisfy the parser regex contract', () => {
    const wb = XLSX.read(BUFFER, { cellFormula: false, cellStyles: false });
    const sc = wb.Sheets['ScoreCard'];
    expect(sc).toBeDefined();
    const failures: string[] = [];
    for (const { cell, pattern } of ANCHOR_REGEX_CHECKS) {
      const raw = (sc![cell] as XLSX.CellObject | undefined)?.v;
      const asText = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
      if (!asText || !pattern.test(asText)) {
        failures.push(
          `${cell}: expected ${pattern}, got ${JSON.stringify(asText)}`,
        );
      }
    }
    expect(
      failures,
      `ScoreCard anchor-label drift (parser regex contract). See docs/reference/developer/safety-workbook-parser-contract.md.\n${failures.join('\n')}`,
    ).toEqual([]);
  });

  it('matrix header row (A9:G9) matches the parser EXPECTED_RESPONSE_HEADER_LABELS exactly (case-insensitive)', () => {
    const wb = XLSX.read(BUFFER, { cellFormula: false, cellStyles: false });
    const sc = wb.Sheets['ScoreCard'];
    expect(sc).toBeDefined();
    const failures: string[] = [];
    for (const { cell, label } of MATRIX_HEADER_LABELS) {
      const raw = (sc![cell] as XLSX.CellObject | undefined)?.v;
      const asText = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
      if (!asText || asText.trim().toLowerCase() !== label.toLowerCase()) {
        failures.push(`${cell}: expected "${label}", got ${JSON.stringify(asText)}`);
      }
    }
    expect(
      failures,
      `ScoreCard matrix-header drift. See docs/reference/developer/safety-workbook-parser-contract.md.\n${failures.join('\n')}`,
    ).toEqual([]);
  });
});
