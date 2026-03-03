/**
 * Pipeline stages for a construction lead.
 *
 * The lifecycle progresses roughly left-to-right:
 * Identified → Qualifying → BidDecision → Bidding → Awarded | Lost | Declined
 */
export enum LeadStage {
  /** Lead has been identified but not yet evaluated. */
  Identified = 'Identified',
  /** Lead is being qualified for fit and feasibility. */
  Qualifying = 'Qualifying',
  /** Decision point: pursue the bid or decline. */
  BidDecision = 'BidDecision',
  /** Actively preparing and submitting a bid. */
  Bidding = 'Bidding',
  /** Bid was awarded — lead converts to a project. */
  Awarded = 'Awarded',
  /** Bid was lost to a competitor. */
  Lost = 'Lost',
  /** Opportunity was declined internally. */
  Declined = 'Declined',
}
