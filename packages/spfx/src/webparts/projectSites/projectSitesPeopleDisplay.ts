import { getSpfxContext } from '@hbc/auth/spfx';
import { humanizeUpn } from './projectSitesFilter.js';

interface SharePointSiteUserResponse {
  Title?: string;
}

function normalizeUpn(value: string): string {
  return value.trim().toLowerCase();
}

function looksLikeEmail(value: string): boolean {
  return value.includes('@') && !value.includes(' ');
}

async function fetchAuthoritativeDisplayName(upn: string): Promise<string | null> {
  const context = getSpfxContext();
  const siteUrl = context.pageContext.web.absoluteUrl;
  const endpoint = `${siteUrl}/_api/web/siteusers/getByEmail('${encodeURIComponent(upn)}')?$select=Title`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json;odata=nometadata',
      },
    });

    if (!response.ok) return null;

    const body = (await response.json()) as SharePointSiteUserResponse;
    const title = body.Title?.trim();
    return title && title.length > 0 ? title : null;
  } catch {
    return null;
  }
}

class ProjectSitesPeopleDisplayResolver {
  private readonly cache = new Map<string, string | null>();

  async resolveOne(upn: string): Promise<string> {
    const raw = upn.trim();
    if (!raw) return '';
    const normalized = normalizeUpn(raw);

    if (this.cache.has(normalized)) {
      return this.cache.get(normalized) ?? humanizeUpn(raw);
    }

    if (!looksLikeEmail(raw)) {
      const fallback = humanizeUpn(raw);
      this.cache.set(normalized, fallback || null);
      return fallback;
    }

    const authoritative = await fetchAuthoritativeDisplayName(raw);
    if (authoritative) {
      this.cache.set(normalized, authoritative);
      return authoritative;
    }

    const fallback = humanizeUpn(raw);
    this.cache.set(normalized, fallback || null);
    return fallback;
  }

  async resolveMany(upns: string[]): Promise<Record<string, string>> {
    const unique = Array.from(new Set(upns.map((v) => v.trim()).filter(Boolean)));
    const resolved = await Promise.all(
      unique.map(async (upn) => {
        const label = await this.resolveOne(upn);
        return [upn, label] as const;
      }),
    );

    const map: Record<string, string> = {};
    for (const [upn, label] of resolved) {
      map[upn] = label;
    }
    return map;
  }
}

const resolverSingleton = new ProjectSitesPeopleDisplayResolver();

export function getProjectSitesPeopleDisplayResolver(): ProjectSitesPeopleDisplayResolver {
  return resolverSingleton;
}

export async function resolveProjectSitesPeopleDisplayLabels(
  upns: string[],
): Promise<Record<string, string>> {
  return getProjectSitesPeopleDisplayResolver().resolveMany(upns);
}

export function formatProjectSitesPersonLabel(
  upn: string,
  displayLabels: Record<string, string>,
): string {
  const key = upn.trim();
  if (!key) return '';
  return displayLabels[key] ?? humanizeUpn(key);
}
