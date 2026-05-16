import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import {
  ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES,
  type ResolveAdobeSignActionLinkRequest,
  type AdobeSignActionLinkResolveResult,
} from '@hbc/models/myWork';

import { withAuth } from '../../middleware/auth.js';
import { successResponse } from '../../utils/response-helpers.js';
import { withTelemetry } from '../../utils/withTelemetry.js';

export const ADOBE_SIGN_ACTION_LINK_ROUTE_PATH = 'my-work/me/adobe-sign/action-link/resolve' as const;
export const ADOBE_SIGN_ACTION_LINK_ROUTE_NAME = 'resolveAdobeSignActionLink' as const;

const REQUIRED_ACTIONS = new Set<string>(ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES.map((status) => {
  switch (status) {
    case 'WAITING_FOR_MY_SIGNATURE':
      return 'signature';
    case 'WAITING_FOR_MY_APPROVAL':
      return 'approval';
    case 'WAITING_FOR_MY_ACCEPTANCE':
      return 'acceptance';
    case 'WAITING_FOR_MY_ACKNOWLEDGEMENT':
      return 'acknowledgement';
    case 'WAITING_FOR_MY_FORM_FILLING':
      return 'form-filling';
    case 'WAITING_FOR_MY_DELEGATION':
      return 'delegation';
  }
}));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

function validateResolveRequest(value: unknown): value is ResolveAdobeSignActionLinkRequest {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value).sort();
  if (keys.length !== 3 || keys[0] !== 'agreementId' || keys[1] !== 'itemId' || keys[2] !== 'requiredAction') {
    return false;
  }
  if (!isNonEmptyString(value.itemId) || !isNonEmptyString(value.agreementId)) {
    return false;
  }
  if (typeof value.requiredAction !== 'string') {
    return false;
  }
  return REQUIRED_ACTIONS.has(value.requiredAction);
}

const INVALID_INPUT_RESULT: AdobeSignActionLinkResolveResult = {
  status: 'invalid-input',
};

const NOT_READY_RESULT: AdobeSignActionLinkResolveResult = {
  status: 'not-ready',
};

async function readResolveRequestBody(
  request: HttpRequest,
): Promise<ResolveAdobeSignActionLinkRequest | undefined> {
  try {
    const text = await request.text();
    if (text.trim().length === 0) {
      return undefined;
    }
    const parsed = JSON.parse(text) as unknown;
    if (!validateResolveRequest(parsed)) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

export function createAdobeSignActionLinkResolveHandler() {
  return async (
    request: HttpRequest,
    _context: InvocationContext,
  ): Promise<HttpResponseInit> => {
    const parsed = await readResolveRequestBody(request);
    if (!parsed) {
      return successResponse(INVALID_INPUT_RESULT, 400);
    }
    return successResponse(NOT_READY_RESULT, 200);
  };
}

app.http(ADOBE_SIGN_ACTION_LINK_ROUTE_NAME, {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: ADOBE_SIGN_ACTION_LINK_ROUTE_PATH,
  handler: withAuth(
    withTelemetry(createAdobeSignActionLinkResolveHandler(), {
      domain: 'my-work-adobe-sign-action-link',
      operation: 'resolve',
    }),
  ),
});
