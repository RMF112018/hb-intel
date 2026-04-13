/**
 * teamViewerNormalization — raw SharePoint rows → `TeamViewerPerson`.
 *
 * Enforces the Phase-01 fallback rules so malformed list rows never
 * reach the renderer:
 *
 *   - missing `DisplayName`  → the row is dropped (no "Unknown" rendering).
 *   - missing photo          → `photoUrl` left undefined; the card falls
 *                              back to Graph/SP photo hydration and then
 *                              to initials.
 *   - missing title (`Role`) → `jobTitle` left undefined; the card omits
 *                              the title row but preserves rhythm.
 *   - missing `TeamMemberId` → a deterministic synthetic id is generated
 *                              from the article + display name so React
 *                              keys stay stable within a render pass.
 *   - malformed / non-string field values → treated as missing.
 *
 * This layer is pure — no React, no network.
 */
import type { TeamViewerPerson } from '../teamViewerContracts.js';

/** Shape of a raw row from `HB Article Team Members`. */
export interface RawArticleTeamMemberRow {
  Id?: number | string;
  ArticleId?: unknown;
  TeamMemberId?: unknown;
  DisplayName?: unknown;
  Role?: unknown;
  Department?: unknown;
  Company?: unknown;
  SortOrder?: unknown;
  GroupKey?: unknown;
  BioSnippet?: unknown;
  ContactLink?: unknown;
  /** Person field is typically expanded to an object with EMail/Title. */
  PersonPrincipal?: { EMail?: string; Title?: string; UserName?: string } | string | null;
  /** Resume fields are proposed schema additions — see SCHEMA-NOTES.md. */
  ResumeRichText?: unknown;
  ResumeDocumentUrl?: unknown;
}

function asString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function asHyperlinkUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return asString(value);
  if (value && typeof value === 'object') {
    const url = (value as { Url?: unknown }).Url;
    return asString(url);
  }
  return undefined;
}

function extractPersonFields(raw: RawArticleTeamMemberRow): {
  displayName?: string;
  email?: string;
  upn?: string;
} {
  const principal = raw.PersonPrincipal;
  if (principal && typeof principal === 'object') {
    return {
      displayName: asString(principal.Title),
      email: asString(principal.EMail),
      upn: asString(principal.UserName),
    };
  }
  if (typeof principal === 'string') {
    // Person fields may serialize as "i:0#.f|membership|upn@tenant" or
    // as a plain display name. Treat as upn when it contains '|', else
    // as display name.
    const pipe = principal.indexOf('|');
    if (pipe >= 0) {
      const upn = principal.slice(pipe + 1).trim();
      return { upn: upn.split('|').pop() };
    }
    return { displayName: asString(principal) };
  }
  return {};
}

function syntheticId(articleId: string, displayName: string, index: number): string {
  return `${articleId}::${displayName.toLowerCase().replace(/\s+/g, '-')}::${index}`;
}

/**
 * Normalize one row. Returns `undefined` when the row cannot yield a
 * render-safe person (missing display name and nothing salvageable).
 */
export function normalizeArticleTeamMemberRow(
  raw: RawArticleTeamMemberRow,
  articleId: string,
  index: number,
): TeamViewerPerson | undefined {
  const person = extractPersonFields(raw);
  const displayName = asString(raw.DisplayName) ?? person.displayName;
  if (!displayName) return undefined;

  const teamMemberId = asString(raw.TeamMemberId);
  const id = teamMemberId ?? syntheticId(articleId, displayName, index);

  return {
    id,
    articleId,
    articleTeamMemberId: teamMemberId,
    displayName,
    email: person.email,
    upn: person.upn,
    jobTitle: asString(raw.Role),
    department: asString(raw.Department),
    teamLabel: asString(raw.Company),
    projectRole: undefined,
    groupKey: asString(raw.GroupKey),
    sortOrder: asNumber(raw.SortOrder),
    profileUrl: asHyperlinkUrl(raw.ContactLink),
    bio: asString(raw.BioSnippet),
    resumeRichText: asString(raw.ResumeRichText),
    resumeDocumentUrl: asHyperlinkUrl(raw.ResumeDocumentUrl),
    photoUrl: undefined,
  };
}

/** Normalize + filter out unusable rows. Preserves source order. */
export function normalizeArticleTeamMemberRows(
  rows: readonly RawArticleTeamMemberRow[],
  articleId: string,
): TeamViewerPerson[] {
  const out: TeamViewerPerson[] = [];
  rows.forEach((row, idx) => {
    const p = normalizeArticleTeamMemberRow(row, articleId, idx);
    if (p) out.push(p);
  });
  return out;
}
