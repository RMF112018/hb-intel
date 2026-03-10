import type { IParseResult } from './XlsxParser';
import { SEED_LARGE_FILE_THRESHOLD_BYTES } from '../constants';

/**
 * Shape of a Procore project JSON export.
 * Only the fields required for Project Hub seeding are mapped.
 * All other fields in the export are ignored.
 *
 * This interface reflects the Procore REST API project export format (D-08).
 * See Procore API docs for the full schema: https://developers.procore.com/
 */
export interface IProcoreProjectExport {
  projects: IProcoreProject[];
}

export interface IProcoreProject {
  id: number;
  name: string;
  display_name?: string;
  project_number?: string;
  status: string;
  start_date?: string;       // YYYY-MM-DD
  completion_date?: string;  // YYYY-MM-DD
  value?: string;
  address?: string;
  city?: string;
  state_code?: string;
  owner_name?: string;
  project_manager?: { id: number; name: string };
  superintendent?: { id: number; name: string };
  custom_fields?: Record<string, unknown>;
}

/**
 * Normalized Project Hub row after Procore export parsing.
 * This is the TSource type for `projectHubImportConfig`.
 */
export interface IProcoreProjectRow extends Record<string, string> {
  procoreId: string;
  projectName: string;
  projectNumber: string;
  status: string;
  startDate: string;
  completionDate: string;
  contractValue: string;
  address: string;
  city: string;
  stateCode: string;
  ownerName: string;
  projectManagerName: string;
  superintendentName: string;
}

/**
 * Parses Procore project JSON export files into normalized row arrays.
 *
 * D-08: ProcoreExportParser is a first-class parser for Project Hub onboarding.
 *
 * Detection: If the parsed JSON has a top-level `projects` array with objects
 * containing an `id` and `name` field, it is treated as a Procore export.
 * Otherwise, a `ProcoreFormatError` is thrown.
 */
export const ProcoreExportParser = {
  /**
   * Returns true if the parsed JSON appears to be a Procore project export.
   * Used by the format detection logic in useSeedImport.
   */
  isProcoreExport(parsed: unknown): parsed is IProcoreProjectExport {
    return (
      typeof parsed === 'object' &&
      parsed !== null &&
      'projects' in parsed &&
      Array.isArray((parsed as IProcoreProjectExport).projects) &&
      (parsed as IProcoreProjectExport).projects.length > 0 &&
      typeof (parsed as IProcoreProjectExport).projects[0].id === 'number' &&
      typeof (parsed as IProcoreProjectExport).projects[0].name === 'string'
    );
  },

  async parse(file: File): Promise<IParseResult<IProcoreProjectRow>> {
    if (file.size >= SEED_LARGE_FILE_THRESHOLD_BYTES) {
      return {
        headers: [],
        rows: [],
        format: 'procore-export',
        fileSizeBytes: file.size,
        rowCount: 0,
        parsedOnServer: true,
      };
    }

    const text = await file.text();
    let parsed: unknown;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(
        'Invalid JSON file. Please check that the file is a valid Procore export.'
      );
    }

    if (!ProcoreExportParser.isProcoreExport(parsed)) {
      throw new Error(
        'This JSON file does not appear to be a Procore project export. ' +
        'Expected an object with a "projects" array. ' +
        'If this is a different format, try uploading as Excel or CSV instead.'
      );
    }

    const rows: IProcoreProjectRow[] = parsed.projects.map((p) => ({
      procoreId: String(p.id),
      projectName: p.display_name ?? p.name,
      projectNumber: p.project_number ?? '',
      status: p.status ?? '',
      startDate: p.start_date ?? '',
      completionDate: p.completion_date ?? '',
      contractValue: p.value ?? '',
      address: p.address ?? '',
      city: p.city ?? '',
      stateCode: p.state_code ?? '',
      ownerName: p.owner_name ?? '',
      projectManagerName: p.project_manager?.name ?? '',
      superintendentName: p.superintendent?.name ?? '',
    }));

    const headers: Array<keyof IProcoreProjectRow> = [
      'procoreId', 'projectName', 'projectNumber', 'status',
      'startDate', 'completionDate', 'contractValue', 'address',
      'city', 'stateCode', 'ownerName', 'projectManagerName', 'superintendentName',
    ];

    return {
      headers: headers as string[],
      rows,
      format: 'procore-export',
      fileSizeBytes: file.size,
      rowCount: rows.length,
      parsedOnServer: false,
    };
  },
};

export class ProcoreFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProcoreFormatError';
  }
}
