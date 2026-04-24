#!/usr/bin/env tsx
/**
 * Transformer: hide ParserMeta and point activeTab at ScoreCard in the
 * distributed Safety Checklist Template .xlsx, without re-serializing the
 * workbook through any library write path.
 *
 * - Uses SheetJS (xlsx) **only** for a read-only structure assertion pass.
 * - All write-path work is done by a minimal pure-Node zip walker + emitter
 *   that copies every non-`xl/workbook.xml` entry's raw local-file-header and
 *   raw compressed payload bytes through byte-for-byte. Only `xl/workbook.xml`
 *   is deserialized (to XML), edited, and re-serialized; the central
 *   directory and end-of-central-directory record are regenerated to remain
 *   internally consistent.
 *
 * Idempotent: running against an already-closed workbook is a no-op at the
 * XML edit level and still performs the full round-trip with byte-match
 * verification of the 15 unchanged entries.
 *
 * See plan §5 and audit report 18 in the repo for the governance context.
 */

import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateRawSync, deflateRawSync } from 'node:zlib';

const DEFAULT_WORKBOOK_PATH =
  'docs/architecture/plans/MASTER/spfx/safety-records/Safety Checklist Template.xlsx';

const EXPECTED_SHEET_NAMES = ['ScoreCard', 'ScoringWeights', 'ParserMeta'] as const;
const EXPECTED_TEMPLATE_MARKER = 'SafetyChecklist_v1';
const EXPECTED_CONTRACT_VERSION = 'parse-first-2026-04';
const REQUIRED_DEFINED_NAMES: ReadonlyArray<string> = [
  'InspectionDateCell',
  'InspectionNumberCell',
  'ProjectSiteCell',
  'KeyFindingsLines',
  'KeyFindingsVisualBlock',
  'TotalYesCell',
  'TotalNoCell',
  'TotalNACell',
  'SafetyScoreCell',
  'ParserTemplateVersion',
  'ParserContractVersion',
  'ParserInspectionDateRaw',
  'ParserInspectionNumberRaw',
  'ParserProjectSiteRaw',
  'ParserReportingWeekStart',
  'ParserReportingWeekEnd',
  'ParserReportingPeriodLabel',
  'ParserKeyFindingsNormalized',
];

const WORKBOOK_XML_ENTRY = 'xl/workbook.xml';

const LFH_SIG = 0x04034b50;
const CDE_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;
const EOCD_MIN_LEN = 22;

interface ZipEntryRaw {
  name: string;
  localHeaderOffsetInput: number;
  /** Raw local-file-header bytes (fixed 30-byte header + name + extra). */
  headerRaw: Buffer;
  /** Raw compressed data bytes (exact length = compressedSize). */
  dataRaw: Buffer;
  /** Central directory record's raw bytes (for fields we copy through). */
  centralRaw: Buffer;
  version: number;
  flags: number;
  method: number;
  mtime: number;
  mdate: number;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  externalAttrs: number;
  internalAttrs: number;
  diskNumberStart: number;
}

function findEocd(buf: Buffer): number {
  // Search backwards for EOCD signature; EOCD is at the end, with optional comment up to 65535 bytes.
  const maxScan = Math.min(buf.length, 65535 + EOCD_MIN_LEN);
  for (let i = buf.length - EOCD_MIN_LEN; i >= buf.length - maxScan && i >= 0; i--) {
    if (buf.readUInt32LE(i) === EOCD_SIG) return i;
  }
  throw new Error('ZIP EOCD record not found');
}

function parseZip(buf: Buffer): ZipEntryRaw[] {
  const eocdOff = findEocd(buf);
  const totalEntries = buf.readUInt16LE(eocdOff + 10);
  const cdSize = buf.readUInt32LE(eocdOff + 12);
  const cdOffset = buf.readUInt32LE(eocdOff + 16);
  if (cdOffset + cdSize > buf.length) {
    throw new Error('Central directory overruns buffer');
  }

  const entries: ZipEntryRaw[] = [];
  let cursor = cdOffset;
  for (let i = 0; i < totalEntries; i++) {
    if (buf.readUInt32LE(cursor) !== CDE_SIG) {
      throw new Error(`Central directory entry ${i} has bad signature`);
    }
    const versionMadeBy = buf.readUInt16LE(cursor + 4);
    void versionMadeBy;
    const version = buf.readUInt16LE(cursor + 6);
    const flags = buf.readUInt16LE(cursor + 8);
    const method = buf.readUInt16LE(cursor + 10);
    const mtime = buf.readUInt16LE(cursor + 12);
    const mdate = buf.readUInt16LE(cursor + 14);
    const crc = buf.readUInt32LE(cursor + 16);
    const compSize = buf.readUInt32LE(cursor + 20);
    const uncompSize = buf.readUInt32LE(cursor + 24);
    const nameLen = buf.readUInt16LE(cursor + 28);
    const extraLen = buf.readUInt16LE(cursor + 30);
    const commentLen = buf.readUInt16LE(cursor + 32);
    const diskStart = buf.readUInt16LE(cursor + 34);
    const internalAttrs = buf.readUInt16LE(cursor + 36);
    const externalAttrs = buf.readUInt32LE(cursor + 38);
    const localHeaderOff = buf.readUInt32LE(cursor + 42);
    const name = buf.slice(cursor + 46, cursor + 46 + nameLen).toString('utf8');

    if ((flags & 0x0008) !== 0) {
      throw new Error(
        `Entry "${name}" uses the zip data-descriptor form (bit 3 of flags). This transformer does not support data descriptors.`,
      );
    }

    const centralEntryLen = 46 + nameLen + extraLen + commentLen;
    const centralRaw = buf.slice(cursor, cursor + centralEntryLen);

    // Parse local header to capture raw header bytes.
    if (buf.readUInt32LE(localHeaderOff) !== LFH_SIG) {
      throw new Error(`Local file header missing for "${name}"`);
    }
    const lfhNameLen = buf.readUInt16LE(localHeaderOff + 26);
    const lfhExtraLen = buf.readUInt16LE(localHeaderOff + 28);
    const lfhHeaderLen = 30 + lfhNameLen + lfhExtraLen;
    const headerRaw = buf.slice(localHeaderOff, localHeaderOff + lfhHeaderLen);
    const dataRaw = buf.slice(
      localHeaderOff + lfhHeaderLen,
      localHeaderOff + lfhHeaderLen + compSize,
    );

    entries.push({
      name,
      localHeaderOffsetInput: localHeaderOff,
      headerRaw,
      dataRaw,
      centralRaw,
      version,
      flags,
      method,
      mtime,
      mdate,
      crc32: crc,
      compressedSize: compSize,
      uncompressedSize: uncompSize,
      externalAttrs,
      internalAttrs,
      diskNumberStart: diskStart,
    });

    cursor += centralEntryLen;
  }
  return entries;
}

// CRC-32/ISO-HDLC (polynomial 0xedb88320). Hand-rolled to avoid Node version
// floor on `zlib.crc32`.
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32Bytes(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function buildLocalFileHeader(
  entry: ZipEntryRaw,
  newCompressedData: Buffer,
  newCrc: number,
  newUncompressedSize: number,
): Buffer {
  const nameBuf = Buffer.from(entry.name, 'utf8');
  // Reuse the original local-header's extra field bytes (preserves any Info-ZIP
  // Unicode path, NTFS timestamps, etc.).
  const originalLfhNameLen = entry.headerRaw.readUInt16LE(26);
  const originalLfhExtraLen = entry.headerRaw.readUInt16LE(28);
  const originalExtra = entry.headerRaw.slice(
    30 + originalLfhNameLen,
    30 + originalLfhNameLen + originalLfhExtraLen,
  );

  const header = Buffer.alloc(30 + nameBuf.length + originalExtra.length);
  header.writeUInt32LE(LFH_SIG, 0);
  header.writeUInt16LE(entry.version, 4);
  header.writeUInt16LE(entry.flags, 6);
  header.writeUInt16LE(entry.method, 8);
  header.writeUInt16LE(entry.mtime, 10);
  header.writeUInt16LE(entry.mdate, 12);
  header.writeUInt32LE(newCrc, 14);
  header.writeUInt32LE(newCompressedData.length, 18);
  header.writeUInt32LE(newUncompressedSize, 22);
  header.writeUInt16LE(nameBuf.length, 26);
  header.writeUInt16LE(originalExtra.length, 28);
  nameBuf.copy(header, 30);
  originalExtra.copy(header, 30 + nameBuf.length);
  return header;
}

function buildCentralDirectoryEntry(
  entry: ZipEntryRaw,
  newCrc: number,
  newCompressedSize: number,
  newUncompressedSize: number,
  newLocalHeaderOffset: number,
): Buffer {
  // Preserve the original central-directory entry's name, extra, and comment
  // buffers so any Info-ZIP Unicode path / NTFS timestamps are retained.
  const cRaw = entry.centralRaw;
  const nameLen = cRaw.readUInt16LE(28);
  const extraLen = cRaw.readUInt16LE(30);
  const commentLen = cRaw.readUInt16LE(32);
  const nameExtra = cRaw.slice(46, 46 + nameLen + extraLen + commentLen);

  const out = Buffer.alloc(46 + nameExtra.length);
  out.writeUInt32LE(CDE_SIG, 0);
  out.writeUInt16LE(cRaw.readUInt16LE(4), 4); // versionMadeBy
  out.writeUInt16LE(entry.version, 6);
  out.writeUInt16LE(entry.flags, 8);
  out.writeUInt16LE(entry.method, 10);
  out.writeUInt16LE(entry.mtime, 12);
  out.writeUInt16LE(entry.mdate, 14);
  out.writeUInt32LE(newCrc, 16);
  out.writeUInt32LE(newCompressedSize, 20);
  out.writeUInt32LE(newUncompressedSize, 24);
  out.writeUInt16LE(nameLen, 28);
  out.writeUInt16LE(extraLen, 30);
  out.writeUInt16LE(commentLen, 32);
  out.writeUInt16LE(entry.diskNumberStart, 34);
  out.writeUInt16LE(entry.internalAttrs, 36);
  out.writeUInt32LE(entry.externalAttrs, 38);
  out.writeUInt32LE(newLocalHeaderOffset, 42);
  nameExtra.copy(out, 46);
  return out;
}

function buildEocd(
  totalEntries: number,
  cdSize: number,
  cdOffset: number,
  comment: Buffer,
): Buffer {
  const out = Buffer.alloc(EOCD_MIN_LEN + comment.length);
  out.writeUInt32LE(EOCD_SIG, 0);
  out.writeUInt16LE(0, 4); // disk number
  out.writeUInt16LE(0, 6); // disk where central directory starts
  out.writeUInt16LE(totalEntries, 8);
  out.writeUInt16LE(totalEntries, 10);
  out.writeUInt32LE(cdSize, 12);
  out.writeUInt32LE(cdOffset, 16);
  out.writeUInt16LE(comment.length, 20);
  comment.copy(out, EOCD_MIN_LEN);
  return out;
}

function readEocdComment(buf: Buffer): Buffer {
  const off = findEocd(buf);
  const commentLen = buf.readUInt16LE(off + 20);
  return buf.slice(off + EOCD_MIN_LEN, off + EOCD_MIN_LEN + commentLen);
}

// -------- XML edits --------

const ACTIVE_TAB_RE = /activeTab="(\d+)"/;
const PARSER_META_SHEET_OPEN_RE =
  /<sheet\s+name="ParserMeta"\s+sheetId="3"(?:\s+state="(?<state>[^"]*)")?\s+r:id="rId3"\s*\/>/;

interface XmlEditResult {
  edited: Buffer;
  activeTabBefore: string;
  activeTabAfter: string;
  parserMetaStateBefore: string; // '' if none
  parserMetaStateAfter: string;
  changed: boolean;
}

function editWorkbookXml(xmlBuf: Buffer): XmlEditResult {
  const before = xmlBuf.toString('utf8');

  const atMatch = ACTIVE_TAB_RE.exec(before);
  if (!atMatch) {
    throw new Error('activeTab attribute not found in xl/workbook.xml');
  }
  const activeTabBefore = atMatch[1];

  const smMatch = PARSER_META_SHEET_OPEN_RE.exec(before);
  if (!smMatch) {
    throw new Error(
      'ParserMeta <sheet> element not found in xl/workbook.xml (expected sheetId="3", r:id="rId3")',
    );
  }
  const parserMetaStateBefore = smMatch.groups?.state ?? '';

  let after = before;

  // Edit 1: activeTab
  if (activeTabBefore !== '0') {
    after = after.replace(ACTIVE_TAB_RE, 'activeTab="0"');
  }

  // Edit 2: ParserMeta state
  // Accept already-closed posture ("hidden" or "veryHidden") as idempotent.
  const alreadyClosed =
    parserMetaStateBefore === 'hidden' || parserMetaStateBefore === 'veryHidden';
  if (!alreadyClosed) {
    after = after.replace(
      PARSER_META_SHEET_OPEN_RE,
      `<sheet name="ParserMeta" sheetId="3" state="veryHidden" r:id="rId3"/>`,
    );
  }

  const parserMetaStateAfter = alreadyClosed ? parserMetaStateBefore : 'veryHidden';
  const changed = after !== before;

  return {
    edited: Buffer.from(after, 'utf8'),
    activeTabBefore,
    activeTabAfter: '0',
    parserMetaStateBefore,
    parserMetaStateAfter,
    changed,
  };
}

// -------- Main --------

function extractEntryXml(entries: ZipEntryRaw[], name: string): string {
  const e = entries.find((x) => x.name === name);
  if (!e) throw new Error(`Archive entry "${name}" missing`);
  if (e.method !== 8 && e.method !== 0) {
    throw new Error(`Archive entry "${name}" uses unsupported compression method ${e.method}`);
  }
  const buf = e.method === 0 ? e.dataRaw : inflateRawSync(e.dataRaw);
  return buf.toString('utf8');
}

function parseSharedStrings(xml: string): string[] {
  // Shared strings are <si><t>text</t></si> or <si><r>...<t>text</t>...</r></si>.
  // Collect each <si>…</si> and concatenate every <t>…</t> content inside it.
  const strings: string[] = [];
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
  let siMatch: RegExpExecArray | null;
  while ((siMatch = siRe.exec(xml)) !== null) {
    let combined = '';
    let tMatch: RegExpExecArray | null;
    tRe.lastIndex = 0;
    while ((tMatch = tRe.exec(siMatch[1])) !== null) {
      combined += decodeXmlEntities(tMatch[1]);
    }
    strings.push(combined);
  }
  return strings;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function readSharedStringCell(sheetXml: string, strings: string[], cellRef: string): string | undefined {
  // Match <c r="B2" ... t="s" ...><v>IDX</v></c> (attribute order + other attrs allowed).
  const cellRe = new RegExp(
    `<c\\b[^>]*\\br="${cellRef}"[^>]*\\bt="s"[^>]*>[\\s\\S]*?<v>(\\d+)<\\/v>[\\s\\S]*?<\\/c>`,
  );
  const m = cellRe.exec(sheetXml);
  if (!m) return undefined;
  const idx = Number(m[1]);
  return strings[idx];
}

function assertStructure(entries: ZipEntryRaw[]): void {
  const workbookXml = extractEntryXml(entries, WORKBOOK_XML_ENTRY);

  // Expected sheet set and order.
  const sheetTagRe = /<sheet\b[^>]*\bname="([^"]+)"[^>]*\/>/g;
  const sheetNames: string[] = [];
  let sm: RegExpExecArray | null;
  while ((sm = sheetTagRe.exec(workbookXml)) !== null) {
    sheetNames.push(sm[1]);
  }
  const expected = [...EXPECTED_SHEET_NAMES];
  if (sheetNames.length !== expected.length || sheetNames.some((n, i) => n !== expected[i])) {
    throw new Error(
      `Unexpected sheet set: expected ${JSON.stringify(expected)}, got ${JSON.stringify(sheetNames)}`,
    );
  }

  // Defined names present.
  const dnRe = /<definedName\b[^>]*\bname="([^"]+)"[^>]*>/g;
  const presentNames = new Set<string>();
  let dn: RegExpExecArray | null;
  while ((dn = dnRe.exec(workbookXml)) !== null) {
    presentNames.add(dn[1]);
  }
  const missing = REQUIRED_DEFINED_NAMES.filter((n) => !presentNames.has(n));
  if (missing.length > 0) {
    throw new Error(`Required defined names missing: ${missing.join(', ')}`);
  }

  // Marker values at ParserMeta!B2 and !B3.
  const parserMetaSheetXml = extractEntryXml(entries, 'xl/worksheets/sheet3.xml');
  const sharedStringsXml = extractEntryXml(entries, 'xl/sharedStrings.xml');
  const strings = parseSharedStrings(sharedStringsXml);
  const b2 = readSharedStringCell(parserMetaSheetXml, strings, 'B2');
  const b3 = readSharedStringCell(parserMetaSheetXml, strings, 'B3');
  if (b2 !== EXPECTED_TEMPLATE_MARKER) {
    throw new Error(
      `ParserMeta!B2 expected "${EXPECTED_TEMPLATE_MARKER}", got ${JSON.stringify(b2)}`,
    );
  }
  if (b3 !== EXPECTED_CONTRACT_VERSION) {
    throw new Error(
      `ParserMeta!B3 expected "${EXPECTED_CONTRACT_VERSION}", got ${JSON.stringify(b3)}`,
    );
  }
}

function transform(input: Buffer): { output: Buffer; editResult: XmlEditResult } {
  const entries = parseZip(input);

  const workbookIdx = entries.findIndex((e) => e.name === WORKBOOK_XML_ENTRY);
  if (workbookIdx === -1) {
    throw new Error(`Archive is missing ${WORKBOOK_XML_ENTRY}`);
  }
  const workbookEntry = entries[workbookIdx];
  if (workbookEntry.method !== 8) {
    throw new Error(
      `Expected ${WORKBOOK_XML_ENTRY} to be deflate-compressed (method 8), got method ${workbookEntry.method}`,
    );
  }

  // Deserialize, edit, re-serialize — exactly one entry.
  const originalXml = inflateRawSync(workbookEntry.dataRaw);
  const editResult = editWorkbookXml(originalXml);
  const newCompressed = deflateRawSync(editResult.edited, { level: 9 });
  const newCrc = crc32Bytes(editResult.edited);

  // Emit archive.
  const parts: Buffer[] = [];
  const emittedOffsets = new Map<number, number>(); // entry index → local-header offset
  let cursor = 0;

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    emittedOffsets.set(i, cursor);
    if (i === workbookIdx) {
      const newHeader = buildLocalFileHeader(
        e,
        newCompressed,
        newCrc,
        editResult.edited.length,
      );
      parts.push(newHeader);
      parts.push(newCompressed);
      cursor += newHeader.length + newCompressed.length;
    } else {
      // Byte-for-byte passthrough.
      parts.push(e.headerRaw);
      parts.push(e.dataRaw);
      cursor += e.headerRaw.length + e.dataRaw.length;
    }
  }

  const cdOffset = cursor;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const lhOff = emittedOffsets.get(i) ?? 0;
    const cde =
      i === workbookIdx
        ? buildCentralDirectoryEntry(e, newCrc, newCompressed.length, editResult.edited.length, lhOff)
        : buildCentralDirectoryEntry(
            e,
            e.crc32,
            e.compressedSize,
            e.uncompressedSize,
            lhOff,
          );
    parts.push(cde);
    cursor += cde.length;
  }

  const cdSize = cursor - cdOffset;
  const eocd = buildEocd(entries.length, cdSize, cdOffset, readEocdComment(input));
  parts.push(eocd);

  return { output: Buffer.concat(parts), editResult };
}

function verifyOutput(
  originalEntries: ZipEntryRaw[],
  outputBuf: Buffer,
  expectedStateAfter: string,
): void {
  const outEntries = parseZip(outputBuf);
  if (outEntries.length !== originalEntries.length) {
    throw new Error(
      `Post-write verification: entry count drift (in=${originalEntries.length}, out=${outEntries.length})`,
    );
  }
  const origByName = new Map(originalEntries.map((e) => [e.name, e]));
  for (const out of outEntries) {
    const inp = origByName.get(out.name);
    if (!inp) throw new Error(`Post-write verification: entry "${out.name}" was added`);
    if (out.name === WORKBOOK_XML_ENTRY) continue;
    if (!out.headerRaw.equals(inp.headerRaw)) {
      throw new Error(
        `Post-write verification: raw local-file-header bytes drifted for "${out.name}"`,
      );
    }
    if (!out.dataRaw.equals(inp.dataRaw)) {
      throw new Error(
        `Post-write verification: raw compressed-data bytes drifted for "${out.name}"`,
      );
    }
  }

  const wbEntry = outEntries.find((e) => e.name === WORKBOOK_XML_ENTRY);
  if (!wbEntry) throw new Error('Post-write verification: xl/workbook.xml missing from output');
  const xml = inflateRawSync(wbEntry.dataRaw).toString('utf8');
  const at = ACTIVE_TAB_RE.exec(xml)?.[1];
  if (at !== '0') {
    throw new Error(`Post-write verification: activeTab is ${JSON.stringify(at)}, expected "0"`);
  }
  const sm = PARSER_META_SHEET_OPEN_RE.exec(xml);
  if (!sm) throw new Error('Post-write verification: ParserMeta <sheet> element missing from output');
  const state = sm.groups?.state ?? '';
  if (state !== expectedStateAfter) {
    throw new Error(
      `Post-write verification: ParserMeta state is ${JSON.stringify(state)}, expected ${JSON.stringify(expectedStateAfter)}`,
    );
  }
}

function main(): number {
  const argPath = process.argv[2];
  const inputPath = resolve(process.cwd(), argPath ?? DEFAULT_WORKBOOK_PATH);
  const input = readFileSync(inputPath);

  const inputEntries = parseZip(input);
  assertStructure(inputEntries);

  const { output, editResult } = transform(input);

  verifyOutput(inputEntries, output, editResult.parserMetaStateAfter);

  const tmpPath = `${inputPath}.tmp`;
  writeFileSync(tmpPath, output);
  renameSync(tmpPath, inputPath);

  if (editResult.changed) {
    console.log(
      `ok: ${inputPath}\n  activeTab: ${editResult.activeTabBefore} -> ${editResult.activeTabAfter}\n  ParserMeta.state: ${JSON.stringify(editResult.parserMetaStateBefore)} -> ${JSON.stringify(editResult.parserMetaStateAfter)}`,
    );
  } else {
    console.log(
      `ok: ${inputPath} — already closed (no-op: activeTab=${editResult.activeTabBefore}, ParserMeta.state=${JSON.stringify(editResult.parserMetaStateBefore)})`,
    );
  }
  return 0;
}

try {
  process.exit(main());
} catch (err) {
  console.error('error:', err instanceof Error ? err.message : err);
  process.exit(1);
}
