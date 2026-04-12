/**
 * kudosSurfaceFamily — explicit HB Kudos surface-family index.
 *
 * Phase-18 Wave 1 surface-family alignment. This barrel is the single
 * authoritative entry point for the Kudos surface-family primitives
 * that the public webpart (`HbKudos`) and the HR Approval Companion
 * webpart (`HbKudosCompanion`) both build from. It makes the family
 * explicit in source structure so future consumers (Wave 2 promotion
 * to `@hbc/ui-kit`, new governance surfaces) have one place to learn
 * the Kudos visual grammar from.
 *
 * What lives in the family:
 *
 *   Tokens (shared-theme derived)
 *     - KUDOS_GOV_TOKENS — governed alias layer over
 *       `HBC_PRESENTATION_*` / `HBC_SURFACE_PRESENTATION` presentation-
 *       lane theme semantics. `kudosCSSVars()` bridges this record to
 *       the CSS modules as `--hbk-*` custom properties (applied once
 *       per webpart root).
 *
 *   Iconography (governed)
 *     - Trophy / Sparkles / ThumbsUp / ChevronDown / ArrowRight —
 *       re-exported via `kudosIcons` from the curated
 *       `@hbc/ui-kit/homepage` lucide set.
 *
 *   Styles (class-based, token-backed via CSS custom properties)
 *     - kudosSurface.module.css — public surface + archive grammar.
 *     - governance.module.css   — governance button / chip / alert grammar
 *       used by both the HR Approval Companion and the role-aware detail
 *       panel.
 *
 *   Variants (class-variance-authority)
 *     - governanceActionButton / governanceTabButton /
 *       governanceToggleChip — typed variant APIs for repeated
 *       governance patterns.
 *
 * What intentionally stays local (not promoted to `@hbc/ui-kit`):
 *   - The family today serves exactly two surfaces inside
 *     `apps/hb-webparts`. Cross-package reuse pressure does not yet
 *     justify a shared ui-kit boundary. Promotion is a Wave-2+ decision
 *     that should follow real multi-feature reuse.
 *
 * Import discipline:
 *   Kudos surface files should reach into the family through this
 *   barrel (or its narrower modules) rather than wiring up tokens,
 *   icons, variants, and styles independently. This is how the public
 *   and companion surfaces keep one rhythm, one icon language, one
 *   token language, and one variant vocabulary.
 */

// Tokens + CSS-var bridge
export {
  KUDOS_GOV_TOKENS,
  kudosCSSVars,
} from '../../homepage/shared/KudosGovernancePrimitives.js';

// Icon seam
export {
  Trophy,
  Sparkles,
  ThumbsUp,
  ChevronDown,
  ArrowRight,
  type LucideIcon,
} from './kudosIcons.js';

// Variants (class-variance-authority)
export {
  // Governance
  governanceActionButton,
  governanceTabButton,
  governanceToggleChip,
  governanceSectionHeading,
  governanceInfoRow,
  governanceInfoRowLabel,
  governanceToolbarLabel,
  governanceErrorAlert,
  type GovernanceTabButtonVariants,
  type GovernanceToggleChipVariants,
  // Public surface
  kudosRow,
  kudosGiveCta,
  kudosCelebrateBtn,
  kudosCelebrateIcon,
  kudosReadmoreBtn,
  kudosFeaturedBadge,
  kudosArchiveToggle,
  kudosArchiveChevron,
  type KudosRowVariants,
} from './kudosVariants.js';

// Style modules — consumers `import styles from 'kudosSurface.module.css'`
// directly when they need class identifiers; this namespace re-exports
// the default imports for convenience in composition helpers.
export { default as kudosSurfaceStyles } from './kudosSurface.module.css';
export { default as kudosReaderStyles } from './kudosReader.module.css';
export { default as governanceStyles } from '../../homepage/shared/governance.module.css';
