/**
 * ProjectPortfolioSpotlight — Premium editorial spotlight surface
 * Phase P06 — Responsive adaptation and device behavior
 *
 * Image-led editorial composition with warm accent styling aligned
 * with HbcEditorialSurface. Adapts across desktop, tablet, and mobile
 * while preserving the featured-first hierarchy and premium interaction
 * quality.
 *
 * Desktop: dominant featured spotlight (~65%) plus subordinate supporting rail (~35%).
 * Tablet:  featured spotlight full-width on top, rail below.
 * Mobile:  featured image stacks above content, rail stacked below,
 *          team detail uses bottom-sheet fallback.
 */
import * as React from 'react';
import {
  HbcPremiumCta,
  HbcPremiumBadge,
  HbcHomepageEyebrow,
  HbcHomepageMetadataRow,
  motion,
  Calendar,
  CheckCircle2,
  Users,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import {
  normalizeProjectPortfolioSpotlightConfig,
  type NormalizedProjectPortfolioSpotlightItem,
} from '../../homepage/helpers/operationalAwarenessConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { useResponsiveTier, type ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';
import type {
  ProjectPortfolioSpotlightConfig,
  ProjectTeamMember,
} from '../../homepage/webparts/operationalAwarenessContracts.js';
import {
  HP_SPACE,
  HP_RADIUS,
  HP_IMAGE,
} from '../../homepage/tokens.js';
import interactiveStyles from '../../homepage/homepage-interactive.module.css';

export interface ProjectPortfolioSpotlightProps {
  config?: Partial<ProjectPortfolioSpotlightConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

/* ── Constants ─────────────────────────────────────────────────── */
const MAX_VISIBLE_AVATARS = 5;
const AVATAR_SIZE = 30;
const DETAIL_AVATAR_SIZE = 36;

/* ── Warm accent palette (aligned with HbcEditorialSurface) ─────── */
const WARM = {
  accent: 'rgb(229, 126, 70)',
  dark: '#c26434',
  border: 'rgba(229, 126, 70, 0.40)',
  borderSubtle: 'rgba(0, 0, 0, 0.06)',
  separator: 'linear-gradient(90deg, rgba(229, 126, 70, 0.22) 0%, rgba(229, 126, 70, 0.04) 100%)',
  eyebrow: 'rgba(229, 126, 70, 0.70)',
  iconBg: 'rgba(229, 126, 70, 0.08)',
  scrim: 'linear-gradient(to top, rgba(0, 0, 0, 0.22) 0%, transparent 60%)',
  tileHover: 'rgba(229, 126, 70, 0.03)',
  tileSeparator: 'rgba(229, 126, 70, 0.06)',
} as const;

/* ── Root and header styles ────────────────────────────────────── */

const rootStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  color: '#1a1a1a',
  background: '#ffffff',
  borderRadius: HP_RADIUS.editorial,
  borderLeft: `3px solid ${WARM.border}`,
  borderTop: `1px solid ${WARM.borderSubtle}`,
  borderRight: `1px solid ${WARM.borderSubtle}`,
  borderBottom: `1px solid ${WARM.borderSubtle}`,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04)',
  overflow: 'hidden',
};

const separatorStyle: React.CSSProperties = {
  height: 1,
  background: WARM.separator,
  margin: '0 24px',
  border: 'none',
};

/* ── Motion ────────────────────────────────────────────────────── */

const featuredMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] as const },
};

const railMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.25, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] as const },
};

const bottomSheetMotion = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const },
};

/* ── Responsive style helpers ────────────────────────────────────── */

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
  fontSize: '0.9375rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
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

function getFeaturedWrapperStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'desktop') {
    return { flex: '1 1 62%', minWidth: 400 };
  }
  return { flex: '1 1 100%', minWidth: 0 };
}

function getFeaturedLayoutStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'mobile') {
    return { display: 'flex', flexDirection: 'column', gap: 0 };
  }
  return { display: 'flex', gap: 0, height: '100%' };
}

function getImageZoneStyle(tier: ResponsiveTier): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.025)',
  };
  if (tier === 'mobile') {
    return { ...base, minHeight: 200, maxHeight: 240 };
  }
  if (tier === 'tablet') {
    return { ...base, flex: '0 0 40%', minHeight: 240 };
  }
  return { ...base, flex: '0 0 48%', minHeight: 280 };
}

const imageStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: HP_IMAGE.objectFit,
  objectPosition: 'center',
  display: 'block',
};

const imageScrimStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: WARM.scrim,
  pointerEvents: 'none',
};

function getImagePlaceholderStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    width: '100%',
    height: '100%',
    minHeight: tier === 'mobile' ? 200 : 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, rgba(229, 126, 70, 0.06) 0%, rgba(34, 83, 145, 0.04) 100%)',
    color: 'rgba(0, 0, 0, 0.20)',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  };
}

function getContentZoneStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'mobile') {
    return {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    };
  }
  return {
    flex: '1 1 52%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  };
}

function getTitleStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    margin: 0,
    fontSize: tier === 'mobile' ? '1.25rem' : '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.025em',
    lineHeight: 1.15,
    color: '#1a1a1a',
    maxWidth: tier === 'mobile' ? undefined : '20ch',
  };
}

function getHeadlineStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    margin: 0,
    fontSize: '0.9375rem',
    fontWeight: 400,
    lineHeight: 1.6,
    color: 'rgba(26, 26, 26, 0.78)',
    maxWidth: tier === 'mobile' ? undefined : '38ch',
  };
}

function getSummaryStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    margin: 0,
    fontSize: '0.8125rem',
    lineHeight: 1.6,
    color: 'rgba(26, 26, 26, 0.55)',
    maxWidth: tier === 'mobile' ? undefined : '48ch',
    display: '-webkit-box',
    WebkitLineClamp: tier === 'mobile' ? 4 : 3,
    WebkitBoxOrient: 'vertical' as unknown as React.CSSProperties['WebkitBoxOrient'],
    overflow: 'hidden',
  };
}

const badgeRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: HP_SPACE.sm,
  flexWrap: 'wrap',
};

const metaIconStyle: React.CSSProperties = {
  opacity: 0.5,
  flexShrink: 0,
};

const metaItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const ctaWrapperStyle: React.CSSProperties = {
  marginTop: 'auto',
  paddingTop: HP_SPACE.md,
};

/* ── Team strip styles ─────────────────────────────────────────── */

function getTeamStripWrapperStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    position: tier === 'mobile' ? 'static' : 'relative',
  };
}

const teamStripStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 8px',
  margin: 0,
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  borderRadius: 20,
  transition: 'background-color 150ms ease',
  fontFamily: 'inherit',
  color: 'inherit',
  minHeight: 44,
};

const teamStripLabelStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: 'rgba(26, 26, 26, 0.50)',
  marginLeft: 4,
  whiteSpace: 'nowrap' as const,
};

const avatarStyle = (index: number): React.CSSProperties => ({
  width: AVATAR_SIZE,
  height: AVATAR_SIZE,
  borderRadius: '50%',
  objectFit: 'cover' as const,
  border: '2px solid #ffffff',
  marginLeft: index > 0 ? -8 : 0,
  position: 'relative' as const,
  zIndex: MAX_VISIBLE_AVATARS - index,
  flexShrink: 0,
});

const initialsStyle = (index: number): React.CSSProperties => ({
  ...avatarStyle(index),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(34, 83, 145, 0.10)',
  color: '#225391',
  fontSize: '0.625rem',
  fontWeight: 700,
  letterSpacing: '0.02em',
});

const overflowStyle: React.CSSProperties = {
  ...avatarStyle(MAX_VISIBLE_AVATARS),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(229, 126, 70, 0.10)',
  color: WARM.dark,
  fontSize: '0.5625rem',
  fontWeight: 700,
  marginLeft: -8,
};

/* ── Team detail panel styles ──────────────────────────────────── */

function getDetailPanelStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'mobile') {
    return {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: '#ffffff',
      borderRadius: '12px 12px 0 0',
      border: `1px solid ${WARM.borderSubtle}`,
      borderBottom: 'none',
      boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.14), 0 -1px 6px rgba(0, 0, 0, 0.06)',
      overflow: 'hidden',
      maxHeight: '60vh',
      overflowY: 'auto',
    };
  }
  return {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 6,
    zIndex: 10,
    minWidth: tier === 'tablet' ? 280 : 240,
    maxWidth: tier === 'tablet' ? 360 : 300,
    background: '#ffffff',
    borderRadius: HP_RADIUS.card,
    border: `1px solid ${WARM.borderSubtle}`,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  };
}

const detailHeaderStyle: React.CSSProperties = {
  padding: '10px 14px 8px',
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  color: 'rgba(26, 26, 26, 0.40)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const detailCloseStyle: React.CSSProperties = {
  padding: '2px 6px',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: 'rgba(26, 26, 26, 0.40)',
  borderRadius: 4,
  lineHeight: 1,
  fontFamily: 'inherit',
  minWidth: 44,
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const detailListStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: '0 0 6px',
};

function getDetailItemStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: tier === 'mobile' ? '10px 16px' : '6px 14px',
    minHeight: 44,
  };
}

const detailAvatarStyle: React.CSSProperties = {
  width: DETAIL_AVATAR_SIZE,
  height: DETAIL_AVATAR_SIZE,
  borderRadius: '50%',
  objectFit: 'cover' as const,
  flexShrink: 0,
};

const detailInitialsStyle: React.CSSProperties = {
  ...detailAvatarStyle,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(34, 83, 145, 0.10)',
  color: '#225391',
  fontSize: '0.75rem',
  fontWeight: 700,
};

const detailNameStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  lineHeight: 1.3,
  color: '#1a1a1a',
};

const detailRoleStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  color: 'rgba(26, 26, 26, 0.50)',
  lineHeight: 1.3,
};

/* ── Supporting rail styles ────────────────────────────────────── */

function getRailWrapperStyle(tier: ResponsiveTier): React.CSSProperties {
  if (tier === 'desktop') {
    return {
      flex: '1 1 33%',
      minWidth: 240,
      borderLeft: `1px solid ${WARM.tileSeparator}`,
      display: 'flex',
      flexDirection: 'column',
    };
  }
  return {
    flex: '1 1 100%',
    minWidth: 0,
    borderTop: `1px solid ${WARM.tileSeparator}`,
    display: 'flex',
    flexDirection: 'column',
  };
}

function getRailHeaderStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    padding: tier === 'mobile'
      ? `${HP_SPACE.xl}px ${HP_SPACE.xl}px ${HP_SPACE.md}px`
      : `${HP_SPACE.xl}px ${HP_SPACE['2xl']}px ${HP_SPACE.md}px`,
    fontSize: '0.6875rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
    color: 'rgba(26, 26, 26, 0.40)',
  };
}

function getRailTileStyle(tier: ResponsiveTier): React.CSSProperties {
  return {
    display: 'flex',
    gap: HP_SPACE.lg,
    padding: tier === 'mobile'
      ? `${HP_SPACE.lg}px ${HP_SPACE.xl}px`
      : `${HP_SPACE.lg}px ${HP_SPACE['2xl']}px`,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'background-color 150ms ease',
    cursor: 'pointer',
    borderTop: `1px solid ${WARM.tileSeparator}`,
    alignItems: 'flex-start',
    minHeight: 44,
  };
}

const railThumbnailWrapperStyle: React.CSSProperties = {
  position: 'relative',
  flex: '0 0 72px',
  height: 54,
  borderRadius: HP_RADIUS.image,
  overflow: 'hidden',
  backgroundColor: 'rgba(0, 0, 0, 0.025)',
};

const railThumbnailStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: HP_IMAGE.objectFit,
  objectPosition: 'center',
  display: 'block',
};

const railThumbnailPlaceholderStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, rgba(229, 126, 70, 0.04) 0%, rgba(34, 83, 145, 0.03) 100%)',
};

const railContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

const railTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.8125rem',
  fontWeight: 600,
  lineHeight: 1.3,
  color: '#1a1a1a',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
};

const railMetaStyle: React.CSSProperties = {
  fontSize: '0.6875rem',
  color: 'rgba(26, 26, 26, 0.50)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const,
};

/* ── Helper: extract initials ──────────────────────────────────── */

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── Project Team strip component ──────────────────────────────── */

function ProjectTeamStrip({
  members,
  tier,
}: {
  members: ProjectTeamMember[];
  tier: ResponsiveTier;
}): React.JSX.Element | null {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on outside click (desktop/tablet popover) or backdrop tap (mobile)
  React.useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent): void {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (members.length === 0) return null;

  const visible = members.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = members.length - MAX_VISIBLE_AVATARS;
  const isMobile = tier === 'mobile';

  const detailPanel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Project team members"
      style={getDetailPanelStyle(tier)}
    >
      <div style={detailHeaderStyle}>
        <span>Project Team</span>
        <button
          type="button"
          style={detailCloseStyle}
          onClick={() => { setIsOpen(false); triggerRef.current?.focus(); }}
          aria-label="Close team panel"
        >
          ✕
        </button>
      </div>
      <ul style={detailListStyle}>
        {members.map((member) => (
          <li key={member.id} style={getDetailItemStyle(tier)}>
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={member.displayName}
                style={detailAvatarStyle}
              />
            ) : (
              <span style={detailInitialsStyle} aria-hidden="true">
                {getInitials(member.displayName)}
              </span>
            )}
            <div>
              <div style={detailNameStyle}>{member.displayName}</div>
              {member.role ? <div style={detailRoleStyle}>{member.role}</div> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={getTeamStripWrapperStyle(tier)} data-hbc-homepage="team-strip">
      <button
        ref={triggerRef}
        type="button"
        className={interactiveStyles.teamStripButton}
        style={teamStripStyle}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`Project team: ${members.length} member${members.length !== 1 ? 's' : ''}`}
      >
        {visible.map((member, i) =>
          member.photoUrl ? (
            <img
              key={member.id}
              src={member.photoUrl}
              alt={member.displayName}
              style={avatarStyle(i)}
            />
          ) : (
            <span key={member.id} style={initialsStyle(i)} aria-hidden="true">
              {getInitials(member.displayName)}
            </span>
          ),
        )}
        {overflow > 0 ? (
          <span style={overflowStyle} aria-hidden="true">+{overflow}</span>
        ) : null}
        <span style={teamStripLabelStyle}>
          <Users size={10} aria-hidden="true" style={{ marginRight: 3, verticalAlign: -1, opacity: 0.5 }} />
          {members.length} team
        </span>
      </button>

      {isOpen ? (
        isMobile ? (
          <>
            {/* Backdrop overlay for mobile bottom-sheet */}
            <div
              className={interactiveStyles.teamDetailBackdrop}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.div {...bottomSheetMotion}>
              {detailPanel}
            </motion.div>
          </>
        ) : (
          detailPanel
        )
      ) : null}
    </div>
  );
}

/* ── Supporting tile component ─────────────────────────────────── */

function SupportingTile({
  item,
  tier,
}: {
  item: NormalizedProjectPortfolioSpotlightItem;
  tier: ResponsiveTier;
}): React.JSX.Element {
  const [hovered, setHovered] = React.useState(false);
  const metaText = [item.location, item.sector].filter(Boolean).join(' \u00B7 ') || item.freshnessLabel;
  const href = item.cta?.href;

  const tileProps = href
    ? {
        as: 'a' as const,
        href,
        role: undefined as undefined,
      }
    : {
        as: 'div' as const,
        href: undefined as undefined,
        role: 'listitem' as const,
      };

  const baseTileStyle = getRailTileStyle(tier);
  const style: React.CSSProperties = {
    ...baseTileStyle,
    backgroundColor: hovered ? WARM.tileHover : 'transparent',
  };

  const Tag = tileProps.as;

  return (
    <Tag
      href={tileProps.href}
      role={tileProps.role}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-hbc-homepage="spotlight-tile"
    >
      {/* Compact thumbnail */}
      <div style={railThumbnailWrapperStyle}>
        {item.image ? (
          <img
            src={item.image.src}
            alt={item.image.alt || item.title}
            style={railThumbnailStyle}
            loading="lazy"
          />
        ) : (
          <div style={railThumbnailPlaceholderStyle} aria-hidden="true" />
        )}
      </div>

      {/* Tile content */}
      <div style={railContentStyle}>
        <p style={railTitleStyle}>{item.title}</p>
        {metaText ? <span style={railMetaStyle}>{metaText}</span> : null}
        <div style={badgeRowStyle}>
          {item.isStale ? (
            <HbcPremiumBadge label="Stale" status="warning" size="sm" />
          ) : null}
          {item.status ? (
            <HbcPremiumBadge label={item.status.label} status={item.status.variant ?? 'info'} size="sm" />
          ) : null}
        </div>
      </div>
    </Tag>
  );
}

/* ── Main component ────────────────────────────────────────────── */

export function ProjectPortfolioSpotlight({
  config,
  activeAudience,
  isLoading = false,
}: ProjectPortfolioSpotlightProps): React.JSX.Element {
  const tier = useResponsiveTier();

  if (isLoading) {
    return <HomepageLoadingState label="Loading project spotlight" />;
  }

  const normalized = normalizeProjectPortfolioSpotlightConfig(config, activeAudience);

  if (!normalized.featured && normalized.secondary.length === 0) {
    const message = resolveAuthoringMessage(
      'projectPortfolioSpotlight',
      config?.items?.length ? 'invalid' : 'noData',
    );
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const feat = normalized.featured;
  if (!feat) {
    const message = resolveAuthoringMessage('projectPortfolioSpotlight', 'noData');
    return <HomepageEmptyState title={message.title} description={message.description} />;
  }

  const eyebrowText = [feat.sector, feat.location].filter(Boolean).join(' \u00B7 ') || 'Featured Project';
  const completedMilestones = feat.milestones.filter((m) => m.completed).length;
  const totalMilestones = feat.milestones.length;
  const hasRail = normalized.secondary.length > 0;

  return (
    <section
      data-hbc-homepage="project-spotlight"
      aria-label={normalized.heading}
      style={rootStyle}
    >
      {/* Header */}
      <div style={getHeaderStyle(tier)}>
        <h2 style={headerTitleStyle}>{normalized.heading}</h2>
        {feat.cta ? (
          <HbcPremiumCta
            label="View all projects"
            href={feat.cta.href}
            variant="ghost"
            size="sm"
            arrow
          />
        ) : null}
      </div>

      {/* Separator */}
      <div role="separator" style={separatorStyle} />

      {/* Responsive composition: featured + rail */}
      <div style={getCompositionStyle(tier)}>
        {/* Featured spotlight — dominant */}
        <motion.div
          style={getFeaturedWrapperStyle(tier)}
          {...featuredMotion}
        >
          <div style={getFeaturedLayoutStyle(tier)}>
            {/* Image zone */}
            <div style={getImageZoneStyle(tier)}>
              {feat.image ? (
                <>
                  <img
                    src={feat.image.src}
                    alt={feat.image.alt || feat.title}
                    style={imageStyle}
                    loading="lazy"
                  />
                  <div style={imageScrimStyle} aria-hidden="true" />
                </>
              ) : (
                <div style={getImagePlaceholderStyle(tier)} aria-hidden="true">
                  Project Image
                </div>
              )}
            </div>

            {/* Content zone */}
            <div style={getContentZoneStyle(tier)}>
              <HbcHomepageEyebrow>{eyebrowText}</HbcHomepageEyebrow>

              <h3 style={getTitleStyle(tier)}>{feat.title}</h3>

              {feat.highlightHeadline ? (
                <p style={getHeadlineStyle(tier)}>{feat.highlightHeadline}</p>
              ) : null}

              {/* Metadata row — milestone + freshness */}
              {(totalMilestones > 0 || feat.freshnessLabel) ? (
                <HbcHomepageMetadataRow separated>
                  {totalMilestones > 0 ? (
                    <span style={metaItemStyle}>
                      <CheckCircle2 size={11} aria-hidden="true" style={metaIconStyle} />
                      {completedMilestones}/{totalMilestones} milestones
                    </span>
                  ) : null}
                  {feat.freshnessLabel ? (
                    <span style={metaItemStyle}>
                      <Calendar size={11} aria-hidden="true" style={metaIconStyle} />
                      {feat.freshnessLabel}
                    </span>
                  ) : null}
                </HbcHomepageMetadataRow>
              ) : null}

              {/* Summary */}
              <p style={getSummaryStyle(tier)}>{feat.summary}</p>

              {/* Badges — restrained */}
              {(feat.status || feat.strategicEmphasis || feat.isStale) ? (
                <div style={badgeRowStyle}>
                  {feat.isStale ? (
                    <HbcPremiumBadge label="Stale" status="warning" size="sm" />
                  ) : null}
                  {feat.status ? (
                    <HbcPremiumBadge label={feat.status.label} status={feat.status.variant ?? 'info'} size="sm" />
                  ) : null}
                  {feat.strategicEmphasis ? (
                    <HbcPremiumBadge label="Strategic" status="info" size="sm" />
                  ) : null}
                </div>
              ) : null}

              {/* Project Team strip */}
              <ProjectTeamStrip members={feat.teamMembers} tier={tier} />

              {/* Primary CTA */}
              {feat.cta ? (
                <div style={ctaWrapperStyle}>
                  <HbcPremiumCta
                    label={feat.cta.label}
                    href={feat.cta.href}
                    variant="secondary"
                    size="md"
                    arrow
                  />
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>

        {/* Supporting rail — subordinate */}
        {hasRail ? (
          <motion.div
            style={getRailWrapperStyle(tier)}
            {...railMotion}
            role="list"
            aria-label="Additional projects"
          >
            <div style={getRailHeaderStyle(tier)}>Also in progress</div>
            {normalized.secondary.map((item) => (
              <SupportingTile key={item.id} item={item} tier={tier} />
            ))}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
