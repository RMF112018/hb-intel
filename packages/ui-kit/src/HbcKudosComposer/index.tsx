/**
 * HbcKudosComposer — Shared presentation primitives for the People &
 * Culture kudos submission flow.
 *
 * Five sibling components that compose a premium kudos submission
 * experience coherent with `HbcPeopleCultureSurface`:
 *   - HbcKudosComposerFlyout   — premium right-side sheet shell
 *   - HbcKudosComposerForm     — labeled form grid with validation
 *   - HbcKudosComposerPreview  — live preview card
 *   - HbcKudosComposerSuccess  — post-submit confirmation pane
 *   - HbcKudosComposerError    — inline error banner
 *
 * Pure presentation: state, validation, and submission live in the
 * consumer. Styling is governed by the SPFx Governing Standard and
 * Homepage Overlay doctrine — every value in the component's CSS is
 * sourced from the tokens bridge in `./tokens.ts`.
 */

export { HbcKudosComposerFlyout } from './HbcKudosComposerFlyout.js';
export { HbcKudosComposerForm } from './HbcKudosComposerForm.js';
export { HbcKudosComposerPreview } from './HbcKudosComposerPreview.js';
export { HbcKudosComposerSuccess } from './HbcKudosComposerSuccess.js';
export { HbcKudosComposerError } from './HbcKudosComposerError.js';

export { EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS } from './types.js';

export type {
  KudosComposerDraft,
  KudosComposerValidationErrors,
  KudosComposerRecipientBucketsDraft,
  KudosComposerRecipientBucketKind,
  KudosComposerRecipientsMode,
  HbcKudosComposerActionProps,
  HbcKudosComposerFlyoutProps,
  HbcKudosComposerFormProps,
  HbcKudosComposerPreviewProps,
  HbcKudosComposerSuccessProps,
  HbcKudosComposerErrorProps,
} from './types.js';
