import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions';
import { randomUUID } from 'crypto';
import type {
  IAcknowledgmentEvent,
  IAcknowledgmentParty,
  AcknowledgmentMode,
  AckContextType,
} from '@hbc/acknowledgment/server';
import {
  ACK_CONTEXT_TYPES,
  deriveAcknowledgmentState,
  resolveCurrentSequentialParty,
  computeIsComplete,
} from '@hbc/acknowledgment/server';
import { withAuth } from '../../middleware/auth.js';
import { extractOrGenerateRequestId } from '../../middleware/request-id.js';
import { createServiceFactory } from '../../services/service-factory.js';
import type { IAcknowledgmentListItem } from '../../services/acknowledgment-service.js';
import { createLogger } from '../../utils/logger.js';
import {
  errorResponse,
  successResponse,
  forbiddenResponse,
} from '../../utils/response-helpers.js';
import {
  triggerBicCompletion,
  triggerCompletionNotification,
  notifyNextPendingParty,
} from './stubs.js';

const VALID_CONTEXT_TYPES = new Set<string>(Object.values(ACK_CONTEXT_TYPES));

/**
 * Maps a SharePoint list item to the client-facing IAcknowledgmentEvent shape.
 */
function toAcknowledgmentEvent(item: IAcknowledgmentListItem): IAcknowledgmentEvent {
  return {
    partyUserId: item.PartyUserId,
    partyDisplayName: item.PartyDisplayName,
    status: item.Status,
    acknowledgedAt: item.AcknowledgedAt || null,
    declineReason: item.DeclineReason || undefined,
    declineCategory: item.DeclineCategory || undefined,
    isBypass: item.IsBypass || undefined,
    bypassedBy: item.BypassedBy || undefined,
  };
}

interface IPostAcknowledgmentBody {
  contextType: AckContextType;
  contextId: string;
  partyUserId: string;
  status: 'acknowledged' | 'declined';
  declineReason?: string;
  declineCategory?: string;
  acknowledgedAt: string;
  bypassSequentialOrder?: boolean;
  promptMessage?: string;
  parties: IAcknowledgmentParty[];
  mode: AcknowledgmentMode;
}

/**
 * SF04-T06 POST /api/acknowledgments
 * Submit an acknowledgment, decline, or bypass event.
 * Enforces sequential ordering (D-01), bypass validation, decline blocking (D-09),
 * and fires completion side-effects (D-06).
 */
app.http('postAcknowledgment', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'acknowledgments',
  handler: withAuth(async (request: HttpRequest, context: InvocationContext, auth): Promise<HttpResponseInit> => {
    const logger = createLogger(context);
    const requestId = extractOrGenerateRequestId(request);

    let body: IPostAcknowledgmentBody;
    try {
      body = (await request.json()) as IPostAcknowledgmentBody;
    } catch {
      return errorResponse(400, 'VALIDATION_ERROR', 'Invalid JSON body', requestId);
    }

    if (!body.contextType || !body.contextId || !body.partyUserId || !body.status) {
      return errorResponse(400, 'VALIDATION_ERROR', 'contextType, contextId, partyUserId, and status are required', requestId);
    }

    if (!VALID_CONTEXT_TYPES.has(body.contextType)) {
      return errorResponse(400, 'VALIDATION_ERROR', `Invalid contextType: ${body.contextType}`, requestId);
    }

    if (!body.parties?.length || !body.mode) {
      return errorResponse(400, 'VALIDATION_ERROR', 'parties[] and mode are required', requestId);
    }

    const services = createServiceFactory();
    const existingItems = await services.acknowledgments.getEvents(body.contextType, body.contextId);
    const existingEvents = existingItems.map(toAcknowledgmentEvent);

    // D-01: Sequential enforcement
    if (body.mode === 'sequential' && !body.bypassSequentialOrder) {
      const currentParty = resolveCurrentSequentialParty(body.parties, existingEvents);
      if (currentParty && currentParty.userId !== body.partyUserId) {
        return forbiddenResponse('Sequential order violation: it is not this party\'s turn', requestId);
      }
    }

    // D-01: Bypass requires AcknowledgmentAdmin role
    if (body.bypassSequentialOrder && !auth.claims.roles.includes('AcknowledgmentAdmin')) {
      return forbiddenResponse('AcknowledgmentAdmin role required for sequential bypass', requestId);
    }

    // D-09: Check for existing decline from a required party (blocks further acknowledgments)
    const existingDecline = existingEvents.find((e) => {
      const party = body.parties.find((p) => p.userId === e.partyUserId);
      return party?.required && e.status === 'declined';
    });
    if (existingDecline) {
      return errorResponse(409, 'CONFLICT', 'Acknowledgment blocked: a required party has declined', requestId);
    }

    const isBypass = body.bypassSequentialOrder ?? false;
    const newItem: IAcknowledgmentListItem = {
      EventId: randomUUID(),
      ContextType: body.contextType,
      ContextId: body.contextId,
      PartyUserId: body.partyUserId,
      PartyDisplayName: auth.claims.displayName ?? auth.claims.upn,
      Status: isBypass ? 'bypassed' : body.status,
      AcknowledgedAt: body.acknowledgedAt || new Date().toISOString(),
      DeclineReason: body.declineReason ?? '',
      DeclineCategory: body.declineCategory ?? '',
      PromptMessage: body.promptMessage ?? '',
      IsBypass: isBypass,
      BypassedBy: isBypass ? auth.claims.upn : '',
    };

    await services.acknowledgments.createEvent(newItem);

    // Fetch updated events for state derivation
    const updatedItems = await services.acknowledgments.getEvents(body.contextType, body.contextId);
    const updatedEvents = updatedItems.map(toAcknowledgmentEvent);

    const configObj = {
      label: '',
      mode: body.mode,
      contextType: body.contextType,
      resolveParties: () => body.parties,
      resolvePromptMessage: () => '',
    };

    const updatedState = deriveAcknowledgmentState(configObj, body.parties, updatedEvents);
    const isComplete = computeIsComplete(body.parties, updatedEvents);

    // D-06: Completion side-effects
    if (isComplete) {
      await triggerBicCompletion(body.contextType, body.contextId, logger);
      await triggerCompletionNotification(body.contextType, body.contextId, updatedItems, logger);
    } else if (newItem.Status === 'acknowledged' || newItem.Status === 'bypassed') {
      // Notify next pending party in sequential mode
      if (body.mode === 'sequential') {
        const nextParty = resolveCurrentSequentialParty(body.parties, updatedEvents);
        if (nextParty) {
          await notifyNextPendingParty(body.contextType, body.contextId, nextParty.userId, logger);
        }
      }
    }

    logger.info('Acknowledgment event created', {
      eventId: newItem.EventId,
      contextType: body.contextType,
      contextId: body.contextId,
      partyUserId: body.partyUserId,
      status: newItem.Status,
      isComplete,
    });

    return successResponse({ event: toAcknowledgmentEvent(newItem), updatedState, isComplete });
  }),
});

/**
 * SF04-T06 GET /api/acknowledgments
 * Returns raw acknowledgment events for a given context.
 * Client derives state locally using config + parties + deriveAcknowledgmentState().
 */
app.http('getAcknowledgments', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'acknowledgments',
  handler: withAuth(async (request: HttpRequest): Promise<HttpResponseInit> => {
    const requestId = extractOrGenerateRequestId(request);

    const contextType = request.query.get('contextType');
    const contextId = request.query.get('contextId');

    if (!contextType || !contextId) {
      return errorResponse(400, 'VALIDATION_ERROR', 'contextType and contextId query params are required', requestId);
    }

    if (!VALID_CONTEXT_TYPES.has(contextType)) {
      return errorResponse(400, 'VALIDATION_ERROR', `Invalid contextType: ${contextType}`, requestId);
    }

    const services = createServiceFactory();
    const items = await services.acknowledgments.getEvents(contextType, contextId);
    const events = items.map(toAcknowledgmentEvent);

    return successResponse({ events });
  }),
});
