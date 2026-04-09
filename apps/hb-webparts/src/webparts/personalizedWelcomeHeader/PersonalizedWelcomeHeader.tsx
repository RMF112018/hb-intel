/**
 * PersonalizedWelcomeHeader — Subordinate day-start context strip
 *
 * W01r-P16 — Repositioned from "second hero" to a quieter day-start
 * surface that sits below or alongside the flagship masthead.
 *
 * Role:
 *   The flagship homepage masthead ({@link HbSignatureHero}) owns the
 *   dominant "Good morning, [Name] / Build with GRIT." moment. This
 *   webpart was previously rendering the same greeting at hero scale
 *   (2rem brand-blue headline) and visually competed with the masthead
 *   even though it was already classified as standalone in Phase 18-01.
 *
 *   In this rebuild it becomes a presentation-lane day-start strip:
 *     - a brand-tinted date tear-off block (weekday + day + month),
 *     - a quiet "Welcome back, [Name]" eyebrow + moderate-scale name,
 *     - an optional support / context line,
 *     - an optional alert column (HbcPremiumBadge + message)
 *
 *   Type scale, color treatment, and motion are deliberately quieter
 *   than HbSignatureHero so the two surfaces never compete.
 *
 * Token discipline:
 *   Anchored to the presentation-lane brand foundation
 *   (HBC_PRESENTATION_BLUE_RGB / HBC_PRESENTATION_ORANGE_RGB) via CSS
 *   custom properties exposed on the root section by this component.
 *   The CSS module references those variables in the date block,
 *   eyebrow, accent glow, and alert column.
 *
 * Accessibility:
 *   - Root is a <section> with an explicit aria-label
 *   - Date block exposes weekday, month, and day as readable text
 *   - Decorative icons are aria-hidden
 *   - prefers-reduced-motion is respected via the framer-motion hook
 *     pattern used elsewhere in the homepage entry point
 */
import * as React from 'react';
import {
  motion,
  HbcPremiumBadge,
  Calendar,
  AlertTriangle,
  HBC_PRESENTATION_BLUE_RGB,
  HBC_PRESENTATION_ORANGE_RGB,
} from '@hbc/ui-kit/homepage';
import { normalizeWelcomeHeaderConfig } from '../../homepage/helpers/topBandConfig.js';
import { resolveWelcomeMessage } from '../../homepage/helpers/welcomeMessage.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type { PersonalizedWelcomeHeaderConfig } from '../../homepage/webparts/topBandContracts.js';
import styles from './personalized-welcome-header.module.css';

export interface PersonalizedWelcomeHeaderProps {
  identity: HomepageIdentityInput;
  config?: Partial<PersonalizedWelcomeHeaderConfig>;
  now?: Date;
}

const ALERT_STATUS_MAP = {
  none: 'neutral',
  info: 'info',
  warning: 'warning',
  critical: 'critical',
} as const;

type Cubic = [number, number, number, number];
const EASE: Cubic = [0.25, 0.1, 0.25, 1];

/**
 * Subordinate reveal — quieter and faster than the hero. Each slot
 * carries a short fade-up so the strip settles in without becoming
 * a second focal point on the page.
 */
const revealDate = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, delay: 0, ease: EASE } },
};
const revealWelcome = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, delay: 0.06, ease: EASE } },
};
const revealAlert = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, delay: 0.12, ease: EASE } },
};

interface DateParts {
  weekday: string;
  day: string;
  month: string;
  full: string;
}

function formatDateParts(date: Date): DateParts {
  // Intl is available in every SharePoint-supported browser. Using a
  // fixed en-US locale keeps the date block visually predictable
  // regardless of the user's browser locale; the full ISO-style label
  // is exposed as readable text inside the block for screen readers.
  const weekdayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
  const monthShort = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
  const day = new Intl.DateTimeFormat('en-US', { day: 'numeric' }).format(date);
  const full = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  return {
    weekday: weekdayShort.toUpperCase(),
    day,
    month: monthShort.toUpperCase(),
    full,
  };
}

export function PersonalizedWelcomeHeader({
  identity,
  config,
  now = new Date(),
}: PersonalizedWelcomeHeaderProps): React.JSX.Element {
  const normalized = normalizeWelcomeHeaderConfig(config);
  const message = resolveWelcomeMessage(identity, now);
  const dateParts = formatDateParts(now);
  const hasAlert =
    normalized.alertSeverity !== 'none' && (normalized.alertTitle || normalized.alertMessage);

  // Presentation-lane brand tokens exposed as CSS custom properties so
  // the CSS module's date block, eyebrow, accent glow, and alert column
  // stay anchored to the foundation without hand-editing literal RGBs.
  const surfaceStyle = {
    '--hbc-hero-presentation-blue-rgb': HBC_PRESENTATION_BLUE_RGB,
    '--hbc-hero-presentation-orange-rgb': HBC_PRESENTATION_ORANGE_RGB,
  } as React.CSSProperties;

  return (
    <section
      className={styles.surface}
      style={surfaceStyle}
      data-hbc-premium="welcome-header"
      aria-label={`Day-start context for ${message.firstName}`}
    >
      <div className={styles.row}>
        {/* ── Date tear-off block ── */}
        <motion.div
          className={styles.dateBlock}
          variants={revealDate}
          initial="hidden"
          animate="visible"
          aria-label={dateParts.full}
        >
          <span className={styles.dateWeekday}>{dateParts.weekday}</span>
          <span className={styles.dateDay}>{dateParts.day}</span>
          <span className={styles.dateMonth}>{dateParts.month}</span>
        </motion.div>

        {/* ── Welcome zone ── */}
        <motion.div
          className={styles.welcomeZone}
          variants={revealWelcome}
          initial="hidden"
          animate="visible"
        >
          <p className={styles.eyebrow}>Welcome back</p>
          <h2 className={styles.name}>
            <span className={styles.nameValue}>{message.firstName}</span>
            <span aria-hidden="true">.</span>
          </h2>
          {normalized.supportLine ? (
            <p className={styles.supportLine}>{normalized.supportLine}</p>
          ) : null}
          {normalized.contextLine ? (
            <p className={styles.contextLine}>
              <Calendar size={13} aria-hidden="true" className={styles.contextIcon} />
              {normalized.contextLine}
            </p>
          ) : null}
        </motion.div>

        {/* ── Alert column ── */}
        {hasAlert ? (
          <motion.div
            className={styles.alertZone}
            variants={revealAlert}
            initial="hidden"
            animate="visible"
          >
            <section className={styles.alertSection} aria-label="High priority alert" role="status">
              <div className={styles.alertHeader}>
                <AlertTriangle
                  size={14}
                  aria-hidden="true"
                  className={styles.alertIcon}
                />
                <HbcPremiumBadge
                  label={normalized.alertTitle ?? 'Important update'}
                  status={ALERT_STATUS_MAP[normalized.alertSeverity ?? 'none']}
                  size="sm"
                />
              </div>
              {normalized.alertMessage ? (
                <p className={styles.alertMessage}>{normalized.alertMessage}</p>
              ) : null}
            </section>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
