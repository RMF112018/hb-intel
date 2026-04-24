import { currentSafetyGuidOverlay } from '@hbc/features-safety';
import {
  findMissingHostedSafetyGuidBindings,
  hostedSafetyGuidOverlayFingerprint,
} from './hostedSafetyGuidBinding.js';
import {
  SAFETY_PACKAGE_VERSION,
  SAFETY_WEBPART_MANIFEST_ID,
} from './governedRuntimeBinding.js';

export interface ISafetyMountConfig {
  functionAppUrl?: string;
  backendMode?: 'production' | 'ui-review';
  allowBackendModeSwitch?: boolean;
  apiAudience?: string;
  acceptedBackendOrigin?: string;
  expectedManifestId?: string;
  expectedPackageVersion?: string;
  expectedApiAudience?: string;
  expectedHostedGuidOverlayFingerprint?: string;
}

export type SafetyHostMode = 'sharepoint' | 'mock';
export type SafetyHostSource = 'safety-webpart' | 'shell-webpart' | 'local-dev';

export interface ISafetyRuntimeContract {
  readonly hostMode: SafetyHostMode;
  readonly hostSource: SafetyHostSource;
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
    readonly actualFingerprint: string;
    readonly expectedFingerprint: string | null;
    readonly fingerprintMatchesExpected: boolean;
  };
  readonly governed: {
    readonly acceptedBackendOrigin: string | null;
    readonly expectedManifestId: string | null;
    readonly expectedPackageVersion: string | null;
    readonly expectedApiAudience: string | null;
    readonly expectedHostedGuidOverlayFingerprint: string | null;
    readonly backendOriginMatchesAccepted: boolean;
    readonly manifestIdMatchesExpected: boolean;
    readonly packageVersionMatchesExpected: boolean;
    readonly apiAudienceMatchesExpected: boolean;
  };
  readonly canInitializeCommands: boolean;
  readonly blockingReasons: ReadonlyArray<string>;
}

export function resolveSafetyRuntimeContract(params: {
  readonly hasSpfxContext: boolean;
  readonly config?: ISafetyMountConfig;
  readonly hostSource?: SafetyHostSource;
}): ISafetyRuntimeContract {
  const hostMode: SafetyHostMode = params.hasSpfxContext ? 'sharepoint' : 'mock';
  const hostSource: SafetyHostSource = params.hostSource ?? (params.hasSpfxContext ? 'safety-webpart' : 'local-dev');
  const baseUrl = normalizeFunctionAppUrl(params.config?.functionAppUrl);
  const apiAudience = normalizeText(params.config?.apiAudience);
  const missingKeys =
    hostMode === 'sharepoint'
      ? findMissingHostedSafetyGuidBindings(currentSafetyGuidOverlay())
      : [];
  const baseUrlPresent = !!baseUrl;
  const baseUrlValid = !!baseUrl && isHttpUrl(baseUrl);
  const apiAudiencePresent = !!apiAudience;
  const acceptedBackendOrigin = normalizeOrigin(params.config?.acceptedBackendOrigin);
  const expectedManifestId = normalizeText(params.config?.expectedManifestId);
  const expectedPackageVersion = normalizeText(params.config?.expectedPackageVersion);
  const expectedApiAudience = normalizeText(params.config?.expectedApiAudience);
  const expectedHostedGuidOverlayFingerprint = normalizeText(params.config?.expectedHostedGuidOverlayFingerprint);
  const actualHostedGuidOverlayFingerprint = hostedSafetyGuidOverlayFingerprint();
  const backendOrigin = baseUrlValid && baseUrl ? new URL(baseUrl).origin : null;
  const backendOriginMatchesAccepted = !backendOrigin || !acceptedBackendOrigin
    ? false
    : backendOrigin === acceptedBackendOrigin;
  const manifestIdMatchesExpected = expectedManifestId === SAFETY_WEBPART_MANIFEST_ID;
  const packageVersionMatchesExpected = expectedPackageVersion === SAFETY_PACKAGE_VERSION;
  const apiAudienceMatchesExpected = !!expectedApiAudience && apiAudience === expectedApiAudience;
  const fingerprintMatchesExpected =
    expectedHostedGuidOverlayFingerprint === actualHostedGuidOverlayFingerprint;

  const blockingReasons: string[] = [];
  if (hostMode === 'sharepoint') {
    if (hostSource === 'shell-webpart') {
      blockingReasons.push(
        'Shell-hosted Safety runtime is disabled until equivalent backend binding and approval guarantees are established.',
      );
    }
    if (!baseUrlPresent) {
      blockingReasons.push('Backend base URL is missing.');
    } else if (!baseUrlValid) {
      blockingReasons.push('Backend base URL must be an absolute http(s) URL.');
    }
    if (!apiAudiencePresent) {
      blockingReasons.push('API audience is missing.');
    }
    if (!acceptedBackendOrigin) {
      blockingReasons.push('Accepted backend origin is missing.');
    } else if (!baseUrlValid || !backendOriginMatchesAccepted) {
      blockingReasons.push('Backend base URL origin does not match accepted backend origin.');
    }
    if (!expectedManifestId) {
      blockingReasons.push('Expected manifest ID is missing.');
    } else if (!manifestIdMatchesExpected) {
      blockingReasons.push('Expected manifest ID does not match Safety webpart authority.');
    }
    if (!expectedPackageVersion) {
      blockingReasons.push('Expected package version is missing.');
    } else if (!packageVersionMatchesExpected) {
      blockingReasons.push('Expected package version does not match governed Safety package version.');
    }
    if (!expectedApiAudience) {
      blockingReasons.push('Expected API audience is missing.');
    } else if (apiAudiencePresent && !apiAudienceMatchesExpected) {
      blockingReasons.push('API audience does not match governed expected audience.');
    }
    if (!expectedHostedGuidOverlayFingerprint) {
      blockingReasons.push('Expected hosted GUID overlay fingerprint is missing.');
    } else if (!fingerprintMatchesExpected) {
      blockingReasons.push('Hosted GUID overlay fingerprint does not match expected governance value.');
    }
    if (missingKeys.length > 0) {
      blockingReasons.push(
        `Hosted GUID overlay is incomplete: missing ${missingKeys.join(', ')}.`,
      );
    }
  }

  return {
    hostMode,
    hostSource,
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
      actualFingerprint: actualHostedGuidOverlayFingerprint,
      expectedFingerprint: expectedHostedGuidOverlayFingerprint,
      fingerprintMatchesExpected: fingerprintMatchesExpected || hostMode === 'mock',
    },
    governed: {
      acceptedBackendOrigin,
      expectedManifestId,
      expectedPackageVersion,
      expectedApiAudience,
      expectedHostedGuidOverlayFingerprint,
      backendOriginMatchesAccepted: backendOriginMatchesAccepted || hostMode === 'mock',
      manifestIdMatchesExpected: manifestIdMatchesExpected || hostMode === 'mock',
      packageVersionMatchesExpected: packageVersionMatchesExpected || hostMode === 'mock',
      apiAudienceMatchesExpected: apiAudienceMatchesExpected || hostMode === 'mock',
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

function normalizeOrigin(value: string | undefined): string | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  try {
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
