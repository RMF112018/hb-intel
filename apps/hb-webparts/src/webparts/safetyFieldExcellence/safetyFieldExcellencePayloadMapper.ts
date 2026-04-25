/**
 * Map the Wave 04 backend `homepage/current` payload into the canonical
 * `SafetyFieldExcellenceConfig` shape consumed by `SafetyFieldExcellence`.
 *
 * Defensive: validates required fields and rejects invalid CTAs. Strips
 * unknown fields. Never trusts unrecognized publishStatus values.
 */

import type { HomepageCtaLink } from '../../homepage/models/contentModels.js';
import type {
  SafetyContextMetadata,
  SafetyFieldExcellenceConfig,
  SafetyPrimarySpotlight,
  SafetySecondarySignal,
  SafetyTopLineSummary,
  SafetyUrgencyLevel,
} from '../../homepage/webparts/operationalAwarenessContracts.js';

export interface BackendCurrentHighlightPublished {
  readonly state: 'published';
  readonly highlightItemId?: number;
  readonly itemId?: number;
  readonly reportingPeriodId?: string;
  readonly reportingPeriodSpItemId?: number;
  readonly periodLabel?: string;
  readonly weekStartDate?: string;
  readonly weekEndDate?: string;
  readonly publishStatus?: 'published';
  readonly publishedAt?: string | null;
  readonly freshUntil?: string | null;
  readonly isStale?: boolean;
  readonly dataConfidence?: 'high' | 'medium' | 'low' | null;
  readonly homepagePayload?: unknown;
}

export interface BackendHomepagePayload {
  heading?: string;
  topLineSummary?: {
    statusLabel?: string;
    summaryText?: string;
    statusVariant?: SafetyTopLineSummary['statusVariant'];
    lastUpdatedLabel?: string;
  };
  primarySpotlight?: {
    id?: string;
    title?: string;
    summary?: string;
    urgency?: SafetyUrgencyLevel;
    context?: SafetyContextMetadata;
    compactSummary?: string;
    metadata?: string;
    indicator?: { label?: string; variant?: string };
    freshness?: { source?: 'curated' | 'live'; updatedAt?: string; expiresAt?: string };
    cta?: { label?: string; href?: string; openInNewTab?: boolean };
  };
  secondarySignals?: Array<{
    id?: string;
    title?: string;
    summary?: string;
    urgency?: SafetyUrgencyLevel;
    context?: SafetyContextMetadata;
    compactSummary?: string;
    metadata?: string;
    indicator?: { label?: string; variant?: string };
    freshness?: { source?: 'curated' | 'live'; updatedAt?: string; expiresAt?: string };
    cta?: { label?: string; href?: string; openInNewTab?: boolean };
    order?: number;
  }>;
  sectionCta?: { label?: string; href?: string; openInNewTab?: boolean };
  isPreview?: boolean;
  dataConfidence?: 'high' | 'medium' | 'low';
  periodLabel?: string;
  weekStartDate?: string;
  weekEndDate?: string;
}

export interface MapResult {
  readonly success: boolean;
  readonly config: SafetyFieldExcellenceConfig | null;
  readonly invalidReason?:
    | 'state-not-published'
    | 'publish-status-not-published'
    | 'payload-missing'
    | 'payload-not-object'
    | 'payload-empty'
    | 'primary-invalid';
}

const ALLOWED_STATUS_VARIANTS = new Set([
  'info',
  'success',
  'warning',
  'critical',
  'neutral',
]);

const ALLOWED_URGENCY = new Set<SafetyUrgencyLevel>(['routine', 'attention', 'urgent']);

export function mapBackendPublishedToConfig(
  current: BackendCurrentHighlightPublished,
): MapResult {
  if (current.state !== 'published') {
    return { success: false, config: null, invalidReason: 'state-not-published' };
  }
  if (current.publishStatus !== undefined && current.publishStatus !== 'published') {
    return { success: false, config: null, invalidReason: 'publish-status-not-published' };
  }

  const payload = parseHomepagePayload(current.homepagePayload);
  if (payload === null) {
    return { success: false, config: null, invalidReason: 'payload-missing' };
  }
  if (typeof payload !== 'object') {
    return { success: false, config: null, invalidReason: 'payload-not-object' };
  }
  if (Object.keys(payload).length === 0) {
    return { success: false, config: null, invalidReason: 'payload-empty' };
  }

  const heading = sanitizeText(payload.heading) ?? 'Safety and Field Excellence';
  const topLineSummary = mapTopLine(payload.topLineSummary, current);
  const primarySpotlight = mapPrimary(payload.primarySpotlight, current);
  const secondarySignals = (payload.secondarySignals ?? [])
    .map((signal, index) => mapSecondary(signal, index, current))
    .filter((s): s is SafetySecondarySignal => s !== null)
    .slice(0, 4);
  const sectionCta = mapCta(payload.sectionCta);

  if (payload.isPreview === false && primarySpotlight === undefined) {
    return { success: false, config: null, invalidReason: 'primary-invalid' };
  }

  const config: SafetyFieldExcellenceConfig = {
    heading,
    topLineSummary,
    primarySpotlight,
    secondarySignals,
    sectionCta,
    maxSecondaryItems: 4,
    staleAfterHours: 168,
  };
  return { success: true, config };
}

function parseHomepagePayload(raw: unknown): BackendHomepagePayload | null {
  if (!raw) return null;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed as BackendHomepagePayload;
    } catch {
      return null;
    }
    return null;
  }
  if (typeof raw === 'object') return raw as BackendHomepagePayload;
  return null;
}

function mapTopLine(
  topLine: BackendHomepagePayload['topLineSummary'],
  current: BackendCurrentHighlightPublished,
): SafetyTopLineSummary | undefined {
  if (!topLine) return undefined;
  const statusLabel = sanitizeText(topLine.statusLabel);
  const summaryText = sanitizeText(topLine.summaryText);
  if (!statusLabel || !summaryText) return undefined;
  const statusVariant = ALLOWED_STATUS_VARIANTS.has(String(topLine.statusVariant ?? 'info'))
    ? topLine.statusVariant
    : 'info';
  const lastUpdated = sanitizeText(topLine.lastUpdatedLabel)
    ?? (current.publishedAt ? `Published ${current.publishedAt}` : undefined);
  return {
    statusLabel,
    statusVariant,
    summaryText,
    lastUpdatedLabel: lastUpdated,
  };
}

function mapPrimary(
  spotlight: BackendHomepagePayload['primarySpotlight'],
  current: BackendCurrentHighlightPublished,
): SafetyPrimarySpotlight | undefined {
  if (!spotlight) return undefined;
  const id = sanitizeText(spotlight.id);
  const title = sanitizeText(spotlight.title);
  const summary = sanitizeText(spotlight.summary);
  if (!id || !title || !summary) return undefined;
  const urgency = ALLOWED_URGENCY.has(spotlight.urgency as SafetyUrgencyLevel)
    ? (spotlight.urgency as SafetyUrgencyLevel)
    : 'routine';
  return {
    id,
    title,
    summary,
    urgency,
    context: sanitizeContext(spotlight.context),
    compactSummary: sanitizeText(spotlight.compactSummary),
    metadata: sanitizeText(spotlight.metadata),
    indicator: mapIndicator(spotlight.indicator),
    freshness: mapFreshness(spotlight.freshness, current),
    cta: mapCta(spotlight.cta),
  };
}

function mapSecondary(
  signal: NonNullable<BackendHomepagePayload['secondarySignals']>[number] | undefined,
  index: number,
  current: BackendCurrentHighlightPublished,
): SafetySecondarySignal | null {
  if (!signal) return null;
  const id = sanitizeText(signal.id);
  const title = sanitizeText(signal.title);
  const summary = sanitizeText(signal.summary);
  if (!id || !title || !summary) return null;
  const urgency = ALLOWED_URGENCY.has(signal.urgency as SafetyUrgencyLevel)
    ? (signal.urgency as SafetyUrgencyLevel)
    : 'routine';
  return {
    id,
    title,
    summary,
    urgency,
    context: sanitizeContext(signal.context),
    compactSummary: sanitizeText(signal.compactSummary),
    metadata: sanitizeText(signal.metadata),
    indicator: mapIndicator(signal.indicator),
    freshness: mapFreshness(signal.freshness, current),
    cta: mapCta(signal.cta),
    order: typeof signal.order === 'number' ? signal.order : index,
  };
}

function mapIndicator(
  indicator: { label?: string; variant?: string } | undefined,
): SafetyPrimarySpotlight['indicator'] {
  if (!indicator) return undefined;
  const label = sanitizeText(indicator.label);
  if (!label) return undefined;
  const variant = ALLOWED_STATUS_VARIANTS.has(String(indicator.variant ?? 'info'))
    ? (indicator.variant as SafetyPrimarySpotlight['indicator'] extends infer T ? T extends { variant?: infer V } ? V : never : never)
    : 'info';
  return { label, variant: variant ?? undefined };
}

function mapFreshness(
  freshness: { source?: 'curated' | 'live'; updatedAt?: string; expiresAt?: string } | undefined,
  current: BackendCurrentHighlightPublished,
): SafetyPrimarySpotlight['freshness'] {
  if (!freshness) {
    if (!current.publishedAt && !current.freshUntil) return undefined;
    return {
      source: 'live',
      updatedAt: current.publishedAt ?? undefined,
      expiresAt: current.freshUntil ?? undefined,
    };
  }
  return {
    source: freshness.source === 'curated' ? 'curated' : 'live',
    updatedAt:
      sanitizeIsoDate(freshness.updatedAt) ?? (current.publishedAt ?? undefined),
    expiresAt:
      sanitizeIsoDate(freshness.expiresAt) ?? (current.freshUntil ?? undefined),
  };
}

function mapCta(
  cta: { label?: string; href?: string; openInNewTab?: boolean } | undefined,
): HomepageCtaLink | undefined {
  if (!cta) return undefined;
  const label = sanitizeText(cta.label);
  const href = sanitizeText(cta.href);
  if (!label || !href) return undefined;
  return { label, href, openInNewTab: cta.openInNewTab === true };
}

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeIsoDate(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed.length === 0) return undefined;
  return Number.isFinite(Date.parse(trimmed)) ? trimmed : undefined;
}

function sanitizeContext(context: SafetyContextMetadata | undefined): SafetyContextMetadata | undefined {
  if (!context) return undefined;
  const region = sanitizeText(context.region);
  const site = sanitizeText(context.site);
  const project = sanitizeText(context.project);
  const scope = sanitizeText(context.scope);
  const owner = sanitizeText(context.owner);
  if (!region && !site && !project && !scope && !owner) return undefined;
  return { region, site, project, scope, owner };
}
