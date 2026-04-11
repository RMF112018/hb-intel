/**
 * HbcPeopleCultureSurface — Signature People & Culture homepage surface family.
 *
 * Cohesive presentation-lane surface for the warm-celebratory recognition
 * zone: a tall layered gradient hero band with confetti-dot decorative
 * field, a bolder kudos spotlight card with ribbon tag + ringed hero
 * avatar, a per-row recent recognition list, colored-strip announcement
 * rows, celebration tiles, and a celebratory sparse-state invite.
 *
 * W01r-P18 — recognition rebuild. Composes `HbcAvatarStack` and the
 * governed presentation tokens; consumers stay thin. The view-model
 * contract is unchanged from prior versions.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { Sparkles, Users } from 'lucide-react';
import { HbcAvatarStack, type HbcAvatarStackPerson } from '../HbcAvatarStack/index.js';
import { HbcPremiumBadge } from '../HbcPremiumBadge/index.js';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js';
import styles from './people-culture-surface.module.css';

// ---------------------------------------------------------------------------
// View-model contract — decoupled from any consumer data shape
// ---------------------------------------------------------------------------

export type PeopleCultureAnnouncementType =
  | 'promotion'
  | 'newHire'
  | 'baby'
  | 'wedding'
  | 'special';

export type PeopleCultureCelebrationType = 'birthday' | 'anniversary';

export interface PeopleCultureRecipient extends HbcAvatarStackPerson {}

export interface KudosSpotlightItem {
  id: string;
  headline: string;
  excerpt?: string;
  recipients: PeopleCultureRecipient[];
  submittedByName?: string;
  celebrateCount?: number;
  celebrateHref?: string;
}

export interface KudosRailItem {
  id: string;
  headline: string;
  recipients: PeopleCultureRecipient[];
  submittedByName?: string;
  celebrateCount?: number;
}

export interface PeopleCultureAnnouncement {
  id: string;
  personName: string;
  headline: string;
  type: PeopleCultureAnnouncementType;
}

export interface PeopleCultureCelebration {
  id: string;
  personName: string;
  type: PeopleCultureCelebrationType;
  celebrationDate: string;
  anniversaryYears?: number;
  avatarSrc?: string;
}

export interface PeopleCultureKudosModel {
  isEmpty: boolean;
  featured?: KudosSpotlightItem;
  recent?: KudosRailItem[];
}

export interface PeopleCultureSurfaceModel {
  heading: string;
  kudos: PeopleCultureKudosModel;
  announcements: PeopleCultureAnnouncement[];
  celebrations: PeopleCultureCelebration[];
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Layout variant. `"people-culture-homepage"` opts into a scoped
 * homepage-fit refinement designed for the PeopleCultureMerged
 * webpart's narrow SharePoint column (tighter hero, spotlight,
 * recent recognition list, and right-side rail; rail always renders
 * full-width below the spotlight instead of as a 2-col sidebar).
 * Default is the wider authored recognition scale used by other
 * consumers.
 */
export type HbcPeopleCultureSurfaceVariant = 'default' | 'people-culture-homepage';

export interface HbcPeopleCultureSurfaceProps {
  model: PeopleCultureSurfaceModel;
  /** Open the kudos composer (or any consumer-defined create flow). */
  onGiveKudos?: () => void;
  /** href for the "View All" CTA in the hero band. */
  viewAllHref?: string;
  /** href for the "Celebrate" CTA in the featured spotlight card. */
  celebrateHref?: string;
  /** Hero eyebrow tag. Defaults to "People & Culture". */
  heroEyebrow?: string;
  /** Hero sub-caption under the headline. Defaults to "Celebrating our people". */
  heroSubcaption?: string;
  /**
   * Layout variant. Use `"people-culture-homepage"` from
   * PeopleCultureMerged to opt into the homepage-fit refinement.
   * Defaults to `"default"` so other recognition consumers are
   * unaffected.
   */
  variant?: HbcPeopleCultureSurfaceVariant;
  /**
   * Optional content rendered after the main body, inside the
   * surface container. Useful for archive or browse zones that
   * should visually belong to the same surface.
   */
  footer?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ANN_LABEL: Record<PeopleCultureAnnouncementType, string> = {
  promotion: 'Promoted',
  newHire: 'New Hire',
  baby: 'Baby',
  wedding: 'Wedding',
  special: 'Special',
};

const ANN_BADGE: Record<
  PeopleCultureAnnouncementType,
  'info' | 'success' | 'warning' | 'critical'
> = {
  promotion: 'critical',
  newHire: 'info',
  baby: 'success',
  wedding: 'success',
  special: 'warning',
};

const ANN_STRIP_CLASS: Record<PeopleCultureAnnouncementType, string> = {
  promotion: styles.announcementRowPromotion,
  newHire: styles.announcementRowNewHire,
  baby: styles.announcementRowBaby,
  wedding: styles.announcementRowWedding,
  special: styles.announcementRowSpecial,
};

function fmtRecipients(recipients: PeopleCultureRecipient[]): string {
  if (recipients.length === 0) return '';
  if (recipients.length === 1) return recipients[0]!.name;
  if (recipients.length === 2) return `${recipients[0]!.name} and ${recipients[1]!.name}`;
  return `${recipients[0]!.name}, ${recipients[1]!.name}, and ${recipients.length - 2} more`;
}

function relDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  const days = Math.round((ms - Date.now()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1 && days <= 7) return `In ${days} days`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [number, number, number, number];

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface HeroBannerProps {
  heading: string;
  eyebrow: string;
  subcaption: string;
  onGiveKudos?: () => void;
  viewAllHref?: string;
}

function HeroBanner({
  heading,
  eyebrow,
  subcaption,
  onGiveKudos,
  viewAllHref,
}: HeroBannerProps): React.JSX.Element {
  return (
    <div className={styles.hero}>
      <div className={styles.heroDecorA} aria-hidden="true" />
      <div className={styles.heroDecorB} aria-hidden="true" />
      <div className={styles.heroDots} aria-hidden="true" />

      <div className={styles.heroCopy}>
        <span className={styles.heroEyebrow}>
          <span className={styles.heroEyebrowDot} aria-hidden="true" />
          {eyebrow}
        </span>
        <h2 className={styles.heroHeading}>
          <span className={styles.heroIcon} aria-hidden="true">
            <Users size={18} strokeWidth={2.25} />
          </span>
          {heading}
        </h2>
        <p className={styles.heroSubcaption}>{subcaption}</p>
      </div>

      <div className={styles.heroActions}>
        {onGiveKudos ? (
          <button type="button" onClick={onGiveKudos} className={styles.giveKudosPrimary}>
            <Sparkles size={14} aria-hidden="true" className={styles.giveKudosPrimaryIcon} />
            Give Kudos
          </button>
        ) : null}
        {viewAllHref ? (
          <HbcPremiumCta
            label="View All"
            href={viewAllHref}
            variant="onDark"
            size="sm"
            arrow
          />
        ) : null}
      </div>
    </div>
  );
}

interface KudosSpotlightProps {
  featured: KudosSpotlightItem;
  recent: KudosRailItem[];
  onGiveKudos?: () => void;
  celebrateHref?: string;
  reducedMotion: boolean;
  isHomepage?: boolean;
}

function KudosSpotlight({
  featured,
  recent,
  onGiveKudos,
  celebrateHref,
  reducedMotion,
  isHomepage,
}: KudosSpotlightProps): React.JSX.Element {
  const recipientLabel = fmtRecipients(featured.recipients);
  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: EASE_OUT_EXPO },
      };

  return (
    <motion.div className={styles.spotlight} {...motionProps}>
      <article className={styles.spotlightCard}>
        <span className={styles.spotlightRibbon} aria-hidden="true">
          <Sparkles size={10} className={styles.spotlightRibbonStar} strokeWidth={2.5} />
          Kudos Spotlight
        </span>

        <div className={styles.spotlightAvatars}>
          <div className={styles.spotlightHeroAvatarRing}>
            <div className={styles.spotlightHeroAvatarRingInner}>
              <HbcAvatarStack people={featured.recipients.slice(0, 1)} size="xl" />
            </div>
          </div>
          {featured.recipients.length > 1 ? (
            <div className={styles.spotlightAvatarStrip}>
              <HbcAvatarStack
                people={featured.recipients.slice(1, 5)}
                size="sm"
                max={4}
              />
            </div>
          ) : null}
        </div>

        <div className={styles.spotlightContent}>
          {isHomepage ? (
            <span className={styles.spotlightEyebrow}>Featured Recognition</span>
          ) : null}

          <h3 className={styles.spotlightTitle}>{featured.headline}</h3>

          {recipientLabel ? (
            <span className={styles.spotlightRecipientTag}>{recipientLabel}</span>
          ) : null}

          {featured.excerpt ? (
            <p className={styles.spotlightExcerpt}>{featured.excerpt}</p>
          ) : null}

          <div className={styles.spotlightMeta}>
            {featured.submittedByName ? (
              <span className={styles.metaItem}>
                <Users size={12} aria-hidden="true" className={styles.metaIcon} />
                {featured.submittedByName}
              </span>
            ) : null}
            {typeof featured.celebrateCount === 'number' && featured.celebrateCount > 0 ? (
              <span className={styles.metaCount}>
                <Sparkles
                  size={11}
                  aria-hidden="true"
                  className={styles.metaCountIcon}
                  strokeWidth={2.5}
                />
                {featured.celebrateCount}
              </span>
            ) : null}
          </div>

          {celebrateHref || onGiveKudos ? (
            <div className={styles.spotlightActions}>
              {celebrateHref ? (
                <HbcPremiumCta
                  label="Celebrate"
                  href={celebrateHref}
                  variant={isHomepage ? 'onDark' : 'primary'}
                  size="sm"
                  arrow
                />
              ) : null}
              {onGiveKudos && !celebrateHref ? (
                <button type="button" onClick={onGiveKudos} className={styles.giveKudosGhostInline}>
                  <Sparkles size={13} aria-hidden="true" strokeWidth={2.5} />
                  Give Kudos
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </article>

      {recent.length > 0 ? (
        <div className={styles.recentList}>
          <div className={styles.sectionLabel}>
            <span>Recent recognition</span>
            <span className={styles.sectionLabelRule} aria-hidden="true" />
          </div>
          {recent.map((item) => (
            <div key={item.id} className={styles.recentRow}>
              <HbcAvatarStack people={item.recipients.slice(0, 1)} size="md" />
              <div className={styles.recentBody}>
                <div className={styles.recentHeadline}>{item.headline}</div>
                <span className={styles.recentMeta}>
                  {fmtRecipients(item.recipients) ? fmtRecipients(item.recipients) : ''}
                  {item.submittedByName
                    ? `${fmtRecipients(item.recipients) ? '  ·  ' : ''}by ${item.submittedByName}`
                    : ''}
                </span>
              </div>
              {typeof item.celebrateCount === 'number' && item.celebrateCount > 0 ? (
                <span className={styles.recentCount}>
                  <Sparkles size={10} aria-hidden="true" strokeWidth={2.5} />
                  {item.celebrateCount}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

interface RecognitionRailProps {
  announcements: PeopleCultureAnnouncement[];
  celebrations: PeopleCultureCelebration[];
  viewAllHref?: string;
  reducedMotion: boolean;
}

function RecognitionRail({
  announcements,
  celebrations,
  viewAllHref,
  reducedMotion,
}: RecognitionRailProps): React.JSX.Element | null {
  if (announcements.length === 0 && celebrations.length === 0) return null;

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 10 },
        animate: { opacity: 1, x: 0 },
        transition: { duration: 0.4, delay: 0.15, ease: EASE_OUT_EXPO },
      };

  return (
    <motion.div className={styles.rail} {...motionProps}>
      {announcements.length > 0 ? (
        <div className={styles.railHighlights}>
          <div className={styles.sectionLabel}>
            <span>Highlights</span>
            <span className={styles.sectionLabelRule} aria-hidden="true" />
          </div>
          <div className={styles.announcementList}>
            {announcements.map((item) => (
              <div
                key={item.id}
                className={clsx(styles.announcementRow, ANN_STRIP_CLASS[item.type])}
              >
                <div className={styles.announcementBody}>
                  <div className={styles.announcementName}>{item.personName}</div>
                  <div className={styles.announcementHeadline}>{item.headline}</div>
                </div>
                <HbcPremiumBadge
                  label={ANN_LABEL[item.type]}
                  status={ANN_BADGE[item.type]}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {celebrations.length > 0 ? (
        <div className={styles.railCelebrations}>
          <div className={styles.sectionLabel}>
            <span>This week</span>
            <span className={styles.sectionLabelRule} aria-hidden="true" />
          </div>
          <div className={styles.celebrationGrid}>
            {celebrations.map((item) => {
              const label =
                item.type === 'anniversary' && item.anniversaryYears
                  ? `${item.anniversaryYears} yr anniversary`
                  : item.type === 'birthday'
                    ? 'Birthday'
                    : 'Anniversary';
              const datePart = relDate(item.celebrationDate);
              return (
                <div key={item.id} className={styles.celebrationTile}>
                  <div className={styles.celebrationAvatar} aria-hidden="true">
                    <div className={styles.celebrationAvatarInner}>
                      <HbcAvatarStack
                        people={[{ id: item.id, name: item.personName, src: item.avatarSrc }]}
                        size="md"
                      />
                    </div>
                  </div>
                  <div className={styles.celebrationText}>
                    <div className={styles.celebrationName}>
                      {item.personName.split(' ')[0]}
                    </div>
                    <div className={styles.celebrationMeta}>
                      {label}
                      {datePart ? `  ·  ${datePart}` : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {viewAllHref ? (
        <div className={styles.railFooter}>
          <HbcPremiumCta label="View all" href={viewAllHref} variant="ghost" size="sm" arrow />
        </div>
      ) : null}
    </motion.div>
  );
}

interface SparseInviteProps {
  announcements: PeopleCultureAnnouncement[];
  celebrations: PeopleCultureCelebration[];
  onGiveKudos?: () => void;
  reducedMotion: boolean;
}

function SparseInvite({
  announcements,
  celebrations,
  onGiveKudos,
  reducedMotion,
}: SparseInviteProps): React.JSX.Element {
  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: EASE_OUT_EXPO },
      };

  return (
    <motion.div className={styles.sparse} {...motionProps}>
      <div className={styles.sparseInvite}>
        <div className={styles.sparseIcon} aria-hidden="true">
          <Sparkles size={30} strokeWidth={2.2} />
        </div>
        <div className={styles.sparseTitle}>Recognize a teammate</div>
        <p className={styles.sparseBody}>
          Be the first to spotlight great work, a team win, or everyday excellence.
          Your kudos keeps the whole company noticing the people who make it happen.
        </p>
        {onGiveKudos ? (
          <button type="button" onClick={onGiveKudos} className={styles.giveKudosSolid}>
            <Sparkles size={16} aria-hidden="true" strokeWidth={2.5} />
            Give Kudos
          </button>
        ) : null}
      </div>

      {announcements.length > 0 ? (
        <div>
          <div className={styles.sectionLabel}>
            <span>Highlights</span>
            <span className={styles.sectionLabelRule} aria-hidden="true" />
          </div>
          <div className={styles.announcementList}>
            {announcements.map((item) => (
              <div
                key={item.id}
                className={clsx(styles.announcementRow, ANN_STRIP_CLASS[item.type])}
              >
                <div className={styles.announcementBody}>
                  <div className={styles.announcementName}>{item.personName}</div>
                  <div className={styles.announcementHeadline}>{item.headline}</div>
                </div>
                <HbcPremiumBadge
                  label={ANN_LABEL[item.type]}
                  status={ANN_BADGE[item.type]}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {celebrations.length > 0 ? (
        <div>
          <div className={styles.sectionLabel}>
            <span>This week</span>
            <span className={styles.sectionLabelRule} aria-hidden="true" />
          </div>
          <div className={styles.celebrationGrid}>
            {celebrations.map((item) => {
              const label =
                item.type === 'birthday'
                  ? 'Birthday'
                  : item.anniversaryYears
                    ? `${item.anniversaryYears} yr anniversary`
                    : 'Anniversary';
              return (
                <div key={item.id} className={styles.celebrationTile}>
                  <div className={styles.celebrationAvatar} aria-hidden="true">
                    <div className={styles.celebrationAvatarInner}>
                      <HbcAvatarStack
                        people={[{ id: item.id, name: item.personName, src: item.avatarSrc }]}
                        size="md"
                      />
                    </div>
                  </div>
                  <div className={styles.celebrationText}>
                    <div className={styles.celebrationName}>
                      {item.personName.split(' ')[0]}
                    </div>
                    <div className={styles.celebrationMeta}>{label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export function HbcPeopleCultureSurface({
  model,
  onGiveKudos,
  viewAllHref,
  celebrateHref,
  heroEyebrow = 'People & Culture',
  heroSubcaption = 'Celebrating our people',
  variant = 'default',
  footer,
  className,
  'aria-label': ariaLabel,
}: HbcPeopleCultureSurfaceProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const showSpotlight = !model.kudos.isEmpty && model.kudos.featured;
  const isHomepage = variant === 'people-culture-homepage';

  return (
    <section
      aria-label={ariaLabel ?? model.heading}
      className={clsx(
        styles.root,
        isHomepage && styles.peopleCultureHomepage,
        className,
      )}
      data-hbc-presentation="people-culture-surface"
      data-hbc-homepage="people-culture"
      data-hbc-people-culture-variant={variant}
    >
      <HeroBanner
        heading={model.heading}
        eyebrow={heroEyebrow}
        subcaption={heroSubcaption}
        onGiveKudos={onGiveKudos}
        viewAllHref={viewAllHref}
      />

      {showSpotlight ? (
        <div className={styles.body}>
          <KudosSpotlight
            featured={model.kudos.featured!}
            recent={model.kudos.recent ?? []}
            onGiveKudos={onGiveKudos}
            celebrateHref={celebrateHref}
            reducedMotion={reducedMotion}
            isHomepage={isHomepage}
          />
          <RecognitionRail
            announcements={model.announcements}
            celebrations={model.celebrations}
            viewAllHref={viewAllHref}
            reducedMotion={reducedMotion}
          />
        </div>
      ) : (
        <SparseInvite
          announcements={model.announcements}
          celebrations={model.celebrations}
          onGiveKudos={onGiveKudos}
          reducedMotion={reducedMotion}
        />
      )}

      {footer ? <div className={styles.surfaceFooter}>{footer}</div> : null}
    </section>
  );
}

