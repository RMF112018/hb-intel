import type { SpfxLikeContext } from '../spfxHttpAdapter.js';

const PROOF_QUERY_PARAM = 'hbSafetyProof';
const PROOF_QUERY_VALUE = 'healthReadyNonAdmin';
const ADMIN_ROLES = new Set(['Admin', 'HBIntelAdmin']);

interface IJwtClaims {
  readonly aud?: string;
  readonly exp?: number;
  readonly nbf?: number;
  readonly iat?: number;
  readonly tid?: string;
  readonly oid?: string;
  readonly upn?: string;
  readonly preferred_username?: string;
  readonly idtyp?: string;
  readonly ver?: string;
  readonly roles?: string[];
  readonly scp?: string;
}

interface ITokenClassification {
  readonly aud: string | null;
  readonly audMatchesExpected: boolean;
  readonly tokenVersion: string | null;
  readonly validity: {
    readonly nowEpochSeconds: number;
    readonly nbfEpochSeconds: number | null;
    readonly expEpochSeconds: number | null;
    readonly notBeforeSatisfied: boolean;
    readonly notExpired: boolean;
    readonly currentlyValid: boolean;
  };
  readonly identityShape: {
    readonly idtyp: string | null;
    readonly delegatedUserShape: boolean;
    readonly appOnlyShape: boolean;
    readonly oidPresent: boolean;
    readonly userHintPresent: boolean;
  };
  readonly scopes: string[];
  readonly roles: string[];
  readonly isNonAdmin: boolean;
}

export interface IHealthReadyProofResult {
  readonly mode: 'hosted-spfx-proof';
  readonly proofGate: {
    readonly queryParam: string;
    readonly queryValue: string;
    readonly matched: boolean;
  };
  readonly acquisition: {
    readonly attemptedAtUtc: string;
    readonly source: 'spfx-aad-token-provider';
    readonly apiAudience: string;
    readonly success: boolean;
    readonly errorCode?: string;
    readonly errorMessage?: string;
  };
  readonly tokenClassification?: ITokenClassification;
  readonly probe?: {
    readonly url: string;
    readonly method: 'GET';
    readonly status: number;
    readonly expectedStatus: 403;
    readonly statusMatchesExpected: boolean;
    readonly requestId: string | null;
    readonly contentType: string | null;
    readonly bodyPreview: string;
  };
}

function parseTokenPayload(token: string): IJwtClaims {
  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) {
    throw new Error('jwt.payload.missing');
  }
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  const padLen = payload.length % 4;
  const padded = padLen === 0 ? payload : `${payload}${'='.repeat(4 - padLen)}`;
  const decoded = atob(padded);
  return JSON.parse(decoded) as IJwtClaims;
}

function classifyToken(token: string, expectedAudience: string): ITokenClassification {
  const claims = parseTokenPayload(token);
  const nowEpochSeconds = Math.floor(Date.now() / 1000);
  const nbfEpochSeconds = typeof claims.nbf === 'number' ? claims.nbf : null;
  const expEpochSeconds = typeof claims.exp === 'number' ? claims.exp : null;
  const notBeforeSatisfied = nbfEpochSeconds === null || nowEpochSeconds >= nbfEpochSeconds;
  const notExpired = expEpochSeconds !== null && nowEpochSeconds < expEpochSeconds;
  const currentlyValid = notBeforeSatisfied && notExpired;
  const idtyp = typeof claims.idtyp === 'string' ? claims.idtyp : null;
  const oidPresent = typeof claims.oid === 'string' && claims.oid.length > 0;
  const userHintPresent =
    (typeof claims.upn === 'string' && claims.upn.length > 0) ||
    (typeof claims.preferred_username === 'string' && claims.preferred_username.length > 0);
  const appOnlyShape = idtyp === 'app';
  const delegatedUserShape = !appOnlyShape && userHintPresent;
  const roles = Array.isArray(claims.roles) ? claims.roles.filter((role) => typeof role === 'string') : [];
  const scopes = typeof claims.scp === 'string'
    ? claims.scp.split(' ').map((scope) => scope.trim()).filter((scope) => scope.length > 0)
    : [];
  const isNonAdmin = roles.every((role) => !ADMIN_ROLES.has(role));

  return {
    aud: typeof claims.aud === 'string' ? claims.aud : null,
    audMatchesExpected: claims.aud === expectedAudience,
    tokenVersion: typeof claims.ver === 'string' ? claims.ver : null,
    validity: {
      nowEpochSeconds,
      nbfEpochSeconds,
      expEpochSeconds,
      notBeforeSatisfied,
      notExpired,
      currentlyValid,
    },
    identityShape: {
      idtyp,
      delegatedUserShape,
      appOnlyShape,
      oidPresent,
      userHintPresent,
    },
    scopes,
    roles,
    isNonAdmin,
  };
}

function redactedPreview(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const bounded = trimmed.slice(0, 400);
  return bounded.replace(/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, '[redacted-jwt]');
}

function isProofEnabled(locationSearch: string): boolean {
  const params = new URLSearchParams(locationSearch);
  return params.get(PROOF_QUERY_PARAM) === PROOF_QUERY_VALUE;
}

export async function runHealthReadyNonAdminProof(
  context: SpfxLikeContext,
  apiAudience: string,
  functionAppUrl: string,
): Promise<IHealthReadyProofResult> {
  const attemptedAtUtc = new Date().toISOString();
  const baseResult: IHealthReadyProofResult = {
    mode: 'hosted-spfx-proof',
    proofGate: {
      queryParam: PROOF_QUERY_PARAM,
      queryValue: PROOF_QUERY_VALUE,
      matched: true,
    },
    acquisition: {
      attemptedAtUtc,
      source: 'spfx-aad-token-provider',
      apiAudience,
      success: false,
    },
  };

  try {
    const provider = await context.aadTokenProviderFactory?.getTokenProvider();
    if (!provider) {
      return {
        ...baseResult,
        acquisition: {
          ...baseResult.acquisition,
          errorCode: 'token_provider_unavailable',
          errorMessage: 'SPFx AadTokenProviderFactory returned no provider.',
        },
      };
    }

    const token = await provider.getToken(apiAudience);
    const tokenClassification = classifyToken(token, apiAudience);
    const readyUrl = `${functionAppUrl.replace(/\/+$/, '')}/api/health/ready`;
    const response = await fetch(readyUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const bodyText = await response.text();

    return {
      ...baseResult,
      acquisition: {
        ...baseResult.acquisition,
        success: true,
      },
      tokenClassification,
      probe: {
        url: readyUrl,
        method: 'GET',
        status: response.status,
        expectedStatus: 403,
        statusMatchesExpected: response.status === 403,
        requestId: response.headers.get('x-request-id'),
        contentType: response.headers.get('content-type'),
        bodyPreview: redactedPreview(bodyText),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      ...baseResult,
      acquisition: {
        ...baseResult.acquisition,
        errorCode: 'token_acquisition_or_probe_failed',
        errorMessage: message.slice(0, 300),
      },
    };
  }
}

export function shouldRunHealthReadyNonAdminProof(
  context: SpfxLikeContext | undefined,
  apiAudience: string | undefined,
  functionAppUrl: string | undefined,
  locationSearch: string,
): boolean {
  if (!context || !apiAudience || !functionAppUrl) return false;
  return isProofEnabled(locationSearch);
}
