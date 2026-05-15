/**
 * Adobe Sign OAuth service seam — B05 Prompt 03.
 *
 * Authorization-URL builder (pure) and token-exchange interface.
 *
 * The token-exchange implementation is **not** in this prompt — only the
 * contract and a deterministic test-mode implementation that callers can
 * inject during route tests. The production HTTP implementation will land
 * in a later B05 prompt and must conform to this interface.
 *
 * @module hosts/my-work-read-model/read-models/adobe-sign/adobe-sign-oauth-service
 */

export interface AdobeSignAuthorizationUrlInput {
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scopes: readonly string[];
  readonly state: string;
}

/**
 * Build the Adobe Sign authorization URL. Pure: no I/O. The base host is
 * Adobe's regionless authorization endpoint — Adobe routes the request to
 * the user's home region itself and returns region-specific
 * `api_access_point` + `web_access_point` query params on callback.
 */
export function buildAdobeSignAuthorizationUrl(input: AdobeSignAuthorizationUrlInput): string {
  const params = new URLSearchParams();
  params.set('response_type', 'code');
  params.set('client_id', input.clientId);
  params.set('redirect_uri', input.redirectUri);
  params.set('scope', input.scopes.join(' '));
  params.set('state', input.state);
  return `https://secure.adobesign.com/public/oauth/v2?${params.toString()}`;
}

export interface AdobeSignTokenExchangeInput {
  readonly authorizationCode: string;
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
  /** Region-specific API access point Adobe may return with the callback. */
  readonly apiAccessPoint?: string;
  /** Region-specific web access point Adobe may return with the callback. */
  readonly webAccessPoint?: string;
}

export type AdobeSignEndpointSource = 'callback' | 'token-response' | 'configured-fallback';

export interface AdobeSignTokenExchangeSuccess {
  readonly status: 'ok';
  readonly refreshToken: string;
  readonly accessToken: string;
  readonly grantedScopes: readonly string[];
  readonly expiresInSeconds: number;
  readonly resolvedApiAccessPoint: string;
  readonly resolvedWebAccessPoint: string;
  readonly endpointSource: AdobeSignEndpointSource;
}

export type AdobeSignTokenExchangeResult =
  | AdobeSignTokenExchangeSuccess
  | { readonly status: 'invalid-code' }
  | { readonly status: 'scope-mismatch'; readonly grantedScopes: readonly string[] }
  | {
      readonly status: 'unreachable';
      readonly reason?: string;
      readonly providerErrorCode?: string;
      readonly exchangeRequestDiagnostics?: {
        readonly endpointHost?: string;
        readonly endpointPath?: string;
        readonly endpointSelectionMode?: string;
        readonly bodyFieldCount?: number;
        readonly hasGrantTypeField?: boolean;
        readonly hasCodeField?: boolean;
        readonly hasClientIdField?: boolean;
        readonly hasClientSecretField?: boolean;
        readonly hasRedirectUriField?: boolean;
      };
    };

export interface IAdobeSignOAuthService {
  exchangeAuthorizationCode(
    input: AdobeSignTokenExchangeInput,
  ): Promise<AdobeSignTokenExchangeResult>;
}
