import type {
  IAcknowledgmentEvent,
  IAcknowledgmentParty,
  AcknowledgmentStatus,
} from '@hbc/acknowledgment';
import type { IHandoffReviewState } from '@hbc/strategic-intelligence';

export interface IStrategicIntelligenceAcknowledgmentProjection {
  parties: IAcknowledgmentParty[];
  auditTrail: IAcknowledgmentEvent[];
  overallStatus: AcknowledgmentStatus | 'partial';
  isComplete: boolean;
}

const getStatus = (acknowledgedAt: string | null): AcknowledgmentStatus =>
  acknowledgedAt ? 'acknowledged' : 'pending';

export const projectStrategicIntelligenceAcknowledgment = (
  handoffReview: IHandoffReviewState | null
): IStrategicIntelligenceAcknowledgmentProjection | null => {
  if (!handoffReview) {
    return null;
  }

  const parties: IAcknowledgmentParty[] = handoffReview.participants.map((participant, index) => ({
    userId: participant.participantId,
    displayName: participant.displayName,
    role: participant.role,
    order: index + 1,
    required: true,
  }));

  const auditTrail: IAcknowledgmentEvent[] = handoffReview.participants.map((participant) => ({
    partyUserId: participant.participantId,
    partyDisplayName: participant.displayName,
    status: getStatus(participant.acknowledgedAt),
    acknowledgedAt: participant.acknowledgedAt,
    declineReason: participant.acknowledgmentNote,
  }));

  const acknowledgedCount = auditTrail.filter((event) => event.status === 'acknowledged').length;
  const isComplete = parties.length > 0 && acknowledgedCount === parties.length;

  return {
    parties,
    auditTrail,
    overallStatus: isComplete ? 'acknowledged' : acknowledgedCount > 0 ? 'partial' : 'pending',
    isComplete,
  };
};
