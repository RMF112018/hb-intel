/**
 * Wave 15 — External Systems Launch Pad — pure URL policy helper.
 *
 * Mirrors the canonical artifact
 * `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_url_policy_contract.json`
 * verbatim. The helper has no I/O, no Date.now, no Math.random, no fetch, and
 * no global state — it parses a candidate URL with `new URL()` and returns a
 * structured allow/deny result.
 *
 * No live external-system calls, no SharePoint/Graph/PnP writes, no tenant
 * mutation, no iframe/current-image embed behavior — iframe and current-image
 * contexts are blocked by default per the canonical contract.
 */

export const URL_POLICY_REASON_CODES = [
  'allowed',
  'invalid-url',
  'scheme-blocked',
  'host-not-approved',
  'host-blocked-local',
  'query-contains-credential-like-parameter',
  'custom-link-requires-approval',
  'iframe-blocked-by-default',
  'current-image-blocked-by-default',
  'policy-unavailable',
] as const;

export type UrlPolicyReasonCode = (typeof URL_POLICY_REASON_CODES)[number];

/**
 * Verbatim mirror of the URL policy contract artifact. Inlined as a typed
 * const so consumers never read JSON at runtime and the contract is type-
 * checked at build time.
 */
export const EXTERNAL_URL_POLICY_CONTRACT = {
  allowedSchemes: ['https'],
  blockedSchemes: ['http', 'javascript', 'data', 'file', 'ftp'],
  blockedHosts: ['localhost', '127.0.0.1', '0.0.0.0'],
  blockPrivateIpRanges: true,
  customLinksRequireApproval: true,
  requiredApproverRoles: ['project-manager', 'project-executive'],
  queryStringPolicy:
    'allowed but must not contain token, secret, password, key, code, sig, or credential-like parameters',
  iframeDefault: 'blocked',
  currentImageDefault: 'blocked',
  policySource: 'PCC External URL Policy Registry',
} as const;

/**
 * Credential-like query parameter blocklist. Case-insensitive match against
 * the parameter name only (values are not inspected — values may legitimately
 * contain these substrings; only the parameter NAME is the signal).
 */
export const CREDENTIAL_LIKE_QUERY_PARAM_NAMES = [
  'token',
  'secret',
  'password',
  'passwd',
  'pwd',
  'key',
  'api_key',
  'apikey',
  'code',
  'sig',
  'signature',
  'credential',
  'client_secret',
  'access_token',
  'refresh_token',
  'sharedaccesssignature',
] as const;

export type CredentialLikeQueryParamName = (typeof CREDENTIAL_LIKE_QUERY_PARAM_NAMES)[number];

/**
 * Approved-domain rule. Exact host or controlled wildcard suffix (`*.suffix`)
 * matching only — no regex evaluation against arbitrary inputs. The optional
 * `perSystemKey` lets future prompts scope a rule to one system.
 */
export interface IExternalUrlPolicyRule {
  readonly approvedHosts?: readonly string[]; // exact hostnames, lowercased
  readonly approvedHostSuffixes?: readonly string[]; // '*.example.invalid' or '.example.invalid' style suffix; matched case-insensitively
  readonly perSystemKey?: string;
  readonly perLinkType?: string;
}

export interface IEvaluateExternalUrlPolicyInput {
  readonly candidateUrl: string;
  readonly systemKey?: string;
  readonly linkType?: string;
  readonly approvedDomainPolicy?: readonly IExternalUrlPolicyRule[];
  readonly requiresApproval?: boolean;
  readonly isIframeContext?: boolean;
  readonly isCurrentImageContext?: boolean;
}

export interface IEvaluateExternalUrlPolicyResult {
  readonly isAllowed: boolean;
  readonly reason: UrlPolicyReasonCode;
  readonly hostname?: string;
  readonly detectedCredentialLikeParams?: readonly string[];
}

/**
 * RFC 1918 private IPv4 ranges. Each entry is the canonical CIDR comment;
 * the regex below is the structural matcher.
 */
const PRIVATE_IPV4_RANGE_REGEXES: readonly RegExp[] = [
  // 10.0.0.0/8
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  // 172.16.0.0/12 — 172.16 through 172.31
  /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/,
  // 192.168.0.0/16
  /^192\.168\.\d{1,3}\.\d{1,3}$/,
];

/**
 * IPv6 loopback hostnames as URL.hostname returns them. WHATWG URL parsing
 * normalizes `[::1]` to `[::1]` (with brackets) for `URL.hostname`, but some
 * environments may return `::1`; check both.
 */
const LOOPBACK_HOSTNAMES_LOWER: readonly string[] = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '[::1]',
  '::1',
  '[::]',
  '::',
];

function tryParseUrl(candidate: string): URL | null {
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function isLoopbackOrPrivateHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (LOOPBACK_HOSTNAMES_LOWER.includes(lower)) {
    return true;
  }
  // Strip surrounding brackets for any IPv6 form so the IPv4-fallback regex
  // can run cleanly against pure-numeric hostnames.
  const stripped = lower.startsWith('[') && lower.endsWith(']') ? lower.slice(1, -1) : lower;
  for (const re of PRIVATE_IPV4_RANGE_REGEXES) {
    if (re.test(stripped)) {
      return true;
    }
  }
  return false;
}

function detectCredentialLikeParams(url: URL): readonly string[] {
  const hits: string[] = [];
  for (const [name] of url.searchParams.entries()) {
    const lowered = name.toLowerCase();
    if ((CREDENTIAL_LIKE_QUERY_PARAM_NAMES as readonly string[]).includes(lowered)) {
      hits.push(name);
    }
  }
  return hits;
}

function hostMatchesRule(hostname: string, rule: IExternalUrlPolicyRule): boolean {
  const host = hostname.toLowerCase();
  if (rule.approvedHosts) {
    for (const exact of rule.approvedHosts) {
      if (exact.toLowerCase() === host) {
        return true;
      }
    }
  }
  if (rule.approvedHostSuffixes) {
    for (const raw of rule.approvedHostSuffixes) {
      const suffixWithDot = raw.startsWith('*.')
        ? raw.slice(1).toLowerCase()
        : raw.startsWith('.')
          ? raw.toLowerCase()
          : `.${raw.toLowerCase()}`;
      if (host === suffixWithDot.slice(1) || host.endsWith(suffixWithDot)) {
        return true;
      }
    }
  }
  return false;
}

function ruleAppliesToContext(
  rule: IExternalUrlPolicyRule,
  systemKey: string | undefined,
  linkType: string | undefined,
): boolean {
  if (rule.perSystemKey && rule.perSystemKey !== systemKey) {
    return false;
  }
  if (rule.perLinkType && rule.perLinkType !== linkType) {
    return false;
  }
  return true;
}

/**
 * Pure URL policy evaluator. Decision order matches the canonical contract:
 *
 *   1. iframe context → `iframe-blocked-by-default`
 *   2. current-image context → `current-image-blocked-by-default`
 *   3. URL parse failure → `invalid-url`
 *   4. scheme not in `allowedSchemes` → `scheme-blocked`
 *   5. host is loopback / 0.0.0.0 / RFC 1918 private / IPv6 loopback → `host-blocked-local`
 *   6. `requiresApproval === true` and contract requires approval → `custom-link-requires-approval`
 *   7. query string contains a credential-like parameter name → `query-contains-credential-like-parameter`
 *   8. approved-domain policy provided and host matches none → `host-not-approved`
 *   9. otherwise → `allowed`
 *
 * The helper never throws. Malformed input maps to `invalid-url`.
 */
export function evaluateExternalUrlPolicy(
  input: IEvaluateExternalUrlPolicyInput,
): IEvaluateExternalUrlPolicyResult {
  if (input.isIframeContext === true) {
    return { isAllowed: false, reason: 'iframe-blocked-by-default' };
  }
  if (input.isCurrentImageContext === true) {
    return { isAllowed: false, reason: 'current-image-blocked-by-default' };
  }

  const parsed = tryParseUrl(input.candidateUrl);
  if (parsed === null) {
    return { isAllowed: false, reason: 'invalid-url' };
  }

  const scheme = parsed.protocol.replace(/:$/, '').toLowerCase();
  if (!(EXTERNAL_URL_POLICY_CONTRACT.allowedSchemes as readonly string[]).includes(scheme)) {
    return { isAllowed: false, reason: 'scheme-blocked', hostname: parsed.hostname };
  }

  if (isLoopbackOrPrivateHost(parsed.hostname)) {
    return { isAllowed: false, reason: 'host-blocked-local', hostname: parsed.hostname };
  }

  if (input.requiresApproval === true && EXTERNAL_URL_POLICY_CONTRACT.customLinksRequireApproval) {
    return {
      isAllowed: false,
      reason: 'custom-link-requires-approval',
      hostname: parsed.hostname,
    };
  }

  const credentialLike = detectCredentialLikeParams(parsed);
  if (credentialLike.length > 0) {
    return {
      isAllowed: false,
      reason: 'query-contains-credential-like-parameter',
      hostname: parsed.hostname,
      detectedCredentialLikeParams: credentialLike,
    };
  }

  if (input.approvedDomainPolicy && input.approvedDomainPolicy.length > 0) {
    const matched = input.approvedDomainPolicy.some(
      (rule) =>
        ruleAppliesToContext(rule, input.systemKey, input.linkType) &&
        hostMatchesRule(parsed.hostname, rule),
    );
    if (!matched) {
      return { isAllowed: false, reason: 'host-not-approved', hostname: parsed.hostname };
    }
  }

  return { isAllowed: true, reason: 'allowed', hostname: parsed.hostname };
}
