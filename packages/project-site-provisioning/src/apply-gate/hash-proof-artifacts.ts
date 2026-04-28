import { createHash } from 'node:crypto';

/**
 * Deterministic SHA-256 (lowercase hex) of a serialized JSON proof
 * artifact string. Pure and offline; no filesystem dependency.
 */
export function hashJsonProofArtifact(jsonString: string): string {
  return createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Deterministic SHA-256 (lowercase hex) of a Markdown proof artifact
 * string. Pure and offline; no filesystem dependency.
 */
export function hashMarkdownProofArtifact(markdownString: string): string {
  return createHash('sha256').update(markdownString).digest('hex');
}
