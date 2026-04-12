/**
 * kudosVariants — Kudos surface class-variance-authority variants.
 *
 * Phase-18 Wave 1 + Phase-19 Wave 2 premium-stack adoption. All
 * repeated Kudos UI patterns (buttons, rows, badges, governance
 * section primitives) are governed here as `cva` variants over
 * governed module classes. Call sites resolve a variant by intent
 * rather than authoring raw class strings or conditional style
 * objects.
 *
 * Consumers should compose the returned class string via `clsx` at
 * the call site if they need to merge additional classes.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import governanceStyles from '../../homepage/shared/governance.module.css';
import kudosSurfaceStyles from './kudosSurface.module.css';
import kudosFeedStyles from './kudosFeed.module.css';

// ---------------------------------------------------------------------------
// Governance: action button, tab button, toggle chip
// ---------------------------------------------------------------------------

/**
 * Tonal governance action button. The tone color is supplied by the
 * consuming element via `--hbk-tone` so the class stays stable.
 */
export const governanceActionButton = cva(governanceStyles.actionButton);

export const governanceTabButton = cva(governanceStyles.tabButton, {
  variants: {
    active: {
      true: governanceStyles.tabButtonActive,
      false: '',
    },
  },
  defaultVariants: { active: false },
});

export type GovernanceTabButtonVariants = VariantProps<typeof governanceTabButton>;

export const governanceToggleChip = cva(governanceStyles.toggleChip, {
  variants: {
    active: {
      true: governanceStyles.toggleChipActive,
      false: '',
    },
  },
  defaultVariants: { active: false },
});

export type GovernanceToggleChipVariants = VariantProps<typeof governanceToggleChip>;

// ---------------------------------------------------------------------------
// Governance: section primitives
// ---------------------------------------------------------------------------

export const governanceSectionHeading = cva(governanceStyles.sectionHeading);
export const governanceInfoRow = cva(governanceStyles.infoRow);
export const governanceInfoRowLabel = cva(governanceStyles.infoRowLabel);
export const governanceToolbarLabel = cva(governanceStyles.toolbarLabel);
export const governanceErrorAlert = cva(governanceStyles.errorAlert);

// ---------------------------------------------------------------------------
// Public surface: row / badge / button variants
// ---------------------------------------------------------------------------

/**
 * Kudos row — unified variant across public recent rail and archive
 * list. Each variant maps to its corresponding class in
 * `kudosSurface.module.css`. Callers get a typed API
 * (`kudosRow({ variant: 'recent' })`) instead of hardcoding class
 * strings at the call site.
 */
export const kudosRow = cva('', {
  variants: {
    variant: {
      recent: kudosSurfaceStyles.recentRow,
      archive: kudosSurfaceStyles.archiveRow,
    },
  },
  defaultVariants: { variant: 'recent' },
});

export type KudosRowVariants = VariantProps<typeof kudosRow>;

/**
 * Kudos give-CTA. Single-variant wrapper so the masthead CTA picks up
 * its class through the typed family API.
 */
export const kudosGiveCta = cva(kudosSurfaceStyles.giveBtn);

/**
 * Kudos celebrate button + icon. `celebrateIcon` is the inner span
 * responsible for the active-state tilt transform.
 */
export const kudosCelebrateBtn = cva(kudosSurfaceStyles.celebrateBtn);
export const kudosCelebrateIcon = cva(kudosSurfaceStyles.celebrateIcon);

/**
 * Kudos read-more link on the featured card.
 */
export const kudosReadmoreBtn = cva(kudosSurfaceStyles.readmoreBtn);

/**
 * Kudos featured badge. Single-variant for now; reserved for future
 * badge variants (e.g. company-wide vs team-level recognition).
 */
export const kudosFeaturedBadge = cva(kudosSurfaceStyles.featuredBadge);

/**
 * Archive toggle + chevron. Public-surface grammar that previously
 * flowed through raw class strings at the call site.
 *
 * Phase-27 Prompt-03 hierarchy redesign retired the subtle
 * `kudosArchiveViewAll` text-link variant — the terminal feed entry
 * point is now a dedicated `.feedCta` block composed directly at the
 * call site (see `ArchiveList`) so "Browse the full Kudos feed"
 * reads as a product destination instead of a leftover text link.
 */
export const kudosArchiveToggle = cva(kudosSurfaceStyles.archiveToggle);
export const kudosArchiveChevron = cva(kudosSurfaceStyles.archiveChevron);

// ---------------------------------------------------------------------------
// Feed slide-out: row + celebrate pill
// ---------------------------------------------------------------------------

/**
 * Feed-panel row — slide-out "View All" browse surface. Single-variant
 * wrapper mirroring the recent/archive row family; reserved for future
 * feed-row variants (e.g. pinned / flagged).
 */
export const kudosFeedRow = cva(kudosFeedStyles.feedRow);

/**
 * Feed-panel celebrate pill — visually subordinate celebrate badge on
 * each feed row footer.
 */
export const kudosFeedCelebratePill = cva(kudosFeedStyles.feedRowCelebratePill);
