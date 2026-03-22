import type {
  AnchorType,
  IFieldAnnotation,
  IAnnotationReply,
  IRawAnnotationListItem,
  ICreateAnnotationInput,
  IAddReplyInput,
  IResolveAnnotationInput,
  IWithdrawAnnotationInput,
} from '../types/IFieldAnnotation';
import { ANNOTATION_API_BASE } from '../constants/annotationDefaults';

// ─────────────────────────────────────────────────────────────────────────────
// Internal fetch helper
// ─────────────────────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${ANNOTATION_API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`AnnotationApi error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapper: raw SharePoint list item → IFieldAnnotation (D-01)
// ─────────────────────────────────────────────────────────────────────────────

function mapListItemToAnnotation(raw: IRawAnnotationListItem): IFieldAnnotation {
  let replies: IAnnotationReply[] = [];
  try {
    replies = raw.RepliesJson ? (JSON.parse(raw.RepliesJson) as IAnnotationReply[]) : [];
  } catch {
    replies = [];
  }

  return {
    annotationId: raw.AnnotationId,
    recordType: raw.RecordType,
    recordId: raw.RecordId,
    fieldKey: raw.FieldKey,
    fieldLabel: raw.FieldLabel,
    anchorType: (raw.AnchorType as AnchorType) ?? 'field',
    intent: raw.Intent,
    status: raw.Status,
    author: {
      userId: raw.AuthorId,
      displayName: raw.AuthorName,
      role: raw.AuthorRole,
    },
    assignedTo:
      raw.AssignedToId && raw.AssignedToName && raw.AssignedToRole
        ? {
            userId: raw.AssignedToId,
            displayName: raw.AssignedToName,
            role: raw.AssignedToRole,
          }
        : null,
    body: raw.Body,
    createdAt: raw.CreatedAt,
    createdAtVersion: raw.CreatedAtVersion ?? null,
    resolvedAt: raw.ResolvedAt ?? null,
    resolvedBy:
      raw.ResolvedById && raw.ResolvedByName && raw.ResolvedByRole
        ? {
            userId: raw.ResolvedById,
            displayName: raw.ResolvedByName,
            role: raw.ResolvedByRole,
          }
        : null,
    resolutionNote: raw.ResolutionNote ?? null,
    resolvedAtVersion: raw.ResolvedAtVersion ?? null,
    replies,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AnnotationApi — public surface consumed by hooks
// ─────────────────────────────────────────────────────────────────────────────

export const AnnotationApi = {
  /**
   * List all annotations for a record, optionally filtered by fieldKey and status.
   *
   * @param recordType - Record type namespace (e.g., 'bd-scorecard')
   * @param recordId   - Parent record UUID
   * @param options    - Optional filters: fieldKey, status
   */
  async list(
    recordType: string,
    recordId: string,
    options?: { fieldKey?: string; status?: 'open' | 'resolved' | 'all' }
  ): Promise<IFieldAnnotation[]> {
    const params = new URLSearchParams({ recordType, recordId });
    if (options?.fieldKey) params.set('fieldKey', options.fieldKey);
    if (options?.status) params.set('status', options.status);

    const raw = await apiFetch<IRawAnnotationListItem[]>(`?${params.toString()}`);
    return raw.map(mapListItemToAnnotation);
  },

  /**
   * Fetch a single annotation by ID.
   */
  async get(annotationId: string): Promise<IFieldAnnotation> {
    const raw = await apiFetch<IRawAnnotationListItem>(`/${annotationId}`);
    return mapListItemToAnnotation(raw);
  },

  /**
   * Create a new annotation on a specific field (D-02, D-08).
   */
  async create(input: ICreateAnnotationInput): Promise<IFieldAnnotation> {
    const raw = await apiFetch<IRawAnnotationListItem>('', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return mapListItemToAnnotation(raw);
  },

  /**
   * Add a flat reply to an existing annotation thread (D-07).
   * Throws if the reply cap (50) has been reached on the server.
   */
  async addReply(input: IAddReplyInput): Promise<IAnnotationReply> {
    const reply = await apiFetch<IAnnotationReply>(
      `/${input.annotationId}/replies`,
      {
        method: 'POST',
        body: JSON.stringify({ body: input.body }),
      }
    );
    return reply;
  },

  /**
   * Resolve an annotation, optionally with a resolution note (D-08).
   */
  async resolve(input: IResolveAnnotationInput): Promise<IFieldAnnotation> {
    const raw = await apiFetch<IRawAnnotationListItem>(
      `/${input.annotationId}/resolve`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          resolutionNote: input.resolutionNote ?? null,
          resolvedAtVersion: input.resolvedAtVersion ?? null,
        }),
      }
    );
    return mapListItemToAnnotation(raw);
  },

  /**
   * Withdraw an annotation (retract by original author before resolution).
   * Triggers Watch-tier notification to previous assignee if one exists (D-08).
   */
  async withdraw(input: IWithdrawAnnotationInput): Promise<IFieldAnnotation> {
    const raw = await apiFetch<IRawAnnotationListItem>(
      `/${input.annotationId}/withdraw`,
      { method: 'PATCH' }
    );
    return mapListItemToAnnotation(raw);
  },
} as const;

export type IAnnotationApi = typeof AnnotationApi;
