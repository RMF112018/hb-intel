/**
 * HbKudos — Phase-14 structural scaffold seam for the future HB Kudos
 * public webpart.
 *
 * Phase-14 Prompt-01 (Structural Split and Registration).
 *
 * This component is intentionally a first-class but scaffold-grade runtime
 * entry. It establishes a trustworthy boundary for the HB Kudos public
 * surface without claiming final behavior. Follow-up prompts in Phase-14
 * will land the real surface against the schema already extracted in
 * `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/
 * people-culture-kudos-sharepoint-schema-report.md` — recognition feed /
 * spotlight, archive / browsing, celebrate interaction, kudos submission
 * entry, and (later) moderation-aware behavior.
 *
 * Scope contract (what this seam must do today):
 *   1. Provide a strongly-typed runtime props contract that matches
 *      `mount.tsx`'s `WEBPART_RENDERERS` entry signature exactly.
 *   2. Render a scaffold panel that clearly identifies itself as the
 *      Phase-14 HB Kudos public seam — no production claims, no fake
 *      final behavior.
 *   3. Compile, typecheck, lint, and package into `hb-webparts.sppkg`
 *      via the existing `tools/build-spfx-package.ts` discovery walker.
 *
 * Explicitly out of scope for this seam:
 *   - rendering real kudos entries,
 *   - any SharePoint REST / list calls,
 *   - reaction / celebrate behavior,
 *   - submission entry flow,
 *   - moderation / approval workflows,
 *   - archive browsing / filtering,
 *   - final UI / visual polish.
 *
 * Related support components already in the repo (do NOT import here to
 * avoid mistaking support components for authoritative wiring; they are
 * left as a library the future real component will pull in):
 *   - `apps/hb-webparts/src/webparts/kudosPage/KudosPage.tsx`
 *   - `apps/hb-webparts/src/webparts/kudosPage/KudosModerationWorkspace.tsx`
 */
import * as React from 'react';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';

export interface HbKudosProps {
  config?: Record<string, unknown>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
}

const SCAFFOLD_STYLE: React.CSSProperties = {
  fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
  color: '#1a1a1a',
  background: '#ffffff',
  border: '1px dashed rgba(34, 83, 145, 0.35)',
  borderLeft: '5px solid #225391',
  borderRadius: 12,
  padding: '20px 24px',
  maxWidth: 820,
};

const EYEBROW_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 800,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: '#225391',
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

export function HbKudos({ config: _config, identity: _identity }: HbKudosProps): React.JSX.Element {
  return (
    <section
      aria-label="HB Kudos — Phase-14 structural scaffold"
      data-hbc-webpart="hb-kudos"
      data-hbc-webpart-seam="phase-14-structural-scaffold"
      style={SCAFFOLD_STYLE}
    >
      <div style={EYEBROW_STYLE}>Phase-14 structural scaffold</div>
      <h2 style={HEADING_STYLE}>HB Kudos</h2>
      <p style={BODY_STYLE}>
        Public recognition surface — feed, spotlight, archive, celebrate,
        and kudos submission entry. Implementation is intentionally
        deferred to a later Phase-14 prompt. This seam exists so the
        webpart manifest, mount registration, and
        <code> hb-webparts.sppkg </code>
        packaging path are all in place and verifiable before the real
        runtime lands.
      </p>
      <p style={BODY_STYLE}>
        Schema authority:
        <code> docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/people-culture-kudos-sharepoint-schema-report.md </code>
      </p>
    </section>
  );
}
