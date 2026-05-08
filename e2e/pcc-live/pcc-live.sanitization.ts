const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const HTML_RE = /<[^>]+>/g;
const LONG_BLOB_RE =
  /\b(?=[A-Za-z0-9+/=]{24,}\b)(?=[A-Za-z0-9+/=]*\d)(?=[A-Za-z0-9+/=]*[A-Z])[A-Za-z0-9+/=]+\b/g;
const CREDENTIAL_RE = /\b(storageState|storage-state|cookies?|tokens?|auth|sessions?|secrets?)\b/gi;
const RAW_ARTIFACT_RE =
  /(test-results|playwright-report|trace\.zip|video\.webm|network\.har|\.auth|\.e2e-auth|\.storage-state)/gi;
const POLICY_CLAIM_RE =
  /(hard stop passed|hard stop failed|score-ready|phase 4 ready|56\/56 achieved|100\/100|mold breaker achieved|deployment ready|ready for phase 4|\bcaptured\b)/gi;
const URL_QUERY_RE = /(\bhttps?:\/\/[^\s?#]+)\?[^\s)]+/gi;
const ABS_OR_REL_PATH_QUERY_RE = /((?:\/[\w./-]+|[A-Za-z0-9._-]+\/[\w./-]+))\?[^\s)]+/g;
const GENERIC_QUERY_RE = /\?[A-Za-z0-9_.-]+=[^ \n)]+/g;
const SENSITIVE_QUERY_RE = /([?&](?:token|auth|session|secret)=[^&#\s]+)/gi;
const UNSAFE_PATH_RE =
  /(^|[\\/])(?:test-results|playwright-report|\.auth|\.e2e-auth|\.secrets|\.storage-state)(?:[\\/]|$)|storagestate|storage-state|cookies?|tokens?|auth|sessions?|secret|trace|video|har/i;

export interface PccLiveSanitizeTextOptions {
  readonly preserveEvidencePaths?: boolean;
  readonly redactPolicyClaims?: boolean;
  readonly maxLength?: number;
}

export function redactPccLivePhoneNumbers(input: string): string {
  let value = input;

  const redactors: RegExp[] = [
    /tel:\+?\d{11,15}\b/gi,
    /\+\d{11,15}\b/g,
    /\(\d{3}\)\s*\d{3}[-.\s]\d{4}\b/g,
    /\b\d{3}[-.]\d{3}[-.]\d{4}\b/g,
    /\b\d{3}\s\d{3}\s\d{4}\b/g,
    /\b(?:phone|mobile)\s*:\s*(?:\+\d{11,15}|\(\d{3}\)\s*\d{3}[-.\s]\d{4}|\d{3}[-.\s]\d{3}[-.\s]\d{4})\b/gi,
  ];

  for (const pattern of redactors) {
    value = value.replace(pattern, '[redacted-phone]');
  }

  return value;
}

function stripQueryStrings(input: string): string {
  const noSensitiveQuery = input.replace(SENSITIVE_QUERY_RE, '');
  return noSensitiveQuery
    .replace(URL_QUERY_RE, '$1')
    .replace(ABS_OR_REL_PATH_QUERY_RE, '$1')
    .replace(GENERIC_QUERY_RE, '');
}

export function sanitizePccLiveText(
  input: string,
  options: PccLiveSanitizeTextOptions = {},
): string {
  const { preserveEvidencePaths = true, redactPolicyClaims = true, maxLength = 240 } = options;

  let value = input.replace(/\s+/g, ' ').trim();
  value = stripQueryStrings(value);
  value = value.replace(EMAIL_RE, '[redacted-email]');
  value = redactPccLivePhoneNumbers(value);
  value = value.replace(CREDENTIAL_RE, '[redacted-cred]');
  value = value.replace(RAW_ARTIFACT_RE, '[redacted-artifact]');
  if (redactPolicyClaims) {
    value = value.replace(POLICY_CLAIM_RE, '[redacted-claim]');
  }
  value = value.replace(HTML_RE, '[redacted-html]');
  value = value
    .replace(/\bfailureSummary\b/gi, '[redacted-axe-payload]')
    .replace(/\bnode\.html\b/gi, '[redacted-axe-payload]')
    .replace(/"(?:any|all|none)"\s*:\s*\[/gi, '[redacted-axe-payload]:[');
  value = value.replace(LONG_BLOB_RE, '[redacted-blob]');

  if (!preserveEvidencePaths) {
    value = value.replace(/\b\d{8}-\d{6}\b/g, '[redacted-run-id]');
  }

  return value.slice(0, maxLength);
}

export function isPccLiveUnsafeArtifactPath(input: string): boolean {
  const pathNoQuery = stripQueryStrings(input);
  return UNSAFE_PATH_RE.test(pathNoQuery);
}

export function sanitizePccLiveArtifactPath(input: string): string {
  const pathNoQuery = stripQueryStrings(input);
  if (isPccLiveUnsafeArtifactPath(pathNoQuery)) {
    return '[redacted-artifact-path]';
  }
  return sanitizePccLiveText(pathNoQuery, {
    preserveEvidencePaths: true,
    redactPolicyClaims: false,
    maxLength: 400,
  });
}
