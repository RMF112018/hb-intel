/**
 * Minimal identity shape used across HB Intel packages.
 * Re-exported from `@hbc/versioned-record` so consuming modules
 * do not need to import it from a separate package.
 */
export interface IBicOwner {
  userId: string;
  displayName: string;
  role: string;
}
