/**
 * Legacy → split adapter for the People & Culture public webpart.
 *
 * Phase-14 pc/ Prompt-02.
 *
 * Bridges the existing manifest-config shape (`PeopleCultureMergedConfig`,
 * used by the backward-compatibility `peopleCulture/` webpart) to the
 * strongly-typed split contracts introduced in Prompt-01
 * (`PeopleCulturePublicConfig` / `PeopleCultureItem`).
 *
 * The adapter is strictly **non-recognition**: it ignores
 * `PeopleCultureMergedConfig.kudos` entirely. HB Kudos is owned by the
 * separate `hbKudos/` webpart boundary, and the PC public runtime must
 * never leak recognition content.
 *
 * The adapter is a temporary bridge so already-placed SharePoint page
 * instances continue to render against the new public runtime. A later
 * phase will replace it with a real `People Culture Announcements` /
 * `People Culture Celebrations` SharePoint list adapter once those
 * list schemas have been extracted.
 */

import type {
  AnnouncementEntry,
  PeopleCultureMergedConfig,
  WeeklyCelebrationEntry,
} from '../../homepage/webparts/communicationsContracts.js';
import type {
  PeopleCultureAudienceScope,
  PeopleCultureHomepageGovernance,
  PeopleCultureItem,
  PeopleCultureMediaSource,
  PeopleCulturePublicConfig,
} from '../../homepage/webparts/peopleCultureSplitContracts.js';
import { DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG } from '../../homepage/webparts/peopleCultureSplitContracts.js';
import { deriveLifecycleState } from '../../homepage/helpers/peopleCultureSplitModel.js';

const MS_PER_DAY = 86_400_000;

/**
 * Duck-type detector: does this config look like the split-aware shape?
 * We prefer the split config if present on the incoming record.
 */
export function isSplitPublicConfig(
  value: unknown,
): value is Partial<PeopleCulturePublicConfig> {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<PeopleCulturePublicConfig>;
  if (!Array.isArray(maybe.items)) return false;
  // All items must have the split-shaped `family` + `homepage` fields.
  return maybe.items.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      'family' in item &&
      'homepage' in item &&
      'audience' in item,
  );
}

/**
 * Duck-type detector: does this config look like the legacy merged shape?
 */
export function isLegacyMergedConfig(
  value: unknown,
): value is Partial<PeopleCultureMergedConfig> {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<PeopleCultureMergedConfig>;
  return (
    Array.isArray(maybe.announcements) ||
    Array.isArray(maybe.celebrations) ||
    typeof maybe.heading === 'string' ||
    typeof maybe.maxAnnouncements === 'number' ||
    typeof maybe.maxCelebrations === 'number'
  );
}

function audienceScopeFromLegacy(
  audiences: string[] | undefined,
): PeopleCultureAudienceScope {
  if (!audiences || audiences.length === 0) {
    return { kind: 'companyWide' };
  }
  // Legacy audience strings are a flat list without dimensions. We
  // project them onto the `office` dimension as a best-effort. Real
  // dimensional tagging will arrive with the new SP list adapter.
  return {
    kind: 'targeted',
    tags: audiences
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => ({ dimension: 'office' as const, value })),
  };
}

function homepageFromAnnouncement(
  item: AnnouncementEntry,
): PeopleCultureHomepageGovernance {
  return {
    tier: item.isPinned ? 'featured' : 'supporting',
    overrideSource: 'systemDefault',
    isPinned: Boolean(item.isPinned),
    order: typeof item.priorityOverride === 'number' ? item.priorityOverride : undefined,
  };
}

function homepageFromCelebration(): PeopleCultureHomepageGovernance {
  return {
    tier: 'supporting',
    overrideSource: 'systemDefault',
    isPinned: false,
  };
}

function mediaSourceFromLegacy(
  media: AnnouncementEntry['media'],
): PeopleCultureMediaSource {
  if (media?.src && media.alt !== undefined) {
    return { kind: 'hrUpload', src: media.src, alt: media.alt };
  }
  return { kind: 'none' };
}

function startOfDayMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return undefined;
  return ms - (ms % MS_PER_DAY);
}

const LEGACY_ANNOUNCEMENT_PERSISTENCE_DAYS: Record<
  AnnouncementEntry['announcementType'],
  number
> = {
  promotion: 5,
  newHire: 5,
  baby: 3,
  wedding: 3,
  special: 3,
};

function adaptAnnouncement(
  item: AnnouncementEntry,
  now: Date,
): PeopleCultureItem | undefined {
  const id = item.id?.trim();
  const title = item.headline?.trim();
  const body = item.summary?.trim();
  if (!id || !title || !body) return undefined;

  const publishMs =
    startOfDayMs(item.startDisplayDate) ?? startOfDayMs(item.publishDate);
  if (publishMs === undefined) return undefined;

  const persistenceDays =
    LEGACY_ANNOUNCEMENT_PERSISTENCE_DAYS[item.announcementType] ?? 3;
  const defaultExpiresMs = publishMs + persistenceDays * MS_PER_DAY;
  const explicitExpiresMs = startOfDayMs(item.endDisplayDate);
  const expiresMs =
    explicitExpiresMs !== undefined
      ? explicitExpiresMs + MS_PER_DAY
      : defaultExpiresMs;

  const publishedAt = new Date(publishMs).toISOString();
  const expiresAt = new Date(expiresMs).toISOString();

  const lifecycleState = deriveLifecycleState(
    {
      publishedAt,
      expiresAt,
    },
    now,
  );

  // homepageEnabled=false on the legacy shape forces an exclusion.
  const excluded = item.homepageEnabled === false;

  return {
    id,
    family: 'announcement',
    lifecycleState,
    title,
    body,
    cta: item.cta,
    approvalTrigger: 'standard',
    audience: audienceScopeFromLegacy(item.audiences),
    homepage: excluded
      ? { tier: 'excluded', overrideSource: 'systemDefault', isPinned: false }
      : homepageFromAnnouncement(item),
    mediaSource: mediaSourceFromLegacy(item.media),
    personRef: item.personName
      ? { id: `legacy:${item.personName}`, displayName: item.personName }
      : undefined,
    publishedAt,
    expiresAt,
  };
}

function adaptCelebration(
  item: WeeklyCelebrationEntry,
  now: Date,
): PeopleCultureItem | undefined {
  const id = item.id?.trim();
  if (!id || !item.personName?.trim() || !item.celebrationType) return undefined;

  const celebrationMs = startOfDayMs(item.celebrationDate);
  if (celebrationMs === undefined) return undefined;

  // Celebrations are live during the week window surrounding the event day.
  const publishMs = celebrationMs - 6 * MS_PER_DAY;
  const expiresMs = celebrationMs + 1 * MS_PER_DAY;
  const publishedAt = new Date(publishMs).toISOString();
  const expiresAt = new Date(expiresMs).toISOString();

  const lifecycleState = deriveLifecycleState(
    { publishedAt, expiresAt },
    now,
  );

  const title =
    item.celebrationType === 'anniversary' && item.anniversaryYears
      ? `${item.personName} — ${item.anniversaryYears}-year anniversary`
      : item.celebrationType === 'anniversary'
        ? `${item.personName} — work anniversary`
        : `${item.personName} — birthday`;

  return {
    id,
    family: 'celebrationMilestone',
    lifecycleState,
    title,
    body:
      item.celebrationType === 'anniversary'
        ? `Celebrating ${item.personName}'s service milestone.`
        : `Wishing ${item.personName} a happy birthday.`,
    approvalTrigger: 'standard',
    audience: audienceScopeFromLegacy(item.audiences),
    homepage: homepageFromCelebration(),
    mediaSource: mediaSourceFromLegacy(item.media),
    personRef: { id: `legacy:${item.personName}`, displayName: item.personName },
    publishedAt,
    expiresAt,
  };
}

export interface AdaptLegacyConfigOptions {
  now?: Date;
}

/**
 * Convert a legacy `PeopleCultureMergedConfig` into the split-aware
 * `PeopleCulturePublicConfig`. Kudos entries are deliberately dropped —
 * recognition is owned by the separate `hbKudos/` webpart.
 *
 * Returns an empty items array if the input is undefined or has no
 * usable announcements/celebrations. Safe to call with partial inputs.
 */
export function adaptLegacyConfigToSplit(
  legacy: Partial<PeopleCultureMergedConfig> | undefined,
  options: AdaptLegacyConfigOptions = {},
): PeopleCulturePublicConfig {
  const now = options.now ?? new Date();

  const heading =
    typeof legacy?.heading === 'string' && legacy.heading.trim()
      ? legacy.heading.trim()
      : DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.heading;

  const announcements = (legacy?.announcements ?? [])
    .map((item) => adaptAnnouncement(item, now))
    .filter((item): item is PeopleCultureItem => item != null);

  const celebrations = (legacy?.celebrations ?? [])
    .map((item) => adaptCelebration(item, now))
    .filter((item): item is PeopleCultureItem => item != null);

  return {
    heading,
    items: [...announcements, ...celebrations],
    maxFeatured: DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.maxFeatured,
    maxSupporting: DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.maxSupporting,
  };
}

/**
 * Resolve the effective public config, preferring a split-aware config
 * on the input record if present, otherwise adapting legacy fields.
 * Returns an empty (but valid) config when input is undefined.
 */
export function resolvePublicConfig(
  input: unknown,
  options: AdaptLegacyConfigOptions = {},
): PeopleCulturePublicConfig {
  if (input === undefined || input === null) {
    return adaptLegacyConfigToSplit(undefined, options);
  }
  if (isSplitPublicConfig(input)) {
    return {
      heading: input.heading ?? DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.heading,
      items: input.items ?? [],
      maxFeatured: input.maxFeatured ?? DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.maxFeatured,
      maxSupporting:
        input.maxSupporting ?? DEFAULT_PEOPLE_CULTURE_PUBLIC_CONFIG.maxSupporting,
    };
  }
  if (isLegacyMergedConfig(input)) {
    return adaptLegacyConfigToSplit(input, options);
  }
  return adaptLegacyConfigToSplit(undefined, options);
}
