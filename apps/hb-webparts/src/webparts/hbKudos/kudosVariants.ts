/**
 * kudosVariants — Kudos surface class-variance-authority variants.
 *
 * Phase-18 Wave 1 premium-stack adoption: the repeated Kudos button
 * patterns (governance action button, tab filter, toggle chip) are
 * governed here as `cva` variants composing governed module classes.
 * Call sites resolve a variant by intent (`tone: 'danger'`) rather than
 * authoring raw color decisions inline.
 *
 * Consumers should compose the returned class string via `clsx` at the
 * call site if they need to merge additional classes.
 */
import { cva, type VariantProps } from 'class-variance-authority';
import governanceStyles from '../../homepage/shared/governance.module.css';

// ---------------------------------------------------------------------------
// Governance action button — tonal (danger / warning / info)
// Tone colors come from the consuming element's CSS custom property
// (`--hbk-gov-tone`), set by the caller from KUDOS_GOV_TOKENS.
// ---------------------------------------------------------------------------

export const governanceActionButton = cva(governanceStyles.actionButton);

// ---------------------------------------------------------------------------
// Governance tab filter button — active / idle
// ---------------------------------------------------------------------------

export const governanceTabButton = cva(governanceStyles.tabButton, {
  variants: {
    active: {
      true: governanceStyles.tabButtonActive,
      false: '',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export type GovernanceTabButtonVariants = VariantProps<typeof governanceTabButton>;

// ---------------------------------------------------------------------------
// Governance toggle chip — active / idle
// ---------------------------------------------------------------------------

export const governanceToggleChip = cva(governanceStyles.toggleChip, {
  variants: {
    active: {
      true: governanceStyles.toggleChipActive,
      false: '',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export type GovernanceToggleChipVariants = VariantProps<typeof governanceToggleChip>;
