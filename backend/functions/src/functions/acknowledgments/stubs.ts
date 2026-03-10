import type { ILogger } from '../../utils/logger.js';
import type { IAcknowledgmentListItem } from '../../services/acknowledgment-service.js';

// stub-approved: intentional BIC-completion and notification stubs pending SF04
// full platform integration. Implement when @hbc/acknowledgment T07 is activated
// and the Azure Functions trigger pipeline is established.

/**
 * SF04-T06 D-06: Trigger BIC (Business Intelligence/Completion) side-effects
 * when all required parties have acknowledged.
 *
 * TODO: Implement BIC client integration when backend service is available.
 */
export async function triggerBicCompletion(
  contextType: string,
  contextId: string,
  logger: ILogger,
): Promise<void> {
  logger.info('BIC completion triggered (stub)', { contextType, contextId });
}

/**
 * SF04-T06 D-06: Send completion notification to relevant stakeholders
 * when all required parties have acknowledged.
 *
 * TODO: Implement notification client integration when notification service is available.
 */
export async function triggerCompletionNotification(
  contextType: string,
  contextId: string,
  trail: IAcknowledgmentListItem[],
  logger: ILogger,
): Promise<void> {
  logger.info('Completion notification triggered (stub)', {
    contextType,
    contextId,
    eventCount: trail.length,
  });
}

/**
 * SF04-T06: Notify the next pending party in sequential mode
 * after a successful acknowledgment.
 *
 * TODO: Implement notification client integration when notification service is available.
 */
export async function notifyNextPendingParty(
  contextType: string,
  contextId: string,
  nextPartyUserId: string,
  logger: ILogger,
): Promise<void> {
  logger.info('Next party notification triggered (stub)', {
    contextType,
    contextId,
    nextPartyUserId,
  });
}
