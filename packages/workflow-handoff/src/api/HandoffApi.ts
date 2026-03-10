import type {
  IHandoffPackage,
  IHandoffDocument,
  IHandoffContextNote,
  IRawHandoffListItem,
} from '../types/IWorkflowHandoff';
import { HANDOFF_API_BASE } from '../constants/handoffDefaults';

// ─────────────────────────────────────────────────────────────────────────────
// Internal fetch helper
// ─────────────────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${HANDOFF_API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HandoffApi error ${response.status}: ${text}`);
  }
  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper: raw list item → IHandoffPackage (D-01)
// ─────────────────────────────────────────────────────────────────────────────

function mapListItem<TSource, TDest>(raw: IRawHandoffListItem): IHandoffPackage<TSource, TDest> {
  let sourceSnapshot: TSource;
  try {
    sourceSnapshot = JSON.parse(raw.SourceSnapshotJson) as TSource;
  } catch {
    // Snapshot stored in file — HandoffApi.get handles file fetch transparently (D-01)
    sourceSnapshot = {} as TSource;
  }

  let destinationSeedData: Partial<TDest> = {};
  try {
    destinationSeedData = JSON.parse(raw.DestinationSeedDataJson) as Partial<TDest>;
  } catch { /* empty */ }

  let documents: IHandoffDocument[] = [];
  try {
    documents = JSON.parse(raw.DocumentsJson) as IHandoffDocument[];
  } catch { /* empty */ }

  let contextNotes: IHandoffContextNote[] = [];
  try {
    contextNotes = JSON.parse(raw.ContextNotesJson) as IHandoffContextNote[];
  } catch { /* empty */ }

  return {
    handoffId: raw.HandoffId,
    sourceModule: raw.SourceModule,
    sourceRecordType: raw.SourceRecordType,
    sourceRecordId: raw.SourceRecordId,
    destinationModule: raw.DestinationModule,
    destinationRecordType: raw.DestinationRecordType,
    sourceSnapshot,
    destinationSeedData,
    documents,
    contextNotes,
    sender: {
      userId: raw.SenderUserId,
      displayName: raw.SenderDisplayName,
      role: raw.SenderRole,
    },
    recipient: {
      userId: raw.RecipientUserId,
      displayName: raw.RecipientDisplayName,
      role: raw.RecipientRole,
    },
    status: raw.Status,
    sentAt: raw.SentAt ?? null,
    acknowledgedAt: raw.AcknowledgedAt ?? null,
    rejectedAt: raw.RejectedAt ?? null,
    rejectionReason: raw.RejectionReason ?? null,
    createdDestinationRecordId: raw.CreatedDestinationRecordId ?? null,
    createdAt: raw.CreatedAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HandoffApi — public surface
// ─────────────────────────────────────────────────────────────────────────────

export const HandoffApi = {
  /**
   * Create a new handoff package in `draft` status.
   * The package is assembled by `usePrepareHandoff` before calling this.
   */
  async create<TSource, TDest>(
    input: Omit<IHandoffPackage<TSource, TDest>,
      'handoffId' | 'status' | 'sentAt' | 'acknowledgedAt' | 'rejectedAt' |
      'rejectionReason' | 'createdDestinationRecordId' | 'createdAt'>
  ): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>('', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Get a single handoff package by ID.
   * When SourceSnapshotFileUrl is set, the Function fetches the file and inlines it (D-01).
   * When documents exist, HandoffApi checks @hbc/sharepoint-docs URL migration map (D-06).
   */
  async get<TSource, TDest>(handoffId: string): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}`);
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * List pending handoff packages for the current user as recipient.
   * Returns only `sent` and `received` status packages.
   */
  async inbox<TSource = unknown, TDest = unknown>(): Promise<IHandoffPackage<TSource, TDest>[]> {
    const items = await apiFetch<IRawHandoffListItem[]>('/inbox');
    return items.map((raw) => mapListItem<TSource, TDest>(raw));
  },

  /**
   * List outbound handoff packages for the current user as sender.
   * Returns all statuses for status tracking.
   */
  async outbox<TSource = unknown, TDest = unknown>(): Promise<IHandoffPackage<TSource, TDest>[]> {
    const items = await apiFetch<IRawHandoffListItem[]>('/outbox');
    return items.map((raw) => mapListItem<TSource, TDest>(raw));
  },

  /**
   * Transmit the handoff package (draft → sent) (D-02, D-05).
   * Azure Function: fires Immediate notification to recipient; BIC update signal available.
   */
  async send<TSource, TDest>(handoffId: string): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/send`, { method: 'POST' });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Mark the package as received (sent → received) (D-02).
   * Called automatically when the recipient opens the package in HbcHandoffReceiver.
   * No notification fired — this is an implicit state transition.
   */
  async markReceived<TSource, TDest>(handoffId: string): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/receive`, { method: 'POST' });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Acknowledge the handoff (received → acknowledged) (D-02, D-05).
   * Azure Function calls the consuming module's onAcknowledged handler server-side.
   * Returns updated package with createdDestinationRecordId set.
   */
  async acknowledge<TSource, TDest>(handoffId: string): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/acknowledge`, { method: 'POST' });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Reject the handoff (received → rejected) (D-07).
   * rejectionReason is required. Azure Function calls onRejected handler.
   * Terminal state — rejected packages cannot transition further (D-07).
   */
  async reject<TSource, TDest>(
    handoffId: string,
    rejectionReason: string
  ): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejectionReason }),
    });
    return mapListItem<TSource, TDest>(raw);
  },

  /**
   * Update context notes on a draft or sent package (sender only).
   * Notes can be edited after sending but before acknowledgment.
   */
  async updateContextNotes<TSource, TDest>(
    handoffId: string,
    contextNotes: IHandoffContextNote[]
  ): Promise<IHandoffPackage<TSource, TDest>> {
    const raw = await apiFetch<IRawHandoffListItem>(`/${handoffId}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ contextNotes }),
    });
    return mapListItem<TSource, TDest>(raw);
  },
} as const;

export type IHandoffApi = typeof HandoffApi;
