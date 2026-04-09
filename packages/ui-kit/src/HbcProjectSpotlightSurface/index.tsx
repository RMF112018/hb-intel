/**
 * HbcProjectSpotlightSurface — Flagship project / portfolio spotlight
 * surface family.
 *
 * Cohesive presentation-lane surface for the "Project Spotlight" zone on
 * the HB Central homepage: an editorial nameplate masthead, a dominant
 * image-led featured project with overlay eyebrow/status chips and a
 * two-stop editorial scrim, a dedicated milestone strip, a team detail
 * panel (desktop popover / mobile bottom sheet), and a subordinate but
 * premium supporting rail with numbered editorial index.
 *
 * W01r-P19 — flagship rebuild. Mirrors the HbcNewsroomSurface masthead
 * and nameplate pattern so the operational zone still reads as brand-
 * consistent with the communications lanes. Consumers stay thin —
 * SharePoint fetch, normalization, audience filtering, stale detection,
 * and manifest fallback remain local to the webpart.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Briefcase, Calendar, Check, CheckCircle2, Users } from 'lucide-react';
import {
  HbcAvatarStack,
  type HbcAvatarStackPerson,
} from '../HbcAvatarStack/index.js';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
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
  /** Masthead eyebrow. Defaults to "Portfolio". */
  sectionEyebrow?: string;
  /** Label for the supporting rail column. Defaults to "More projects". */
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

function formatEditorialIndex(index: number): string {
  return index < 10 ? `0${index}` : String(index);
}

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface MastheadProps {
  heading: string;
  eyebrow: string;
  latestFreshnessLabel?: string;
  allProjectsLabel?: string;
  allProjectsUrl?: string;
}

function Masthead({
  heading,
  eyebrow,
  latestFreshnessLabel,
  allProjectsLabel,
  allProjectsUrl,
}: MastheadProps): React.JSX.Element {
  return (
    <div className={styles.masthead}>
      <div className={styles.mastheadEyebrow}>
        <span className={styles.mastheadEyebrowIcon} aria-hidden="true">
          <Briefcase size={14} strokeWidth={2.25} />
        </span>
        <span>{eyebrow}</span>
        <span className={styles.mastheadEyebrowRule} aria-hidden="true" />
        {latestFreshnessLabel ? (
          <span className={styles.mastheadEyebrowDate}>{latestFreshnessLabel}</span>
        ) : null}
      </div>
      <div className={styles.mastheadRow}>
        <h2 className={styles.mastheadHeadline}>{heading}</h2>
        {allProjectsUrl ? (
          <div className={styles.mastheadAction}>
            <HbcPremiumCta
              label={allProjectsLabel ?? 'View all projects'}
              href={allProjectsUrl}
              variant="ghost"
              size="sm"
              arrow
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface FeaturedMediaProps {
  image?: ProjectSpotlightMedia;
  eyebrowText: string;
  status?: ProjectSpotlightStatus;
  strategicEmphasis?: boolean;
  isStale?: boolean;
}

function FeaturedMedia({
  image,
  eyebrowText,
  status,
  strategicEmphasis,
  isStale,
}: FeaturedMediaProps): React.JSX.Element {
  const [errored, setErrored] = React.useState(false);
  const statusLabel = status?.label;
  const hasOverlayChips = Boolean(statusLabel || strategicEmphasis || isStale);

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
      <div className={styles.mediaOverlay}>
        <span className={styles.mediaOverlayEyebrow}>
          <span className={styles.mediaOverlayEyebrowDot} aria-hidden="true" />
          {eyebrowText}
        </span>
        {hasOverlayChips ? (
          <div className={styles.mediaBadgeRow}>
            {statusLabel ? (
              <span className={styles.mediaOverlayChip}>{statusLabel}</span>
            ) : null}
            {strategicEmphasis ? (
              <span
                className={clsx(styles.mediaOverlayChip, styles.mediaOverlayChipStrategic)}
              >
                Strategic
              </span>
            ) : null}
            {isStale ? (
              <span
                className={clsx(styles.mediaOverlayChip, styles.mediaOverlayChipStale)}
              >
                Stale
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
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
        width={100}
        height={72}
        decoding="async"
        loading="lazy"
        className={styles.railThumbImg}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

interface MilestoneStripProps {
  milestones: ProjectSpotlightMilestone[];
}

function MilestoneStrip({ milestones }: MilestoneStripProps): React.JSX.Element | null {
  if (milestones.length === 0) return null;
  const completed = milestones.filter((m) => m.completed).length;
  const total = milestones.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className={styles.milestones}>
      <div className={styles.milestonesHeader}>
        <span className={styles.milestonesLabel}>
          <CheckCircle2 size={12} aria-hidden="true" strokeWidth={2.5} />
          Milestones
        </span>
        <span className={styles.milestonesProgress}>
          {completed}/{total}  ·  {percent}%
        </span>
      </div>
      <div className={styles.milestonesBar}>
        <div
          className={styles.milestonesBarFill}
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>
      <ul className={styles.milestonesList}>
        {milestones.map((milestone) => (
          <li
            key={milestone.id}
            className={clsx(
              styles.milestoneItem,
              milestone.completed && styles.milestoneItemDone,
            )}
          >
            {milestone.completed ? (
              <span className={styles.milestoneCheck} aria-hidden="true">
                <Check size={11} strokeWidth={3} />
              </span>
            ) : (
              <span className={styles.milestoneCheckEmpty} aria-hidden="true" />
            )}
            <span className={styles.milestoneText}>{milestone.title}</span>
          </li>
        ))}
      </ul>
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
        transition: { duration: 0.25, ease: EASE_OUT_EXPO },
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
          <Users size={12} aria-hidden="true" className={styles.teamStripIcon} strokeWidth={2.25} />
          {members.length} {members.length === 1 ? 'team member' : 'team members'}
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
                      width={42}
                      height={42}
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
  index: number;
}

function RailTile({ item, index }: RailTileProps): React.JSX.Element {
  const metaText =
    [item.location, item.sector].filter(Boolean).join(' \u00B7 ') ||
    item.freshnessLabel;
  const href = item.cta?.href;
  const label = formatEditorialIndex(index);
  const content = (
    <>
      <span className={styles.railIndex} aria-hidden="true">
        {label}
      </span>
      <RailThumbnail image={item.image} />
      <div className={styles.railContent}>
        <p className={styles.railTitle}>{item.title}</p>
        {metaText ? <span className={styles.railMeta}>{metaText}</span> : null}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={item.cta?.openInNewTab ? '_blank' : undefined}
        rel={item.cta?.openInNewTab ? 'noopener noreferrer' : undefined}
        className={styles.railTile}
        data-hbc-homepage="spotlight-tile"
      >
        {content}
      </a>
    );
  }
  return (
    <div
      className={styles.railTile}
      data-hbc-homepage="spotlight-tile"
      role="listitem"
    >
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
  const teamMembers = featured.teamMembers ?? [];

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: EASE_OUT_EXPO },
      };

  return (
    <motion.article
      className={styles.featuredLayout}
      aria-label="Featured project spotlight"
      {...motionProps}
    >
      <FeaturedMedia
        image={featured.image}
        eyebrowText={eyebrowText}
        status={featured.status}
        strategicEmphasis={featured.strategicEmphasis}
        isStale={featured.isStale}
      />

      <div className={styles.featuredContent}>
        <h3 className={styles.featuredTitle}>{featured.title}</h3>

        {featured.headline ? (
          <p className={styles.featuredHeadline}>{featured.headline}</p>
        ) : null}

        {featured.summary ? (
          <p className={styles.featuredSummary}>{featured.summary}</p>
        ) : null}

        <MilestoneStrip milestones={milestones} />

        {featured.freshnessLabel ? (
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <Calendar
                size={12}
                aria-hidden="true"
                className={styles.metaIcon}
                strokeWidth={2.25}
              />
              {featured.freshnessLabel}
            </span>
          </div>
        ) : null}

        <TeamStrip members={teamMembers} reducedMotion={reducedMotion} />

        {featured.cta ? (
          <div className={styles.featuredCta}>
            <HbcPremiumCta
              label={featured.cta.label}
              href={featured.cta.href}
              variant="primary"
              size="md"
              arrow
            />
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

interface SupportingRailProps {
  items: ProjectSpotlightRailItem[];
  label: string;
  allProjectsLabel?: string;
  allProjectsUrl?: string;
  reducedMotion: boolean;
}

function SupportingRail({
  items,
  label,
  allProjectsLabel,
  allProjectsUrl,
  reducedMotion,
}: SupportingRailProps): React.JSX.Element | null {
  if (items.length === 0) return null;

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 8 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4, delay: 0.2, ease: EASE_OUT_EXPO },
      };

  return (
    <motion.div
      className={styles.rail}
      role="list"
      aria-label="Additional projects"
      {...motionProps}
    >
      <div className={styles.railHeader}>
        <span>{label}</span>
        <span className={styles.railHeaderRule} aria-hidden="true" />
      </div>
      {items.map((item, i) => (
        <RailTile key={item.id} item={item} index={i + 1} />
      ))}
      {allProjectsUrl ? (
        <div className={styles.railFooter}>
          <HbcPremiumCta
            label={allProjectsLabel ?? 'View all projects'}
            href={allProjectsUrl}
            variant="ghost"
            size="sm"
            arrow
          />
        </div>
      ) : null}
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
  const sectionEyebrow = model.sectionEyebrow ?? 'Portfolio';

  return (
    <section
      aria-label={ariaLabel ?? model.heading}
      className={clsx(styles.root, className)}
      data-hbc-presentation="project-spotlight-surface"
      data-hbc-homepage="project-spotlight"
    >
      <Masthead
        heading={model.heading}
        eyebrow={sectionEyebrow}
        latestFreshnessLabel={model.featured.freshnessLabel}
        allProjectsLabel={model.allProjectsLabel}
        allProjectsUrl={model.allProjectsUrl}
      />

      <hr className={styles.separator} />

      <div className={styles.composition}>
        <div className={styles.featuredWrap}>
          <FeaturedSlot featured={model.featured} reducedMotion={reducedMotion} />
        </div>
        <SupportingRail
          items={model.secondary}
          label={railLabel}
          allProjectsLabel={model.allProjectsLabel}
          allProjectsUrl={model.allProjectsUrl}
          reducedMotion={reducedMotion}
        />
      </div>

      <div className={styles.bottomSpacer} aria-hidden="true" />
    </section>
  );
}
