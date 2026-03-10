import type {
  ISeedBatchResult,
  ISeedHistoryEntry,
  IRawSeedListItem,
  ISeedValidationError,
} from '../types';
import { SEED_API_BASE } from '../constants';

type FetchFn = typeof fetch;

let _fetch: FetchFn = globalThis.fetch;

/**
 * Allows injection of a custom fetch function (e.g., authenticated fetch)
 * in consuming modules or tests.
 */
export function configureSeedApiFetch(fetchFn: FetchFn): void {
  _fetch = fetchFn;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await _fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => response.statusText);
    throw new Error(`SeedApi request failed [${response.status}]: ${body}`);
  }

  return response.json() as Promise<T>;
}

// ─── Response shapes from Azure Functions ────────────────────────────────────

interface IBatchImportRequest {
  recordType: string;
  rows: Record<string, unknown>[];
  importId: string;
  batchIndex: number;
}

interface IStreamingParseRequest {
  format: 'xlsx' | 'csv' | 'json' | 'procore-export';
  documentId: string;  // SharePoint document ID of the already-uploaded file (D-06)
}

interface IStreamingParseResponse {
  headers: string[];
  rows: Record<string, string>[];
  rowCount: number;
}

interface IImportCompleteRequest {
  importId: string;
  recordType: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  skippedCount: number;
  errors: ISeedValidationError[];
  importedAt: string;
  importedBy: string;
  importedByName: string;
  sourceDocumentId: string;
  sourceDocumentUrl: string;
  sourceFileName: string;
  errorReportDocumentId?: string;
  errorReportDocumentUrl?: string;
}

// ─── SeedApi ─────────────────────────────────────────────────────────────────

export const SeedApi = {
  /**
   * Imports a batch of transformed rows to the target module's record store.
   *
   * D-05: Called in a loop by useSeedImport; one call per batch of batchSize rows.
   * The Azure Function upserts each row via the target module's data API.
   *
   * @param request.recordType   - Target record type (e.g., 'bd-lead')
   * @param request.rows         - Batch of transformed destination record objects
   * @param request.importId     - Import session GUID (consistent across all batches)
   * @param request.batchIndex   - 0-based batch index (for progress tracking)
   */
  async importBatch(request: IBatchImportRequest): Promise<ISeedBatchResult> {
    return apiFetch<ISeedBatchResult>(`${SEED_API_BASE}/batch`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Parses a large file (≥ SEED_LARGE_FILE_THRESHOLD_BYTES) on the server.
   *
   * D-01: The file must have already been uploaded to SharePoint by
   * DocumentApi.uploadToSystemContext() before calling this method.
   * The Azure Function downloads the file from SharePoint and returns
   * the parsed rows to the client.
   */
  async parseStreaming(request: IStreamingParseRequest): Promise<IStreamingParseResponse> {
    return apiFetch<IStreamingParseResponse>(`${SEED_API_BASE}/parse`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Records the final import result to the HBC_SeedImports SharePoint list.
   * Called once per import session after all batches complete.
   * Also triggers the completion notification (D-07 via Azure Function).
   */
  async recordCompletion(request: IImportCompleteRequest): Promise<{ importId: string }> {
    return apiFetch<{ importId: string }>(`${SEED_API_BASE}/complete`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Retrieves import history for a record type, newest first.
   * Powers useSeedHistory.
   */
  async getHistory(recordType: string): Promise<ISeedHistoryEntry[]> {
    const params = new URLSearchParams({ recordType });
    const raw = await apiFetch<IRawSeedListItem[]>(
      `${SEED_API_BASE}/history?${params.toString()}`
    );
    return raw.map(mapListItemToHistoryEntry);
  },

  /**
   * Retrieves a single import record by importId.
   */
  async getImport(importId: string): Promise<ISeedHistoryEntry> {
    const raw = await apiFetch<IRawSeedListItem>(
      `${SEED_API_BASE}/history/${importId}`
    );
    return mapListItemToHistoryEntry(raw);
  },

  /**
   * Returns a signed download URL for the CSV error report associated
   * with an import, if one was generated (D-04 partial import).
   *
   * @returns The SharePoint URL of the error report document, or null if none.
   */
  async getErrorReportUrl(importId: string): Promise<string | null> {
    const entry = await SeedApi.getImport(importId);
    return entry.sourceDocumentUrl ?? null; // Uses error report URL in the entry
  },
};

// ─── Mapping ─────────────────────────────────────────────────────────────────

function mapListItemToHistoryEntry(item: IRawSeedListItem): ISeedHistoryEntry {
  return {
    importId: item.ImportId,
    recordType: item.RecordType,
    status: item.Status as ISeedHistoryEntry['status'],
    totalRows: item.TotalRows,
    successCount: item.SuccessCount,
    errorCount: item.ErrorCount,
    importedAt: item.ImportedAt,
    importedBy: item.ImportedBy,
    importedByName: item.ImportedByName,
    sourceDocumentId: item.SourceDocumentId,
    sourceDocumentUrl: item.SourceDocumentUrl,
    sourceFileName: item.SourceFileName,
  };
}
