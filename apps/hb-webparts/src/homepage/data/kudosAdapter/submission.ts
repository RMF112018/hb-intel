/**
 * Kudos domain-adapter — submission path.
 *
 * Thin re-export of the existing submission writer so Layer 3
 * (webpart-local) code imports the Kudos front door from one place.
 */
export {
  submitKudosDraft,
  resolveTypedRecipientBuckets,
  type KudosSubmissionOptions,
  type KudosSubmissionResult,
  type KudosTypedRecipientResolution,
} from '../peopleCultureSubmissionSource.js';
