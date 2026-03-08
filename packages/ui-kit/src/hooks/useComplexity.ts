/**
 * useComplexity — stub hook for SF02-T05 pending SF03 Complexity Mode package.
 *
 * Returns a static `{ variant: 'standard' }` until `@hbc/complexity` (SF03)
 * is implemented and wired into the provider tree.
 *
 * @see docs/architecture/plans/shared-features/SF02-T05-Components.md
 */
export function useComplexity(): { variant: 'essential' | 'standard' | 'expert' } {
  return { variant: 'standard' };
}
