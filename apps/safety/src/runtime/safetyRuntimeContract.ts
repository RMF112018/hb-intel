import { currentSafetyGuidOverlay } from '@hbc/features-safety';
import { findMissingHostedSafetyGuidBindings } from './hostedSafetyGuidBinding.js';

export interface ISafetyMountConfig {
  functionAppUrl?: string;
  backendMode?: 'production' | 'ui-review';
  allowBackendModeSwitch?: boolean;
  apiAudience?: string;
}

export type SafetyHostMode = 'sharepoint' | 'mock';

export interface ISafetyRuntimeContract {
  readonly hostMode: SafetyHostMode;
  readonly backend: {
    readonly baseUrl: string | null;
    readonly apiAudience: string | null;
    readonly baseUrlPresent: boolean;
    readonly baseUrlValid: boolean;
    readonly apiAudiencePresent: boolean;
  };
  readonly hostedGuidOverlay: {
    readonly known: boolean;
    readonly missingKeys: ReadonlyArray<string>;
  };
  readonly canInitializeCommands: boolean;
  readonly blockingReasons: ReadonlyArray<string>;
}

export function resolveSafetyRuntimeContract(params: {
  readonly hasSpfxContext: boolean;
  readonly config?: ISafetyMountConfig;
}): ISafetyRuntimeContract {
  const hostMode: SafetyHostMode = params.hasSpfxContext ? 'sharepoint' : 'mock';
  const baseUrl = normalizeFunctionAppUrl(params.config?.functionAppUrl);
  const apiAudience = normalizeText(params.config?.apiAudience);
  const missingKeys =
    hostMode === 'sharepoint'
      ? findMissingHostedSafetyGuidBindings(currentSafetyGuidOverlay())
      : [];
  const baseUrlPresent = !!baseUrl;
  const baseUrlValid = !!baseUrl && isHttpUrl(baseUrl);
  const apiAudiencePresent = !!apiAudience;

  const blockingReasons: string[] = [];
  if (hostMode === 'sharepoint') {
    if (!baseUrlPresent) {
      blockingReasons.push('Backend base URL is missing.');
    } else if (!baseUrlValid) {
      blockingReasons.push('Backend base URL must be an absolute http(s) URL.');
    }
    if (!apiAudiencePresent) {
      blockingReasons.push('API audience is missing.');
    }
    if (missingKeys.length > 0) {
      blockingReasons.push(
        `Hosted GUID overlay is incomplete: missing ${missingKeys.join(', ')}.`,
      );
    }
  }

  return {
    hostMode,
    backend: {
      baseUrl,
      apiAudience,
      baseUrlPresent,
      baseUrlValid,
      apiAudiencePresent,
    },
    hostedGuidOverlay: {
      known: hostMode !== 'sharepoint' || missingKeys.length === 0,
      missingKeys,
    },
    canInitializeCommands: hostMode === 'mock' || blockingReasons.length === 0,
    blockingReasons,
  };
}

function normalizeFunctionAppUrl(value: string | undefined): string | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  return normalized.replace(/\/+$/, '');
}

function normalizeText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
