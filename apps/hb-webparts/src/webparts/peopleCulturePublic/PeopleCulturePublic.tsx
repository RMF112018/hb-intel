/**
 * PeopleCulturePublic — Phase-14 structural scaffold seam for the future
 * People & Culture public webpart.
 *
 * Phase-14 Prompt-01 (Structural Split and Registration).
 *
 * This is the new explicit public surface seam for People & Culture.
 * It coexists with the legacy merged runtime
 * (`apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`,
 * manifest id `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4`) which is preserved
 * as compatibility for already-placed SharePoint page instances. A
 * follow-up Phase-14 prompt will land the real public surface against
 * the live `People Culture Announcements`
 * (`2cd191fc-a7ea-49f2-af05-c395c2326e57`) and `People Culture
 * Celebrations` (`b87bf664-0531-418b-902c-726e5fb87083`) lists, whose
 * schemas were discovered but not yet extracted in the Phase-14 schema
 * work.
 *
 * Scope contract (what this seam must do today):
 *   1. Provide a strongly-typed runtime props contract that matches
 *      `mount.tsx`'s `WEBPART_RENDERERS` entry signature exactly.
 *   2. Render a scaffold panel that clearly identifies itself as the
 *      Phase-14 People & Culture public seam — no production claims,
 *      no fake final behavior.
 *   3. Compile, typecheck, lint, and package into `hb-webparts.sppkg`
 *      via the existing `tools/build-spfx-package.ts` discovery walker.
 *
 * Explicitly out of scope for this seam:
 *   - rendering real announcements, celebrations, or culture-program
 *     content,
 *   - any SharePoint REST / list calls (the two sibling list schemas
 *     are not yet extracted),
 *   - audience / visibility scoping behavior,
 *   - media / thumbnail handling,
 *   - scheduling / publish-window logic,
 *   - final UI / visual polish.
 *
 * Related components:
 *   - Legacy compatibility runtime:
 *     `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
 *     (preserved under the existing
 *     `27ac10f4-4054-4dd2-bd53-3b4ef4379ab4` GUID).
 */
import * as React from 'react';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import type {
  PeopleCulturePublicConfig,
  PeopleCultureViewerAudience,
} from '../../homepage/webparts/peopleCultureSplitContracts.js';

export interface PeopleCulturePublicProps {
  /**
   * Raw config blob from the SPFx manifest / host. The structural scaffold
   * accepts an untyped record for backward compatibility; downstream work
   * (Phase-14 pc/ Prompt-02) will migrate the runtime onto `splitConfig`,
   * which is the strongly-typed split contract introduced in Prompt-01.
   */
  config?: Record<string, unknown>;
  /**
   * Strongly-typed People & Culture public split config (Phase-14 pc/
   * Prompt-01). Optional today because the scaffold does not consume it;
   * the Prompt-02 public runtime will require it.
   */
  splitConfig?: Partial<PeopleCulturePublicConfig>;
  identity?: HomepageIdentityInput;
  viewerAudience?: PeopleCultureViewerAudience;
  assetBaseUrl?: string;
}

const SCAFFOLD_STYLE: React.CSSProperties = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  color: '#1a1a1a',
  background: '#ffffff',
  border: '1px dashed rgba(229, 126, 70, 0.35)',
  borderLeft: '5px solid #e57e46',
  borderRadius: 12,
  padding: '20px 24px',
  maxWidth: 820,
};

const EYEBROW_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#c2410c',
  marginBottom: 8,
};

const HEADING_STYLE: React.CSSProperties = {
  fontSize: '1.375rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  lineHeight: 1.15,
  color: '#0a1b33',
  marginBottom: 8,
};

const BODY_STYLE: React.CSSProperties = {
  fontSize: '0.9375rem',
  lineHeight: 1.55,
  color: 'rgba(26, 26, 26, 0.76)',
  marginBottom: 4,
};

export function PeopleCulturePublic({
  config: _config,
  splitConfig: _splitConfig,
  identity: _identity,
  viewerAudience: _viewerAudience,
}: PeopleCulturePublicProps): React.JSX.Element {
  return (
    <section
      aria-label="People and Culture — Phase-14 structural scaffold"
      data-hbc-webpart="people-culture-public"
      data-hbc-webpart-seam="phase-14-structural-scaffold"
      style={SCAFFOLD_STYLE}
    >
      <div style={EYEBROW_STYLE}>Phase-14 structural scaffold</div>
      <h2 style={HEADING_STYLE}>People and Culture</h2>
      <p style={BODY_STYLE}>
        Public culture surface — announcements, celebrations and
        milestones, and broader culture programming. Implementation is
        intentionally deferred to a later Phase-14 prompt. This seam
        exists so the webpart manifest, mount registration, and
        <code> hb-webparts.sppkg </code>
        packaging path are in place and verifiable before the real
        runtime lands.
      </p>
      <p style={BODY_STYLE}>
        The legacy merged People &amp; Culture runtime
        (<code>27ac10f4-4054-4dd2-bd53-3b4ef4379ab4</code>) remains live
        as a compatibility seam until the public + Kudos split rollout
        is complete.
      </p>
    </section>
  );
}
