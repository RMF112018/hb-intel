/**
 * Wave 1 G2 gate — SharePoint Lookup payload contract test.
 *
 * Drives `SharePointSafetyInspectionRepository` against a fake `SpHttpClient`
 * and asserts every Lookup-field write payload carries the numeric parent
 * `spItemId`, never a stringified business id. Also proves:
 * - uploads land on /sites/Safety
 * - structured writes land on /sites/HBCentral
 * - reference descriptors are GUID-bound (no residual `getbytitle('Projects')`)
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SharePointSafetyInspectionRepository } from './SharePointSafetyInspectionRepository.js';
import type { SpHttpClient } from './spHttp.js';
import {
  configureSafetyListGuids,
  resetSafetyListGuidOverlay,
} from '../../lists/guidConfig.js';

const PROJECTS_GUID = '11111111-1111-1111-1111-111111111111';
const LEGACY_GUID = '22222222-2222-2222-2222-222222222222';
const REPORTING_GUID = '33333333-3333-3333-3333-333333333333';
const PW_GUID = '44444444-4444-4444-4444-444444444444';
const IE_GUID = '55555555-5555-5555-5555-555555555555';
const FD_GUID = '66666666-6666-6666-6666-666666666666';
const RUN_GUID = '77777777-7777-7777-7777-777777777777';
const UPLOAD_GUID = '88888888-8888-8888-8888-888888888888';

interface RecordedCall {
  readonly method: 'GET' | 'POST';
  readonly url: string;
  readonly body?: unknown;
}

function makeFakeClient(): {
  client: SpHttpClient;
  calls: RecordedCall[];
} {
  const calls: RecordedCall[] = [];
  let postCounter = 100;

  const respondJson = (payload: unknown, status = 200): Response =>
    ({
      ok: status < 400,
      status,
      json: async () => payload,
      text: async () => JSON.stringify(payload),
      arrayBuffer: async () => new ArrayBuffer(0),
    }) as unknown as Response;

  const client: SpHttpClient = {
    get: async (url) => {
      calls.push({ method: 'GET', url });

      if (url.includes("lists(guid'" + PROJECTS_GUID + "')/items")) {
        return respondJson({
          value: [
            {
              Id: 500,
              ProjectNumber: '2024-118',
              ProjectName: 'Riverside',
              ProjectLocation: 'WPB',
              ProjectStage: 'Construction',
            },
          ],
        });
      }
      if (url.includes("lists(guid'" + LEGACY_GUID + "')/items")) {
        return respondJson({ value: [] });
      }
      if (url.includes("lists(guid'" + IE_GUID + "')/items")) {
        return respondJson({ value: [] });
      }
      if (url.includes('/Files/add')) {
        return respondJson({ ServerRelativeUrl: '/sites/Safety/SafetyChecklistUploads/x.xlsx' });
      }
      if (url.includes('/ListItemAllFields')) {
        return respondJson({ Id: 77 });
      }
      return respondJson({ value: [] });
    },
    post: async (url, body) => {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      calls.push({ method: 'POST', url, body: parsed });

      if (url.includes('/Files/add')) {
        return respondJson({
          ServerRelativeUrl: '/sites/Safety/SafetyChecklistUploads/x.xlsx',
          ListItemAllFields: { Id: 77 },
        });
      }
      postCounter += 1;
      return respondJson({ Id: postCounter });
    },
  };

  return { client, calls };
}

async function setupRepo() {
  configureSafetyListGuids({
    SafetyReportingPeriods: REPORTING_GUID,
    SafetyProjectWeekRecords: PW_GUID,
    SafetyInspectionEvents: IE_GUID,
    SafetyFindings: FD_GUID,
    SafetyIngestionRuns: RUN_GUID,
    SafetyChecklistUploads: UPLOAD_GUID,
    Projects: PROJECTS_GUID,
    LegacyProjectFallbackRegistry: LEGACY_GUID,
  });
  const { client, calls } = makeFakeClient();
  const repo = new SharePointSafetyInspectionRepository({ client });
  return { repo, calls };
}

async function invokeIngest(
  repo: SharePointSafetyInspectionRepository,
  reportingPeriodSpItemId = 1001,
): Promise<void> {
  // Build a real .xlsx buffer in-test so `ingestWorkbook` exercises the full
  // upload → parse → validate → score → commit → run path end-to-end.
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  // Mirror the anchors required by validateTemplate and extractMetadata.
  // Build a tiny ScoreCard with all anchors populated.
  const scoreSheet = XLSX.utils.aoa_to_sheet([] as string[][]);
  // Force specific anchor cells:
  scoreSheet['A1'] = { v: 'Construction Site Safety Walk Checklist (Field Form)', t: 's' };
  scoreSheet['A3'] = { v: 'Date', t: 's' };
  scoreSheet['B3'] = { v: '2026-04-22', t: 's' };
  scoreSheet['D3'] = { v: 'Insp #.', t: 's' };
  scoreSheet['E3'] = { v: '1', t: 's' };
  scoreSheet['F3'] = { v: 'Summary (auto)', t: 's' };
  scoreSheet['A4'] = { v: 'Project/Site', t: 's' };
  scoreSheet['B4'] = { v: '2024-118 Riverside', t: 's' };
  scoreSheet['F4'] = { v: 'Total Yes', t: 's' };
  scoreSheet['F5'] = { v: 'Total No', t: 's' };
  scoreSheet['F6'] = { v: 'Total N/A', t: 's' };
  scoreSheet['F7'] = { v: 'Safety Score %', t: 's' };
  scoreSheet['A9'] = { v: 'Item', t: 's' };
  scoreSheet['B9'] = { v: 'Yes', t: 's' };
  scoreSheet['C9'] = { v: 'No', t: 's' };
  scoreSheet['D9'] = { v: 'N/A', t: 's' };
  scoreSheet['E9'] = { v: 'Notes', t: 's' };
  scoreSheet['F9'] = { v: 'Score', t: 's' };
  scoreSheet['G9'] = { v: 'Inspection Flag', t: 's' };
  // Populate section headers + a single "yes" mark per displayed row so the
  // parser classifies every row as yes.
  const SECTIONS_META: Array<{ header: number; name: string; rows: number[] }> = [
    { header: 10, name: '1. General Site Conditions', rows: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
    { header: 22, name: '2. Emergency & Fire Preparedness', rows: [23, 24, 25, 26, 27] },
    { header: 29, name: '3. PPE & Worker Compliance', rows: [30, 31, 32, 33, 34, 35, 36, 37] },
    { header: 39, name: '4. Fall Protection & Openings', rows: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49] },
    { header: 51, name: '5. Ladders & Scaffolds', rows: [52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63] },
    { header: 65, name: '6. Electrical & Temporary Power', rows: [66, 67, 68, 69, 70, 71, 72, 73] },
    { header: 75, name: '7. Hot Work & Fire Risk Controls', rows: [76, 77, 78, 79, 80, 81] },
    { header: 83, name: '8. Material Handling & Storage', rows: [84, 85, 86, 87, 88, 89] },
    { header: 91, name: '9. Equipment & Mobile Plant', rows: [92, 93, 94, 95, 96, 97, 98, 99, 100] },
    { header: 102, name: '10. Excavations & Ground Disturbance', rows: [103, 104, 105, 106, 107, 108] },
    { header: 110, name: '11. Environmental & Health', rows: [111, 112, 113, 114, 115, 116, 117] },
    { header: 119, name: '12. Behavioral / Work Practices', rows: [120, 121, 122, 123, 124] },
  ];
  for (const section of SECTIONS_META) {
    scoreSheet[`A${section.header}`] = { v: section.name, t: 's' };
    for (const row of section.rows) {
      scoreSheet[`A${row}`] = { v: `Item ${row}`, t: 's' };
      if (row === 44) {
        // Flip row 44 to "No" so the pipeline emits one Finding row — the
        // contract test asserts the Finding POST carries numeric Lookup IDs.
        scoreSheet[`C${row}`] = { v: 'X', t: 's' };
      } else {
        scoreSheet[`B${row}`] = { v: 'X', t: 's' };
      }
    }
  }
  scoreSheet['!ref'] = 'A1:G142';

  const weights = XLSX.utils.aoa_to_sheet([
    ['Num', 'Section', 'Weight', 'Rationale'],
    [1, '1. General Site Conditions', 0.03, 'x'],
    [2, '2. Emergency & Fire Preparedness', 0.03, 'x'],
    [3, '3. PPE & Worker Compliance', 0.08, 'x'],
    [4, '4. Fall Protection & Openings', 0.18, 'x'],
    [5, '5. Ladders & Scaffolds', 0.14, 'x'],
    [6, '6. Electrical & Temporary Power', 0.10, 'x'],
    [7, '7. Hot Work & Fire Risk Controls', 0.07, 'x'],
    [8, '8. Material Handling & Storage', 0.04, 'x'],
    [9, '9. Equipment & Mobile Plant', 0.12, 'x'],
    [10, '10. Excavations & Ground Disturbance', 0.12, 'x'],
    [11, '11. Environmental & Health', 0.02, 'x'],
    [12, '12. Behavioral / Work Practices', 0.07, 'x'],
  ]);

  XLSX.utils.book_append_sheet(wb, scoreSheet, 'ScoreCard');
  XLSX.utils.book_append_sheet(wb, weights, 'ScoringWeights');
  const arr = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;

  const fakeBlob = new Blob([arr]);
  await repo.ingestWorkbook(fakeBlob, {
    uploadedByUpn: 'coordinator@example.com',
    uploadedAt: new Date().toISOString(),
    fileName: 'contract.xlsx',
    reportingPeriodId: `period-${reportingPeriodSpItemId}`,
    reportingPeriodSpItemId,
  });
}

describe('SharePoint adapter Lookup payload contract (W1 G2)', () => {
  beforeEach(() => resetSafetyListGuidOverlay());
  afterEach(() => resetSafetyListGuidOverlay());

  it('writes numeric spItemId on every Lookup field and routes writes to the correct site', async () => {
    const { repo, calls } = await setupRepo();
    await invokeIngest(repo, 1001);

    // Find the Inspection Event POST
    const iePost = calls.find(
      (c) =>
        c.method === 'POST' &&
        c.url.includes(`lists(guid'${IE_GUID}')/items`) &&
        !c.url.includes(')/items('),
    );
    expect(iePost, 'inspection-event POST must occur').toBeTruthy();
    const ieBody = iePost!.body as Record<string, unknown>;
    expect(typeof ieBody.ReportingPeriodId).toBe('number');
    expect(ieBody.ReportingPeriodId).toBe(1001);
    expect(typeof ieBody.ProjectWeekRecordId).toBe('number');

    // Find the Finding POST(s) — the single flipped `No` row should produce one finding
    const fdPosts = calls.filter(
      (c) =>
        c.method === 'POST' &&
        c.url.includes(`lists(guid'${FD_GUID}')/items`) &&
        !c.url.includes(')/items('),
    );
    expect(fdPosts.length).toBeGreaterThan(0);
    for (const fd of fdPosts) {
      const fdBody = fd.body as Record<string, unknown>;
      expect(typeof fdBody.InspectionEventId).toBe('number');
      expect(typeof fdBody.ProjectWeekRecordId).toBe('number');
    }

    // Project-Week Record POST (create) carries numeric ReportingPeriodId
    const pwPost = calls.find(
      (c) =>
        c.method === 'POST' &&
        c.url.includes(`lists(guid'${PW_GUID}')/items`) &&
        !c.url.includes(')/items('),
    );
    expect(pwPost, 'project-week POST must occur').toBeTruthy();
    expect((pwPost!.body as Record<string, unknown>).ReportingPeriodId).toBe(1001);
  });

  it('uploads to /sites/Safety and writes structured records to /sites/HBCentral', async () => {
    const { repo, calls } = await setupRepo();
    await invokeIngest(repo, 1001);

    const uploadCall = calls.find((c) => c.url.includes('/Files/add'));
    expect(uploadCall?.url).toContain('/sites/Safety');
    expect(uploadCall?.url).not.toContain('/sites/HBCentral');

    const ieCall = calls.find(
      (c) => c.method === 'POST' && c.url.includes(`lists(guid'${IE_GUID}')/items`),
    );
    expect(ieCall?.url).toContain('/sites/HBCentral');
    expect(ieCall?.url).not.toContain('/sites/Safety/');
  });

  it('resolves Projects via GUID binding, not getbytitle', async () => {
    const { repo, calls } = await setupRepo();
    await invokeIngest(repo, 1001);

    const projectsLookup = calls.find(
      (c) => c.method === 'GET' && c.url.includes(`lists(guid'${PROJECTS_GUID}')`),
    );
    expect(projectsLookup, 'Projects query via GUID must occur').toBeTruthy();
    const anyGetByTitle = calls.find((c) => c.url.includes("getbytitle('Projects')"));
    expect(anyGetByTitle, 'no residual getbytitle(\'Projects\') call').toBeFalsy();
    const anyLegacyGetByTitle = calls.find((c) =>
      c.url.includes("getbytitle('Legacy Project Fallback Registry')"),
    );
    expect(anyLegacyGetByTitle).toBeFalsy();
  });

  it('ingestion-run POST carries all required audit fields', async () => {
    const { repo, calls } = await setupRepo();
    await invokeIngest(repo, 1001);

    const runPost = calls.find(
      (c) =>
        c.method === 'POST' &&
        c.url.includes(`lists(guid'${RUN_GUID}')/items`) &&
        !c.url.includes(')/items('),
    );
    expect(runPost, 'ingestion-run POST must occur').toBeTruthy();
    const body = runPost!.body as Record<string, unknown>;
    expect(body.TerminalStatus).toBe('committed');
    expect(body.SourceUploadItemId).toBe(77);
    expect(body.Checksum).toBeTruthy();
  });
});
