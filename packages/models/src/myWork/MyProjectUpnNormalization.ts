/**
 * Canonical UPN parsing, normalization, and serialization helpers for
 * My Projects role assignment storage contracts.
 */

const UPN_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function extractDelimitedTokens(value: string): string[] {
  return value
    .split(/[;,]/g)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

function normalizeRawToken(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  return UPN_PATTERN.test(normalized) ? normalized : null;
}

export function normalizeUpn(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  return normalizeRawToken(value);
}

export function normalizeUpnArray(values: unknown): string[] {
  const rawValues: string[] = [];

  if (Array.isArray(values)) {
    for (const value of values) {
      if (typeof value === 'string') {
        rawValues.push(value);
      }
    }
  } else if (typeof values === 'string') {
    rawValues.push(values);
  }

  const normalized = Array.from(
    new Set(
      rawValues
        .map((value) => normalizeRawToken(value))
        .filter((value): value is string => value !== null),
    ),
  );

  normalized.sort((left, right) => left.localeCompare(right));
  return normalized;
}

function parseJsonArrayCandidate(value: string): unknown[] | null {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function salvageBracketedList(value: string): string[] {
  const trimmed = value.trim();
  if (!(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return [];
  }

  const inner = trimmed.slice(1, -1).trim();
  if (!inner) {
    return [];
  }

  return inner
    .split(',')
    .map((part) => part.trim().replace(/^['"]+|['"]+$/g, ''))
    .filter((part) => part.length > 0);
}

export function parseUpnArrayStorage(value: unknown): string[] {
  if (value == null) {
    return [];
  }

  if (Array.isArray(value)) {
    return normalizeUpnArray(value);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const parsedArray = parseJsonArrayCandidate(trimmed);
  if (parsedArray) {
    return normalizeUpnArray(parsedArray);
  }

  const salvaged = salvageBracketedList(trimmed);
  if (salvaged.length > 0) {
    return normalizeUpnArray(salvaged);
  }

  if (trimmed.includes(',') || trimmed.includes(';')) {
    return normalizeUpnArray(extractDelimitedTokens(trimmed));
  }

  return normalizeUpnArray([trimmed]);
}

export function serializeUpnArrayStorage(values: unknown): string {
  return JSON.stringify(normalizeUpnArray(values));
}
