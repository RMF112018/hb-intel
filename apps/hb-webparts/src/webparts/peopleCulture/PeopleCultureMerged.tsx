/**
 * PeopleCultureMerged — Premium People & Culture homepage surface
 *
 * Phase 11 / P03–P05: Rebuilt with rail-first composition and hardening.
 * Phase 11 / UI Remediation: Elevated to premium surface parity with
 * ProjectPortfolioSpotlight — adopting the same container, depth, hierarchy,
 * and polish grammar but shifted to a warmer, more celebratory register.
 *
 * Focal sequence: Kudos → Announcements → Celebrations
 * Suppression: Empty regions omitted; module-level empty state when all empty.
 */
import * as React from 'react';
import {
  HbcPremiumBadge,
  HbcPremiumCta,
  HbcHomepageEyebrow,
  HbcHomepageMetadataRow,
  motion,
  Users,
  CheckCircle2,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePeopleCultureMergedConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { useResponsiveTier, type ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import {
  HP_SPACE,
  HP_RADIUS,
} from '../../homepage/tokens.js';
import type { PeopleCultureMergedConfig } from '../../homepage/webparts/communicationsContracts.js';
import type { BandAOutput, KudosModuleOutput, BandBOutput } from '../../homepage/webparts/communicationsContracts.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PeopleCultureMergedProps {
  config?: Partial<PeopleCultureMergedConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Brand-native premium palette — warm People & Culture register
// ---------------------------------------------------------------------------

const HB = {
  blue: '#225391',
  blueRgb: '34, 83, 145',
  orange: '#E57E46',
  orangeRgb: '229, 126, 70',
} as const;

const BRAND = {
  /** Kudos spotlight background — warm subtle tint */
  spotlightBg: `rgba(${HB.orangeRgb}, 0.03)`,
  /** Supporting zone background — cool subtle tint */
  supportBg: `rgba(${HB.blueRgb}, 0.025)`,
  /** Supporting tile hover — warmer blue tint */
  tileHover: `rgba(${HB.orangeRgb}, 0.06)`,
  /** Section separator — orange-to-blue brand gradient (inverted from Spotlight) */
  separator: `linear-gradient(90deg, rgba(${HB.orangeRgb}, 0.20) 0%, rgba(${HB.blueRgb}, 0.10) 60%, transparent 100%)`,
  /** Tile divider */
  tileDivider: `rgba(${HB.orangeRgb}, 0.08)`,
  /** Text hierarchy on light surfaces */
  textPrimary: '#1a1a1a',
  textSecondary: 'rgba(26, 26, 26, 0.68)',
  textMuted: 'rgba(26, 26, 26, 0.48)',
  textQuiet: 'rgba(26, 26, 26, 0.34)',
} as const;

// ---------------------------------------------------------------------------
// Root container — premium surface matching Spotlight grammar
// ---------------------------------------------------------------------------

const rootStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  color: BRAND.textPrimary,
  background: '#ffffff',
  borderRadius: HP_RADIUS.signature,
  borderLeft: `4px solid ${HB.orange}`,
  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  borderRight: '1px solid rgba(0, 0, 0, 0.06)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  boxShadow: `0 1px 3px rgba(${HB.orangeRgb}, 0.06), 0 4px 20px rgba(${HB.orangeRgb}, 0.08)`,
  overflow: 'hidden',
};

const separatorStyle: React.CSSProperties = {
  height: 1,
  background: BRAND.separator,
  margin: '0 24px',
  border: 'none',
};

// ---------------------------------------------------------------------------
// Motion — respects prefers-reduced-motion
// ---------------------------------------------------------------------------

const NO_MOTION = { initial: undefined, animate: undefined, transition: undefined };

function getSpotlightMotion(reduced: boolean) {
  if (reduced) return NO_MOTION;
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  };
}

function getSupportMotion(reduced: boolean) {
  if (reduced) return NO_MOTION;
  return {
    initial: { opacity: 0, x: 8 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.35, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  };
}

// ---------------------------------------------------------------------------
// Responsive style helpers
// ---------------------------------------------------------------------------

function getHeaderStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    padding: tier === 'mobile'
      ? `${HP_SPACE['3xl']}px 16px ${HP_SPACE.xl}px`
      : `${HP_SPACE['3xl']}px 24px ${HP_SPACE.xl}px`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: HP_SPACE.xl,
  };
}

const headerTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.875rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
  color: HB.orange,
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
};

function getCompositionStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'desktop') {
    return { display: 'flex', flexWrap: 'wrap' };
  }
  return { display: 'flex', flexDirection: 'column' };
}

// ---------------------------------------------------------------------------
// Announcement type maps
// ---------------------------------------------------------------------------

const ANNOUNCEMENT_LABEL: Record<string, string> = {
  promotion: 'Congratulations',
  newHire: 'Welcome',
  baby: 'Baby Announcement',
  wedding: 'Wedding Announcement',
  special: 'Special Announcement',
};

const ANNOUNCEMENT_BADGE: Record<string, 'info' | 'success' | 'warning' | 'critical'> = {
  promotion: 'critical',
  newHire: 'info',
  baby: 'success',
  wedding: 'success',
  special: 'warning',
};

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRecipients(recipients: { name: string }[]): string {
  if (recipients.length === 0) return '';
  if (recipients.length === 1) return recipients[0].name;
  if (recipients.length === 2) return `${recipients[0].name} and ${recipients[1].name}`;
  return `${recipients[0].name}, ${recipients[1].name}, and ${recipients.length - 2} more`;
}

function formatRelativeDate(iso: string): string {
  const celebMs = Date.parse(iso);
  if (Number.isNaN(celebMs)) return '';
  const todayMs = Date.now();
  const diffDays = Math.round((celebMs - todayMs) / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  return new Date(celebMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ---------------------------------------------------------------------------
// Safe avatar — branded initials fallback on error
// ---------------------------------------------------------------------------

const AVATAR_SIZE = 36;

function SafeAvatar({
  src,
  name,
  size,
}: {
  src: string;
  name: string;
  size: number;
}): React.JSX.Element {
  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `rgba(${HB.orangeRgb}, 0.10)`,
          color: HB.orange,
          fontSize: size < 30 ? '0.5625rem' : '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
          flexShrink: 0,
          border: '2px solid #ffffff',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08)',
        }}
        aria-hidden="true"
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      decoding="async"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        flexShrink: 0,
        border: '2px solid #ffffff',
        boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08)',
      }}
      onError={() => setError(true)}
    />
  );
}

function AvatarPlaceholder({
  name,
  size,
}: {
  name: string;
  size: number;
}): React.JSX.Element {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `rgba(${HB.orangeRgb}, 0.10)`,
        color: HB.orange,
        fontSize: size < 30 ? '0.5625rem' : '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Kudos featured spotlight — dominant zone (warm, celebratory)
// ---------------------------------------------------------------------------

function KudosSpotlightZone({
  output,
  tier,
  reducedMotion,
}: {
  output: KudosModuleOutput;
  tier: ResponsiveTier;
  reducedMotion: boolean;
}): React.JSX.Element | null {
  if (output.isEmpty) return null;

  const feat = output.featured;
  if (!feat) return null;

  const recipientLabel = formatRecipients(feat.recipients);
  const hasMedia = Boolean(feat.recipients[0]?.media?.src);
  const maxHeadlines = tier === 'mobile' ? 3 : 4;
  const headlines = output.recentHeadlines.slice(0, maxHeadlines);

  const spotlightPadding = tier === 'mobile' ? '20px 16px 24px' : '28px 28px 32px';

  return (
    <motion.div
      style={{
        flex: tier === 'desktop' ? '1 1 60%' : '1 1 100%',
        minWidth: tier === 'desktop' ? 380 : 0,
        background: BRAND.spotlightBg,
      }}
      {...getSpotlightMotion(reducedMotion)}
    >
      <div style={{ padding: spotlightPadding, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <HbcHomepageEyebrow>Kudos Spotlight</HbcHomepageEyebrow>

        {/* Featured recognition card */}
        <div
          style={{
            display: 'flex',
            flexDirection: tier === 'mobile' ? 'column' : 'row',
            gap: 20,
            padding: tier === 'mobile' ? '16px' : '20px 24px',
            background: '#ffffff',
            borderRadius: HP_RADIUS.editorial,
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: `0 2px 12px rgba(${HB.orangeRgb}, 0.08)`,
          }}
        >
          {/* Avatar cluster */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {hasMedia ? (
              <SafeAvatar src={feat.recipients[0].media!.src} name={feat.recipients[0].name} size={56} />
            ) : (
              <AvatarPlaceholder name={feat.recipients[0]?.name ?? 'Kudos'} size={56} />
            )}
            {feat.recipients.length > 1 && (
              <div style={{ display: 'flex', marginTop: -8 }}>
                {feat.recipients.slice(1, 4).map((r, i) => (
                  <span key={r.id} style={{ marginLeft: i > 0 ? -6 : 0, position: 'relative', zIndex: 3 - i }}>
                    {r.media?.src ? (
                      <SafeAvatar src={r.media.src} name={r.name} size={24} />
                    ) : (
                      <AvatarPlaceholder name={r.name} size={24} />
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{
              margin: 0,
              fontSize: tier === 'mobile' ? '1.125rem' : '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: BRAND.textPrimary,
            }}>
              {feat.headline}
            </h3>

            {recipientLabel && (
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: HB.orange }}>
                {recipientLabel}
              </span>
            )}

            <p style={{
              margin: 0,
              fontSize: '0.8125rem',
              lineHeight: 1.65,
              color: BRAND.textSecondary,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical' as unknown as React.CSSProperties['WebkitBoxOrient'],
              overflow: 'hidden',
            }}>
              {feat.excerpt}
            </p>

            <HbcHomepageMetadataRow separated>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={11} aria-hidden="true" style={{ opacity: 0.7, color: HB.orange }} />
                by {feat.submittedBy.displayName}
              </span>
              {typeof feat.celebrateCount === 'number' && feat.celebrateCount > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={11} aria-hidden="true" style={{ opacity: 0.7, color: HB.orange }} />
                  {feat.celebrateCount} celebration{feat.celebrateCount !== 1 ? 's' : ''}
                </span>
              )}
            </HbcHomepageMetadataRow>

            {/* CTA row */}
            <div style={{ marginTop: 'auto', paddingTop: HP_SPACE.sm, display: 'flex', gap: HP_SPACE.xl, flexWrap: 'wrap' }}>
              <HbcPremiumCta label="Celebrate" href="#celebrate" variant="secondary" size="sm" />
              <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" size="sm" arrow />
            </div>
          </div>
        </div>

        {/* Recent kudos headlines */}
        {headlines.length > 0 && (
          <div>
            {headlines.map((item) => {
              const rLabel = formatRecipients(item.recipients);
              const hasAv = Boolean(item.recipients[0]?.media?.src);
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 4px',
                    borderBottom: `1px solid ${BRAND.tileDivider}`,
                    transition: 'background-color 150ms ease',
                  }}
                >
                  {hasAv ? (
                    <SafeAvatar src={item.recipients[0].media!.src} name={item.recipients[0].name} size={28} />
                  ) : (
                    <AvatarPlaceholder name={item.recipients[0]?.name ?? '?'} size={28} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.35, color: BRAND.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                      {item.headline}
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: BRAND.textMuted }}>
                      {rLabel ? `${rLabel} · ` : ''}by {item.submittedBy.displayName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Supporting zone — Announcements + Celebrations (subordinate)
// ---------------------------------------------------------------------------

function SupportingZone({
  bandA,
  bandB,
  tier,
  reducedMotion,
}: {
  bandA: BandAOutput;
  bandB: BandBOutput;
  tier: ResponsiveTier;
  reducedMotion: boolean;
}): React.JSX.Element | null {
  if (bandA.isEmpty && bandB.isEmpty) return null;

  const maxAnn = tier === 'mobile' ? 2 : 3;
  const annItems = bandA.items.slice(0, maxAnn);
  const maxCel = tier === 'mobile' ? 4 : 6;
  const celItems = bandB.items.slice(0, maxCel);
  const padX = tier === 'mobile' ? 16 : 20;

  return (
    <motion.div
      style={{
        flex: tier === 'desktop' ? '1 1 36%' : '1 1 100%',
        minWidth: tier === 'desktop' ? 240 : 0,
        borderLeft: tier === 'desktop' ? `1px solid ${BRAND.tileDivider}` : undefined,
        borderTop: tier !== 'desktop' ? `1px solid ${BRAND.tileDivider}` : undefined,
        display: 'flex',
        flexDirection: 'column',
        background: BRAND.supportBg,
      }}
      {...getSupportMotion(reducedMotion)}
    >
      {/* Announcements */}
      {annItems.length > 0 && (
        <div style={{ padding: `${HP_SPACE['2xl']}px ${padX}px ${HP_SPACE.xl}px` }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
            color: BRAND.textQuiet,
            marginBottom: HP_SPACE.lg,
          }}>
            Highlights
          </div>
          {annItems.map((item) => {
            const label = ANNOUNCEMENT_LABEL[item.announcementType] ?? item.announcementType;
            const badgeStatus = ANNOUNCEMENT_BADGE[item.announcementType] ?? 'info';
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: HP_SPACE.xl,
                  padding: `${HP_SPACE.lg}px 0`,
                  borderTop: `1px solid ${BRAND.tileDivider}`,
                  alignItems: 'flex-start',
                  minHeight: 44,
                }}
              >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.35, color: BRAND.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {item.personName}
                  </p>
                  <span style={{ fontSize: '0.6875rem', color: BRAND.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {item.headline}
                  </span>
                  <div style={{ display: 'flex', gap: HP_SPACE.sm, flexWrap: 'wrap', marginTop: 2 }}>
                    <HbcPremiumBadge label={label} status={badgeStatus} size="sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Celebrations */}
      {celItems.length > 0 && (
        <div style={{
          padding: `${HP_SPACE['2xl']}px ${padX}px ${HP_SPACE['2xl']}px`,
          borderTop: annItems.length > 0 ? `1px solid ${BRAND.tileDivider}` : undefined,
          flex: 1,
        }}>
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
            color: BRAND.textQuiet,
            marginBottom: HP_SPACE.lg,
          }}>
            This Week
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
            gap: HP_SPACE.md,
          }}>
            {celItems.map((item) => {
              const typeLabel = item.celebrationType === 'anniversary' && item.anniversaryYears
                ? `${item.anniversaryYears} yr`
                : item.celebrationType === 'anniversary'
                  ? 'Anniv.'
                  : '🎂';
              const dateLabel = formatRelativeDate(item.celebrationDate);
              const hasAvatar = Boolean(item.media?.src);
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: HP_SPACE.sm,
                    borderRadius: HP_RADIUS.card,
                    textAlign: 'center',
                    transition: 'background-color 150ms ease',
                  }}
                >
                  {hasAvatar ? (
                    <SafeAvatar src={item.media!.src} name={item.personName} size={AVATAR_SIZE} />
                  ) : (
                    <AvatarPlaceholder name={item.personName} size={AVATAR_SIZE} />
                  )}
                  <div style={{ fontWeight: 600, fontSize: '0.6875rem', lineHeight: 1.3, color: BRAND.textPrimary, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                    {item.personName.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.5625rem', color: BRAND.textMuted, lineHeight: 1.2 }}>
                    {typeLabel}{dateLabel ? ` · ${dateLabel}` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div style={{
        padding: `${HP_SPACE.lg}px ${padX}px ${HP_SPACE['2xl']}px`,
        borderTop: `1px solid ${BRAND.tileDivider}`,
        textAlign: 'right',
      }}>
        <HbcPremiumCta label="View all" href="#people-culture" variant="ghost" size="sm" arrow />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sparse fallback — when we have some data but no featured kudos
// ---------------------------------------------------------------------------

function SparseLayout({
  bandA,
  bandB,
  tier,
  reducedMotion,
}: {
  bandA: BandAOutput;
  bandB: BandBOutput;
  tier: ResponsiveTier;
  reducedMotion: boolean;
}): React.JSX.Element {
  const padX = tier === 'mobile' ? 16 : 24;
  const annItems = bandA.items.slice(0, 3);
  const celItems = bandB.items.slice(0, 6);

  return (
    <motion.div
      style={{ padding: `${HP_SPACE['2xl']}px ${padX}px ${HP_SPACE['3xl']}px`, display: 'flex', flexDirection: 'column', gap: 20 }}
      {...getSpotlightMotion(reducedMotion)}
    >
      {/* Warm encouragement when no Kudos */}
      <div style={{
        padding: '20px 24px',
        background: `linear-gradient(135deg, rgba(${HB.orangeRgb}, 0.04) 0%, rgba(${HB.blueRgb}, 0.02) 100%)`,
        borderRadius: HP_RADIUS.editorial,
        border: '1px solid rgba(0, 0, 0, 0.04)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
      }}>
        <CheckCircle2 size={24} style={{ color: HB.orange, opacity: 0.6 }} />
        <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: BRAND.textPrimary }}>
          Recognize a teammate
        </div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: BRAND.textMuted, maxWidth: '32ch' }}>
          Be the first to spotlight great work, team wins, or everyday excellence.
        </p>
        <div style={{ marginTop: HP_SPACE.sm }}>
          <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="secondary" size="sm" arrow />
        </div>
      </div>

      {/* Announcements as compact cards if available */}
      {annItems.length > 0 && (
        <div>
          <HbcHomepageEyebrow>Highlights</HbcHomepageEyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginTop: HP_SPACE.lg }}>
            {annItems.map((item) => {
              const label = ANNOUNCEMENT_LABEL[item.announcementType] ?? item.announcementType;
              const badgeStatus = ANNOUNCEMENT_BADGE[item.announcementType] ?? 'info';
              return (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '10px 4px', borderBottom: `1px solid ${BRAND.tileDivider}`, alignItems: 'center' }}>
                  <HbcPremiumBadge label={label} status={badgeStatus} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.35, color: BRAND.textPrimary }}>{item.personName}</div>
                    <div style={{ fontSize: '0.6875rem', color: BRAND.textMuted }}>{item.headline}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Celebrations inline */}
      {celItems.length > 0 && (
        <div>
          <HbcHomepageEyebrow>This Week</HbcHomepageEyebrow>
          <div style={{ display: 'flex', gap: HP_SPACE.xl, marginTop: HP_SPACE.lg, flexWrap: 'wrap' }}>
            {celItems.map((item) => {
              const hasAvatar = Boolean(item.media?.src);
              const typeLabel = item.celebrationType === 'anniversary' && item.anniversaryYears
                ? `${item.anniversaryYears} yr`
                : item.celebrationType === 'birthday' ? '🎂' : 'Anniv.';
              return (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 56, textAlign: 'center' }}>
                  {hasAvatar ? (
                    <SafeAvatar src={item.media!.src} name={item.personName} size={32} />
                  ) : (
                    <AvatarPlaceholder name={item.personName} size={32} />
                  )}
                  <div style={{ fontWeight: 600, fontSize: '0.625rem', lineHeight: 1.2, color: BRAND.textPrimary }}>{item.personName.split(' ')[0]}</div>
                  <div style={{ fontSize: '0.5625rem', color: BRAND.textMuted }}>{typeLabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function hasAnyInputData(config: Partial<PeopleCultureMergedConfig> | undefined): boolean {
  return Boolean(
    config?.announcements?.length
    || config?.kudos?.length
    || config?.celebrations?.length,
  );
}

export function PeopleCultureMerged({
  config,
  activeAudience,
  isLoading = false,
}: PeopleCultureMergedProps): React.JSX.Element {
  const tier = useResponsiveTier();
  const reducedMotion = usePrefersReducedMotion();

  // Loading
  if (isLoading) {
    return <HomepageLoadingState label="Loading People & Culture" />;
  }

  // Normalize
  let output: ReturnType<typeof normalizePeopleCultureMergedConfig>;
  try {
    output = normalizePeopleCultureMergedConfig(config, activeAudience);
  } catch {
    const message = resolveAuthoringMessage('peopleCulture', 'invalid');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const allEmpty = output.bandA.isEmpty && output.kudos.isEmpty && output.bandB.isEmpty;
  const hadInput = hasAnyInputData(config);

  if (allEmpty && !hadInput) {
    const message = resolveAuthoringMessage('peopleCulture', 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  if (allEmpty && hadInput) {
    const message = resolveAuthoringMessage('peopleCulture', 'invalid');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const hasKudos = !output.kudos.isEmpty;

  return (
    <section
      data-hbc-homepage="people-culture"
      data-hbc-authoring-safe="true"
      aria-label={output.heading}
      style={rootStyle}
    >
      {/* Header */}
      <div style={getHeaderStyle(tier)}>
        <h2 style={headerTitleStyle}>
          <Users size={14} aria-hidden="true" />
          {output.heading}
        </h2>
        <div style={{ display: 'flex', gap: HP_SPACE.md, alignItems: 'center' }}>
          <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" size="sm" />
          <HbcPremiumCta label="View All Kudos" href="#view-all-kudos" variant="ghost" size="sm" arrow />
        </div>
      </div>

      {/* Separator */}
      <div role="separator" style={separatorStyle} />

      {/* Content composition */}
      {hasKudos ? (
        <div style={getCompositionStyle(tier)}>
          <KudosSpotlightZone output={output.kudos} tier={tier} reducedMotion={reducedMotion} />
          <SupportingZone bandA={output.bandA} bandB={output.bandB} tier={tier} reducedMotion={reducedMotion} />
        </div>
      ) : (
        <SparseLayout bandA={output.bandA} bandB={output.bandB} tier={tier} reducedMotion={reducedMotion} />
      )}
    </section>
  );
}
