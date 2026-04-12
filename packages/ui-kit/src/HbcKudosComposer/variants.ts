/**
 * HbcKudosComposer — cva variant systems.
 *
 * Centralizes the class-composition logic for the kudos composer's
 * genuine variant surfaces so we don't lean on string concatenation
 * (`styles[`bucketChip_${kind}`]`) or inline conditional ternaries.
 *
 * Doctrine §5.2 (Governing Standard) mandates deliberate use of
 * `class-variance-authority` for "serious variant systems for
 * recognition surfaces." Kudos is a recognition surface; these
 * variant definitions are what "deliberate use" looks like here.
 *
 * Each variant function targets CSS-module class keys in the
 * corresponding split CSS file — the styling still lives in CSS,
 * cva only governs which classes compose.
 */
import { cva } from 'class-variance-authority';
import flyoutStyles from './styles/flyout.module.css';
import formStyles from './styles/form.module.css';

// ---------------------------------------------------------------------------
// Footer action buttons — primary (gradient) vs secondary (ghost)
// ---------------------------------------------------------------------------

export const footerButtonVariants = cva(flyoutStyles.footerButton, {
  variants: {
    kind: {
      primary: flyoutStyles.footerPrimary,
      secondary: flyoutStyles.footerSecondary,
    },
    loading: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      kind: 'primary',
      loading: true,
      class: flyoutStyles.footerPrimaryLoading,
    },
  ],
  defaultVariants: {
    kind: 'primary',
    loading: false,
  },
});

// ---------------------------------------------------------------------------
// Flyout panel — mobile (bottom sheet) vs desktop (right sheet)
// ---------------------------------------------------------------------------

export const flyoutPanelVariants = cva(flyoutStyles.panel, {
  variants: {
    orientation: {
      mobile: flyoutStyles.panelMobile,
      desktop: flyoutStyles.panelDesktop,
    },
  },
  defaultVariants: {
    orientation: 'desktop',
  },
});

// ---------------------------------------------------------------------------
// Text inputs — base vs invalid
// ---------------------------------------------------------------------------

export const inputVariants = cva(formStyles.input, {
  variants: {
    invalid: {
      true: formStyles.inputInvalid,
      false: '',
    },
  },
  defaultVariants: {
    invalid: false,
  },
});

// ---------------------------------------------------------------------------
// Typed-mode recipient chips — per-bucket tint
// ---------------------------------------------------------------------------

export const bucketChipVariants = cva(formStyles.bucketChip, {
  variants: {
    kind: {
      individualEmails: formStyles.bucketChipIndividualEmails,
      teamLabels: formStyles.bucketChipTeamLabels,
      departmentLabels: formStyles.bucketChipDepartmentLabels,
      projectGroupLabels: formStyles.bucketChipProjectGroupLabels,
    },
  },
});

export const bucketChipIconVariants = cva(formStyles.bucketChipIcon, {
  variants: {
    kind: {
      individualEmails: formStyles.bucketChipIconIndividualEmails,
      teamLabels: formStyles.bucketChipIconTeamLabels,
      departmentLabels: formStyles.bucketChipIconDepartmentLabels,
      projectGroupLabels: formStyles.bucketChipIconProjectGroupLabels,
    },
  },
});
