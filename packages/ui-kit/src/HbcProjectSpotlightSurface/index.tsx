/**
 * HbcProjectSpotlightSurface — Premium project / portfolio spotlight surface family.
 *
 * Cohesive presentation-lane surface for the "Project Spotlight" zone on the
 * HB Central homepage: a dominant featured project with an image-led
 * editorial composition, an avatar-strip + detail-panel project team
 * affordance, and a subordinate supporting rail of secondary projects.
 *
 * Wave 01 follow-on: Project / Portfolio Spotlight migration to
 * @hbc/ui-kit/homepage. Mirrors the HbcPeopleCultureSurface pattern
 * (view-model contract, flat directory, CSS-module responsive, internal
 * sub-components, `HbcAvatarStack` reuse).
 *
 * Consumers stay thin — SharePoint fetch, normalization, audience filtering,
 * stale detection, and manifest fallback all remain local to the webpart.
 * Consumers supply a fully prepared `ProjectSpotlightSurfaceModel`.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, Users } from 'lucide-react';
import {
  HbcAvatarStack,
  type HbcAvatarStackPerson,
} from '../HbcAvatarStack/index.js';
import { HbcPremiumBadge } from '../HbcPremiumBadge/index.js';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import { HbcHomepageEyebrow } from '../HbcHomepageEyebrow/index.js';
import { HbcHomepageMetadataRow } from '../HbcHomepageMetadataRow/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import styles from './project-spotlight-surface.module.css';

// ---------------------------------------------------------------------------
// View-model contract — decoupled from any consumer data shape
// ---------------------------------------------------------------------------

export type ProjectSpotlightStatusVariant =
  | 'info'
  | 'success'
  | 'warning'
  | 'critical'
  | 'neutral';

export interface ProjectSpotlightStatus {
  label: string;
  variant?: ProjectSpotlightStatusVariant;
}

export interface ProjectSpotlightMedia {
  src: string;
  alt: string;
}

export interface ProjectSpotlightCta {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface ProjectSpotlightMilestone {
  id: string;
  title: string;
  completed?: boolean;
}

export interface ProjectSpotlightTeamMember {
  id: string;
  displayName: string;
  role?: string;
  photoUrl?: string;
}

export interface ProjectSpotlightFeaturedItem {
  id: string;
  title: string;
  /** Short editorial headline shown below the title. */
  headline?: string;
  summary: string;
  location?: string;
  sector?: string;
  image?: ProjectSpotlightMedia;
  status?: ProjectSpotlightStatus;
  strategicEmphasis?: boolean;
  isStale?: boolean;
  freshnessLabel?: string;
  milestones?: ProjectSpotlightMilestone[];
  teamMembers?: ProjectSpotlightTeamMember[];
  cta?: ProjectSpotlightCta;
}

export interface ProjectSpotlightRailItem {
  id: string;
  title: string;
  location?: string;
  sector?: string;
  image?: ProjectSpotlightMedia;
  status?: ProjectSpotlightStatus;
  isStale?: boolean;
  freshnessLabel?: string;
  cta?: ProjectSpotlightCta;
}

export interface ProjectSpotlightSurfaceModel {
  heading: string;
  allProjectsLabel?: string;
  allProjectsUrl?: string;
  featured: ProjectSpotlightFeaturedItem;
  secondary: ProjectSpotlightRailItem[];
  /** Header eyebrow shown above the section title. Defaults to "Portfolio". */
  sectionEyebrow?: string;
  /** Label for the rail column. Defaults to "More projects". */
  railLabel?: string;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HbcProjectSpotlightSurfaceProps {
  model: ProjectSpotlightSurfaceModel;
  className?: string;
  'aria-label'?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MAX_VISIBLE_AVATARS = 5;

function toAvatarStackPerson(
  member: ProjectSpotlightTeamMember,
): HbcAvatarStackPerson {
  return { id: member.id, name: member.displayName, src: member.photoUrl };
}

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface FeaturedMediaProps {
  image?: ProjectSpotlightMedia;
}

/**
 * Safe featured media — always renders a branded gradient placeholder
 * as the background layer. On image load success the `<img>` covers it;
 * on error the `<img>` is removed and the placeholder remains.
 */
function FeaturedMedia({ image }: FeaturedMediaProps): React.JSX.Element {
  const [errored, setErrored] = React.useState(false);
  return (
    <div className={styles.mediaZone}>
      <div className={styles.mediaPlaceholder} aria-hidden="true">
        Project Image
      </div>
      {image && !errored ? (
        <>
          <img
            src={image.src}
            alt={image.alt}
            decoding="async"
            loading="lazy"
            className={styles.mediaImage}
            onError={() => setErrored(true)}
          />
          <div className={styles.mediaScrim} aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
}

interface RailThumbnailProps {
  image?: ProjectSpotlightMedia;
}

function RailThumbnail({ image }: RailThumbnailProps): React.JSX.Element {
  const [errored, setErrored] = React.useState(false);
  if (!image || errored) {
    return <div className={styles.railThumb} aria-hidden="true" />;
  }
  return (
    <div className={styles.railThumbWrap}>
      <img
        src={image.src}
        alt={image.alt}
        width={88}
        height={66}
        decoding="async"
        loading="lazy"
        className={styles.railThumbImg}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

interface TeamStripProps {
  members: ProjectSpotlightTeamMember[];
  reducedMotion: boolean;
}

/**
 * Avatar strip + on-demand detail panel. The panel behaves as a popover
 * at desktop widths and as a fixed bottom sheet on mobile widths — driven
 * by the surface's own CSS media queries, not by a consumer-provided tier.
 */
function TeamStrip({
  members,
  reducedMotion,
}: TeamStripProps): React.JSX.Element | null {
  const [isOpen, setIsOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

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

  React.useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent): void {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (members.length === 0) return null;

  const people = members.slice(0, MAX_VISIBLE_AVATARS).map(toAvatarStackPerson);
  const sheetMotionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.25,
          ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
        },
      };

  return (
    <div className={styles.teamStripWrap} data-hbc-homepage="team-strip">
      <button
        ref={triggerRef}
        type="button"
        className={styles.teamStripButton}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={`Project team: ${members.length} member${members.length !== 1 ? 's' : ''}`}
      >
        <HbcAvatarStack
          people={people}
          size="sm"
          max={MAX_VISIBLE_AVATARS}
          overflow={members.length > MAX_VISIBLE_AVATARS ? 'count' : 'none'}
        />
        <span className={styles.teamStripLabel}>
          <Users size={11} aria-hidden="true" className={styles.teamStripIcon} />
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </button>

      {isOpen ? (
        <>
          <div
            className={styles.teamBackdrop}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label="Project team members"
            className={styles.teamPanel}
            {...sheetMotionProps}
          >
            <div className={styles.teamPanelHeader}>
              <span>Project Team</span>
              <button
                type="button"
                className={styles.teamPanelClose}
                onClick={() => {
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                aria-label="Close team panel"
              >
                ✕
              </button>
            </div>
            <ul className={styles.teamPanelList}>
              {members.map((member) => (
                <li key={member.id} className={styles.teamPanelRow}>
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.displayName}
                      width={40}
                      height={40}
                      decoding="async"
                      className={styles.teamPanelAvatar}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          'none';
                      }}
                    />
                  ) : (
                    <span
                      className={styles.teamPanelInitials}
                      aria-hidden="true"
                    >
                      {getInitials(member.displayName)}
                    </span>
                  )}
                  <div className={styles.teamPanelBody}>
                    <div className={styles.teamPanelName}>
                      {member.displayName}
                    </div>
                    {member.role ? (
                      <div className={styles.teamPanelRole}>{member.role}</div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}

interface RailTileProps {
  item: ProjectSpotlightRailItem;
}

function RailTile({ item }: RailTileProps): React.JSX.Element {
  const metaText =
    [item.location, item.sector].filter(Boolean).join(' \u00B7 ') ||
    item.freshnessLabel;
  const href = item.cta?.href;
  const commonProps = {
    className: styles.railTile,
    'data-hbc-homepage': 'spotlight-tile',
  };
  const content = (
    <>
      <RailThumbnail image={item.image} />
      <div className={styles.railContent}>
        <p className={styles.railTitle}>{item.title}</p>
        {metaText ? <span className={styles.railMeta}>{metaText}</span> : null}
        {item.isStale || item.status ? (
          <div className={styles.badgeRow}>
            {item.isStale ? (
              <HbcPremiumBadge label="Stale" status="warning" size="sm" />
            ) : null}
            {item.status ? (
              <HbcPremiumBadge
                label={item.status.label}
                status={item.status.variant ?? 'info'}
                size="sm"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        {...commonProps}
        href={href}
        target={item.cta?.openInNewTab ? '_blank' : undefined}
        rel={item.cta?.openInNewTab ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <div {...commonProps} role="listitem">
      {content}
    </div>
  );
}

interface FeaturedSlotProps {
  featured: ProjectSpotlightFeaturedItem;
  reducedMotion: boolean;
}

function FeaturedSlot({
  featured,
  reducedMotion,
}: FeaturedSlotProps): React.JSX.Element {
  const eyebrowText =
    [featured.sector, featured.location].filter(Boolean).join(' \u00B7 ') ||
    'Featured Project';
  const milestones = featured.milestones ?? [];
  const completed = milestones.filter((m) => m.completed).length;
  const total = milestones.length;
  const teamMembers = featured.teamMembers ?? [];

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: {
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.div
      className={styles.featuredWrap}
      aria-label="Featured project spotlight"
      {...motionProps}
    >
      <div className={styles.featuredLayout}>
        <FeaturedMedia image={featured.image} />
        <div className={styles.featuredContent}>
          <HbcHomepageEyebrow>{eyebrowText}</HbcHomepageEyebrow>

          <h3 className={styles.featuredTitle}>{featured.title}</h3>

          {featured.headline ? (
            <p className={styles.featuredHeadline}>{featured.headline}</p>
          ) : null}

          {total > 0 || featured.freshnessLabel ? (
            <HbcHomepageMetadataRow separated>
              {total > 0 ? (
                <span className={styles.metaItem}>
                  <CheckCircle2
                    size={11}
                    aria-hidden="true"
                    className={styles.metaIcon}
                  />
                  {completed}/{total} milestones
                </span>
              ) : null}
              {featured.freshnessLabel ? (
                <span className={styles.metaItem}>
                  <Calendar
                    size={11}
                    aria-hidden="true"
                    className={styles.metaIcon}
                  />
                  {featured.freshnessLabel}
                </span>
              ) : null}
            </HbcHomepageMetadataRow>
          ) : null}

          <p className={styles.featuredSummary}>{featured.summary}</p>

          {featured.status || featured.strategicEmphasis || featured.isStale ? (
            <div className={styles.badgeRow}>
              {featured.isStale ? (
                <HbcPremiumBadge label="Stale" status="warning" size="sm" />
              ) : null}
              {featured.status ? (
                <HbcPremiumBadge
                  label={featured.status.label}
                  status={featured.status.variant ?? 'info'}
                  size="sm"
                />
              ) : null}
              {featured.strategicEmphasis ? (
                <HbcPremiumBadge label="Strategic" status="info" size="sm" />
              ) : null}
            </div>
          ) : null}

          <TeamStrip members={teamMembers} reducedMotion={reducedMotion} />

          {featured.cta ? (
            <div className={styles.featuredCta}>
              <HbcPremiumCta
                label={featured.cta.label}
                href={featured.cta.href}
                variant="secondary"
                size="md"
                arrow
              />
            </div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

interface SupportingRailProps {
  items: ProjectSpotlightRailItem[];
  label: string;
  reducedMotion: boolean;
}

function SupportingRail({
  items,
  label,
  reducedMotion,
}: SupportingRailProps): React.JSX.Element | null {
  if (items.length === 0) return null;

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 8 },
        animate: { opacity: 1, x: 0 },
        transition: {
          duration: 0.35,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
      };

  return (
    <motion.div
      className={styles.rail}
      role="list"
      aria-label="Additional projects"
      {...motionProps}
    >
      <div className={styles.railHeader}>{label}</div>
      {items.map((item) => (
        <RailTile key={item.id} item={item} />
      ))}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function HbcProjectSpotlightSurface({
  model,
  className,
  'aria-label': ariaLabel,
}: HbcProjectSpotlightSurfaceProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const railLabel = model.railLabel ?? 'More projects';

  return (
    <section
      aria-label={ariaLabel ?? model.heading}
      className={clsx(styles.root, className)}
      data-hbc-presentation="project-spotlight-surface"
      data-hbc-homepage="project-spotlight"
    >
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>{model.heading}</h2>
        {model.allProjectsUrl ? (
          <HbcPremiumCta
            label={model.allProjectsLabel ?? 'View all projects'}
            href={model.allProjectsUrl}
            variant="ghost"
            size="sm"
            arrow
          />
        ) : null}
      </div>

      <div role="separator" className={styles.separator} />

      <div className={styles.composition}>
        <FeaturedSlot featured={model.featured} reducedMotion={reducedMotion} />
        <SupportingRail
          items={model.secondary}
          label={railLabel}
          reducedMotion={reducedMotion}
        />
      </div>
    </section>
  );
}
