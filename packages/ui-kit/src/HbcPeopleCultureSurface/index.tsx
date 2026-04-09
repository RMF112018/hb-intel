/**
 * HbcPeopleCultureSurface — Signature People & Culture homepage surface family.
 *
 * Cohesive presentation-lane surface for the warm-celebratory recognition
 * zone: a gradient hero band, kudos spotlight + recognition rail, and a
 * sparse-state invite when no featured kudos exist. Composes HbcAvatarStack
 * and the governed presentation tokens; consumers stay thin.
 *
 * Wave 01 follow-on: People & Culture migration to @hbc/ui-kit/homepage.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';
import { CheckCircle2, Users } from 'lucide-react';
import { HbcAvatarStack, type HbcAvatarStackPerson } from '../HbcAvatarStack/index.js';
import { HbcPremiumBadge } from '../HbcPremiumBadge/index.js';
import { HbcPremiumCta } from '../HbcPremiumCta/index.js';
import { HbcHomepageMetadataRow } from '../HbcHomepageMetadataRow/index.js';
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

export interface HbcPeopleCultureSurfaceProps {
  model: PeopleCultureSurfaceModel;
  /** Open the kudos composer (or any consumer-defined create flow). */
  onGiveKudos?: () => void;
  /** href for the "View All" CTA in the hero band. */
  viewAllHref?: string;
  /** href for the "Celebrate" CTA in the featured spotlight card. */
  celebrateHref?: string;
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

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

interface HeroBannerProps {
  heading: string;
  onGiveKudos?: () => void;
  viewAllHref?: string;
}

function HeroBanner({ heading, onGiveKudos, viewAllHref }: HeroBannerProps): React.JSX.Element {
  return (
    <div className={styles.hero}>
      <div className={styles.heroDecorA} aria-hidden="true" />
      <div className={styles.heroDecorB} aria-hidden="true" />

      <h2 className={styles.heroHeading}>
        <Users size={18} aria-hidden="true" className={styles.heroIcon} />
        {heading}
      </h2>

      <div className={styles.heroActions}>
        {onGiveKudos ? (
          <button type="button" onClick={onGiveKudos} className={styles.giveKudosGhost}>
            Give Kudos
          </button>
        ) : null}
        {viewAllHref ? (
          <HbcPremiumCta label="View All" href={viewAllHref} variant="ghost" size="sm" arrow />
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
}

function KudosSpotlight({
  featured,
  recent,
  onGiveKudos,
  celebrateHref,
  reducedMotion,
}: KudosSpotlightProps): React.JSX.Element {
  const recipientLabel = fmtRecipients(featured.recipients);
  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      };

  return (
    <motion.div className={styles.spotlight} {...motionProps}>
      <article className={styles.spotlightCard}>
        <div className={styles.spotlightAvatars}>
          <HbcAvatarStack people={featured.recipients.slice(0, 1)} size="xl" ring />
          {featured.recipients.length > 1 ? (
            <div className={styles.spotlightAvatarStrip}>
              <HbcAvatarStack people={featured.recipients.slice(1, 4)} size="xs" />
            </div>
          ) : null}
        </div>

        <div className={styles.spotlightContent}>
          <span className={styles.eyebrow}>Kudos Spotlight</span>
          <h3 className={styles.spotlightTitle}>{featured.headline}</h3>

          {recipientLabel ? (
            <span className={styles.spotlightRecipients}>{recipientLabel}</span>
          ) : null}

          {featured.excerpt ? (
            <p className={styles.spotlightExcerpt}>{featured.excerpt}</p>
          ) : null}

          <HbcHomepageMetadataRow separated>
            {featured.submittedByName ? (
              <span className={styles.metaItem}>
                <Users size={11} aria-hidden="true" className={styles.metaIcon} />
                by {featured.submittedByName}
              </span>
            ) : null}
            {typeof featured.celebrateCount === 'number' && featured.celebrateCount > 0 ? (
              <span className={styles.metaCount}>
                <CheckCircle2 size={11} aria-hidden="true" />
                {featured.celebrateCount}
              </span>
            ) : null}
          </HbcHomepageMetadataRow>

          <div className={styles.spotlightActions}>
            {celebrateHref ? (
              <HbcPremiumCta
                label="Celebrate"
                href={celebrateHref}
                variant="secondary"
                size="sm"
              />
            ) : null}
            {onGiveKudos ? (
              <button type="button" onClick={onGiveKudos} className={styles.giveKudosGhostInline}>
                Give Kudos
                <span aria-hidden="true">→</span>
              </button>
            ) : null}
          </div>
        </div>
      </article>

      {recent.length > 0 ? (
        <div className={styles.recentList}>
          <div className={styles.sectionLabel}>Recent Recognition</div>
          {recent.map((item, idx) => (
            <div
              key={item.id}
              className={clsx(styles.recentRow, idx > 0 && styles.recentRowDivided)}
            >
              <HbcAvatarStack people={item.recipients.slice(0, 1)} size="sm" />
              <div className={styles.recentBody}>
                <div className={styles.recentHeadline}>{item.headline}</div>
                <span className={styles.recentMeta}>
                  {fmtRecipients(item.recipients) ? `${fmtRecipients(item.recipients)} · ` : ''}
                  {item.submittedByName ? `by ${item.submittedByName}` : ''}
                </span>
              </div>
              {typeof item.celebrateCount === 'number' && item.celebrateCount > 0 ? (
                <span className={styles.recentCount}>{item.celebrateCount}</span>
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
        transition: { duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      };

  return (
    <motion.div className={styles.rail} {...motionProps}>
      {announcements.length > 0 ? (
        <div className={styles.railHighlights}>
          <div className={styles.sectionLabel}>Highlights</div>
          {announcements.map((item, idx) => (
            <div
              key={item.id}
              className={clsx(styles.announcementRow, idx > 0 && styles.announcementRowDivided)}
            >
              <div className={styles.announcementBody}>
                <div className={styles.announcementName}>{item.personName}</div>
                <div className={styles.announcementHeadline}>{item.headline}</div>
              </div>
              <HbcPremiumBadge label={ANN_LABEL[item.type]} status={ANN_BADGE[item.type]} size="sm" />
            </div>
          ))}
        </div>
      ) : null}

      {celebrations.length > 0 ? (
        <div className={styles.railCelebrations}>
          <div className={styles.sectionLabel}>This Week</div>
          <div className={styles.celebrationChips}>
            {celebrations.map((item) => {
              const label =
                item.type === 'anniversary' && item.anniversaryYears
                  ? `${item.anniversaryYears} yr`
                  : item.type === 'birthday'
                    ? 'Birthday'
                    : 'Anniv.';
              const datePart = relDate(item.celebrationDate);
              return (
                <div key={item.id} className={styles.celebrationChip}>
                  <HbcAvatarStack
                    people={[{ id: item.id, name: item.personName, src: item.avatarSrc }]}
                    size="xs"
                  />
                  <div className={styles.celebrationText}>
                    <div className={styles.celebrationName}>{item.personName.split(' ')[0]}</div>
                    <div className={styles.celebrationMeta}>
                      {label}
                      {datePart ? ` · ${datePart}` : ''}
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
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      };

  return (
    <motion.div className={styles.sparse} {...motionProps}>
      <div className={styles.sparseInvite}>
        <div className={styles.sparseIcon} aria-hidden="true">
          <CheckCircle2 size={22} />
        </div>
        <div className={styles.sparseTitle}>Recognize a teammate</div>
        <p className={styles.sparseBody}>
          Be the first to spotlight great work, team wins, or everyday excellence.
        </p>
        {onGiveKudos ? (
          <button type="button" onClick={onGiveKudos} className={styles.giveKudosSolid}>
            Give Kudos
            <span aria-hidden="true">→</span>
          </button>
        ) : null}
      </div>

      {announcements.length > 0 ? (
        <div>
          <div className={styles.sectionLabel}>Highlights</div>
          {announcements.map((item) => (
            <div key={item.id} className={styles.sparseAnnouncementRow}>
              <HbcPremiumBadge label={ANN_LABEL[item.type]} status={ANN_BADGE[item.type]} size="sm" />
              <div className={styles.announcementBody}>
                <div className={styles.announcementName}>{item.personName}</div>
                <div className={styles.announcementHeadline}>{item.headline}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {celebrations.length > 0 ? (
        <div>
          <div className={styles.sectionLabel}>This Week</div>
          <div className={styles.celebrationChips}>
            {celebrations.map((item) => {
              const label =
                item.type === 'birthday'
                  ? 'Birthday'
                  : item.anniversaryYears
                    ? `${item.anniversaryYears} yr`
                    : 'Anniv.';
              return (
                <div key={item.id} className={styles.celebrationChip}>
                  <HbcAvatarStack
                    people={[{ id: item.id, name: item.personName, src: item.avatarSrc }]}
                    size="xs"
                  />
                  <div className={styles.celebrationText}>
                    <div className={styles.celebrationName}>{item.personName.split(' ')[0]}</div>
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
  className,
  'aria-label': ariaLabel,
}: HbcPeopleCultureSurfaceProps): React.JSX.Element {
  const reducedMotion = usePrefersReducedMotion();
  const showSpotlight = !model.kudos.isEmpty && model.kudos.featured;

  return (
    <section
      aria-label={ariaLabel ?? model.heading}
      className={clsx(styles.root, className)}
      data-hbc-presentation="people-culture-surface"
      data-hbc-homepage="people-culture"
    >
      <HeroBanner heading={model.heading} onGiveKudos={onGiveKudos} viewAllHref={viewAllHref} />

      {showSpotlight ? (
        <div className={styles.body}>
          <KudosSpotlight
            featured={model.kudos.featured!}
            recent={model.kudos.recent ?? []}
            onGiveKudos={onGiveKudos}
            celebrateHref={celebrateHref}
            reducedMotion={reducedMotion}
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
    </section>
  );
}
