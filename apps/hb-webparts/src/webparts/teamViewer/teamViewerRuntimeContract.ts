/**
 * teamViewerRuntimeContract — TeamViewer webpart anti-drift contract.
 *
 * Phase-01 Prompt-01 scaffold. The TeamViewer webpart is article-bound
 * and presents article-linked team members (photo, name, title) with a
 * flag-gated bio/resume drawer. This module is the single source of
 * truth for:
 *
 *   - the webpart id tying manifest <-> mount.tsx renderer <-> any test
 *     importing the canonical id;
 *   - a machine-readable ownership map naming what this runtime owns
 *     and what it MUST NOT own (kept out of Kudos domain coupling).
 *
 * Do not change these values without updating all three of:
 *   - `TeamViewerWebPart.manifest.json`
 *   - `mount.tsx` renderer map
 *   - any doctrine / test importing `TEAM_VIEWER_WEBPART_ID`.
 */

/** TeamViewer public webpart id. */
export const TEAM_VIEWER_WEBPART_ID = 'c2f1b4e7-3a48-4d21-9c5e-7b82d4a6f901' as const;

export interface TeamViewerRuntimeOwnership {
  readonly webpartId: string;
  readonly manifestAlias: string;
  readonly owns: readonly string[];
  readonly doesNotOwn: readonly string[];
  readonly shares: readonly string[];
}

export const TEAM_VIEWER_RUNTIME_OWNERSHIP: TeamViewerRuntimeOwnership = {
  webpartId: TEAM_VIEWER_WEBPART_ID,
  manifestAlias: 'TeamViewerWebPart',
  owns: [
    'article-binding resolution (host site/page context -> active article)',
    'team-member normalization from article child rows',
    'density + layout selection across small/medium/large teams',
    'person card composition (photo, name, title)',
    'bio/resume detail drawer (flag-gated, disabled by default)',
    'photo hydration cache for viewer people',
    'hosted safe-zone layout handling',
    'loading / empty / error state rendering',
  ],
  doesNotOwn: [
    'recognition / Kudos domain semantics',
    'composer / celebrate / archive / feed workflows',
    'governance queue, audit timeline, or admin-review actions',
    'writing to article/team-member lists (viewer-only)',
  ],
  shares: [
    '@hbc/ui-kit/homepage primitives (avatar, empty state, spinner, icons)',
    'createGraphPersonPhotoFn for Graph-backed photo fetch',
    'createSharePointUserPhotoResolver for SP profile-photo fallback',
    'spContext store helpers for host site URL',
  ],
} as const;
