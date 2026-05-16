import type { AdobeSignDelegatedActor } from './adobe-sign-actor-normalizer.js';

export interface AdobeSignActionLinkClientInput {
  readonly actor: AdobeSignDelegatedActor;
  readonly agreementId: string;
  readonly accessToken: string;
  readonly apiAccessPoint: string;
}

export type AdobeSignActionLinkClientResult =
  | {
      readonly status: 'ok';
      readonly redirectUrl: string;
    }
  | {
      readonly status: 'unauthorized';
    }
  | {
      readonly status: 'not-ready';
    }
  | {
      readonly status: 'no-action-url';
    }
  | {
      readonly status: 'no-recipient-match';
    }
  | {
      readonly status: 'rate-limited';
    }
  | {
      readonly status: 'unreachable';
      readonly reason:
        | 'http-4xx'
        | 'http-5xx'
        | 'malformed-response'
        | 'network'
        | 'timeout'
        | 'invalid-access-point';
      readonly providerStatusCode?: number;
    };

export interface IAdobeSignActionLinkClient {
  resolveActionLink(input: AdobeSignActionLinkClientInput): Promise<AdobeSignActionLinkClientResult>;
}
