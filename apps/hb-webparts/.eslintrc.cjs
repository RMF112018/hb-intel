/**
 * ESLint configuration — hb-webparts (HB Central homepage SPFx webparts)
 *
 * Extends the monorepo base and adds homepage-specific import guardrails.
 * Homepage webparts must use @hbc/ui-kit/homepage as their primary UI entry
 * point — not the broad @hbc/ui-kit root or @hbc/ui-kit/app-shell.
 *
 * Allowed entry points:
 *   @hbc/ui-kit/homepage  — governed homepage primitives + contract constants
 *   @hbc/ui-kit/theme     — token-only imports when needed
 *   @hbc/ui-kit/icons     — icon-only imports when needed
 *
 * Prohibited entry points:
 *   @hbc/ui-kit            — full library (exceeds SPFx bundle budget, breaks governance)
 *   @hbc/ui-kit/app-shell  — shell chrome (homepage is not a shell surface)
 *   @hbc/ui-kit/primitives — homepage gets needed primitives via /homepage re-exports
 *   @hbc/ui-kit/fluent     — Fluent passthroughs are not part of the governed homepage system
 *
 * @see docs/reference/ui-kit/entry-points.md
 * @see docs/reference/sharepoint-homepage-shell-boundaries.md
 */
module.exports = {
  extends: ['../../.eslintrc.base.js'],
  rules: {
    'no-restricted-imports': ['error', {
      paths: [
        {
          name: '@hbc/ui-kit',
          message: 'Homepage webparts must import from @hbc/ui-kit/homepage, not the full @hbc/ui-kit entry point. See docs/reference/ui-kit/entry-points.md.',
        },
        {
          name: '@hbc/ui-kit/app-shell',
          message: 'Homepage webparts must import from @hbc/ui-kit/homepage, not @hbc/ui-kit/app-shell. The app-shell entry point is for SPFx domain apps that need shell chrome.',
        },
        {
          name: '@hbc/ui-kit/primitives',
          message: 'Homepage webparts must import from @hbc/ui-kit/homepage, which re-exports all primitives needed for homepage composition. Direct @hbc/ui-kit/primitives access risks pulling productive-lane-only components into the SPFx bundle.',
        },
        {
          name: '@hbc/ui-kit/fluent',
          message: 'Homepage webparts must import from @hbc/ui-kit/homepage. Fluent UI passthroughs are not part of the governed homepage surface system.',
        },
      ],
    }],
  },
};
