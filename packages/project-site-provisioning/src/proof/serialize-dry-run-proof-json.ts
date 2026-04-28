import type { DryRunProofArtifact } from '../contracts/dry-run-proof-artifact.js';

/**
 * Canonical JSON encoding for the dry-run proof artifact. Two-space
 * indent and a trailing newline so the committed baseline file matches
 * normal editor expectations and is byte-stable across regeneration.
 */
export function serializeDryRunProofJson(artifact: DryRunProofArtifact): string {
  return `${JSON.stringify(artifact, null, 2)}\n`;
}
