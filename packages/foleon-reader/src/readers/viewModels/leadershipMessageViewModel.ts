/**
 * Leadership Message lane — pure view-model helpers.
 *
 * Does not import FoleonReaderViewModel (circular-dependency guardrail).
 * Imports only `FoleonContentRecord` plus locally defined input contracts.
 */

import type { FoleonContentRecord } from '../../types/foleon-content.types.js';

// ---------------------------------------------------------------------------
// Viewer target input — minimal surface for CTA derivation (no URL policy).
// Parent maps from FoleonViewerTarget at the adapter boundary.
// ---------------------------------------------------------------------------

export interface LeadershipViewerTargetInput {
  readonly source: 'preview' | 'active-record' | 'archive' | 'manual';
  readonly renderMode: 'iframe' | 'preview';
  readonly canOpen: boolean;
  readonly disabledReason?:
    | 'no-embed-url'
    | 'embed-not-allowed'
    | 'requires-external-open'
    | 'preview-only'
    | 'unknown';
}

export type LeadershipMessageCtaKind = 'preview' | 'live' | 'external' | 'blocked';

export interface LeadershipMessageCta {
  readonly kind: LeadershipMessageCtaKind;
  readonly primaryLabel: string;
  readonly secondaryLabel?: string;
  readonly disabledReason?: LeadershipViewerTargetInput['disabledReason'];
}

export interface LeadershipMessageContextItem {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

/**
 * Normalized Leadership slice — teaser-first; full article body lives in Foleon only.
 */
export interface LeadershipMessageLaneModel {
  readonly laneLabel: string;
  readonly statusLabel: string;
  readonly headline: string;
  readonly teaser?: string;
  /** Present only when carried by schema — never fabricated. */
  readonly byline?: string;
  readonly role?: string;
  /** Only when a dedicated schema field exists; never derived from summary. */
  readonly pullQuote?: string;
  readonly contextNotes?: readonly LeadershipMessageContextItem[];
  readonly cta: LeadershipMessageCta;
  readonly isPlaceholder: boolean;
}

export interface LeadershipPreviewSliceInput {
  readonly laneLabel: string;
  readonly statusLabel: string;
  readonly headline: string;
  readonly teaser: string;
  readonly targetInput: LeadershipViewerTargetInput;
}

export interface LeadershipReadySliceInput {
  readonly record: FoleonContentRecord;
  readonly laneLabel: string;
  readonly statusLabel: string;
  readonly headline: string;
  readonly teaser?: string;
  readonly targetInput: LeadershipViewerTargetInput;
}

/**
 * Deterministic CTA from parent state + target signals — no embed URL duplication.
 *
 * - preview: parent preview OR target source preview
 * - external: requires-external-open (before generic blocked)
 * - live: embed/open path available (canOpen)
 * - blocked: no-embed-url, embed-not-allowed, unknown, preview-only
 */
export function deriveLeadershipCta(
  parentState: 'preview' | 'ready',
  target: LeadershipViewerTargetInput,
): LeadershipMessageCta {
  if (parentState === 'preview' || target.source === 'preview') {
    return {
      kind: 'preview',
      primaryLabel: 'Open preview',
    };
  }

  if (target.renderMode === 'iframe' && target.disabledReason === 'requires-external-open') {
    return {
      kind: 'external',
      primaryLabel: 'Open full message',
      secondaryLabel: 'Opens outside the inline viewer',
      disabledReason: 'requires-external-open',
    };
  }

  if (target.renderMode === 'iframe' && target.canOpen === true) {
    return {
      kind: 'live',
      primaryLabel: 'Read the leadership message',
    };
  }

  const dr = target.renderMode === 'iframe' ? target.disabledReason : undefined;
  if (
    dr === 'no-embed-url' ||
    dr === 'embed-not-allowed' ||
    dr === 'unknown' ||
    dr === 'preview-only'
  ) {
    return {
      kind: 'blocked',
      primaryLabel: 'Message unavailable',
      disabledReason: dr,
    };
  }

  return {
    kind: 'blocked',
    primaryLabel: 'Message unavailable',
    disabledReason: dr ?? 'unknown',
  };
}

function formatFreshnessDate(raw: string | undefined): string | null {
  if (!raw) return null;
  const parsed = Date.parse(raw);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function leadershipFreshnessRaw(record: FoleonContentRecord): string | undefined {
  return record.lastEditorialUpdate ?? record.publishedOn;
}

/**
 * Employee-facing context — no cadence, archive group, or sync metadata.
 */
export function deriveLeadershipContextNotes(record: FoleonContentRecord): readonly LeadershipMessageContextItem[] {
  const notes: LeadershipMessageContextItem[] = [];
  const formatted = formatFreshnessDate(leadershipFreshnessRaw(record));
  if (formatted) {
    notes.push({ id: 'published', label: 'Published', value: formatted });
  }
  const ct = record.contentTypeKey?.trim();
  if (ct && ct.length > 0 && ct !== 'Other') {
    notes.push({ id: 'topic', label: 'Topic', value: ct });
  }
  const aud = record.primaryAudience;
  if (aud && aud !== 'Companywide') {
    notes.push({ id: 'audience', label: 'Audience', value: aud });
  }
  return notes;
}

export function buildLeadershipPreviewSlice(input: LeadershipPreviewSliceInput): LeadershipMessageLaneModel {
  const cta = deriveLeadershipCta('preview', input.targetInput);
  return {
    laneLabel: input.laneLabel,
    statusLabel: input.statusLabel,
    headline: input.headline,
    teaser: input.teaser,
    contextNotes: [],
    cta,
    isPlaceholder: true,
  };
}

export function buildLeadershipReadySlice(input: LeadershipReadySliceInput): LeadershipMessageLaneModel {
  const cta = deriveLeadershipCta('ready', input.targetInput);
  const teaser =
    input.teaser !== undefined && input.teaser.trim().length > 0 ? input.teaser.trim() : undefined;
  return {
    laneLabel: input.laneLabel,
    statusLabel: input.statusLabel,
    headline: input.headline,
    teaser,
    contextNotes: deriveLeadershipContextNotes(input.record),
    cta,
    isPlaceholder: false,
  };
}
