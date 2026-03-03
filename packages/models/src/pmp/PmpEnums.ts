/**
 * Lifecycle status for a Project Management Plan.
 */
export enum PmpStatus {
  /** PMP is being drafted. */
  Draft = 'Draft',
  /** PMP is out for review. */
  InReview = 'InReview',
  /** PMP has been approved and is active. */
  Approved = 'Approved',
  /** PMP has been superseded by a newer version. */
  Superseded = 'Superseded',
}

/**
 * Status of a PMP signature.
 */
export enum SignatureStatus {
  /** Signature is pending (not yet signed). */
  Pending = 'Pending',
  /** Signature has been applied. */
  Signed = 'Signed',
  /** Signer declined to sign. */
  Declined = 'Declined',
}
