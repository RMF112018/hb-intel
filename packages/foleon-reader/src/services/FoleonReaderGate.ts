/**
 * Pure reader-gate resolver.
 *
 * Deliberately framework-free and UI-free so it can be unit-tested
 * exhaustively against the gating matrix in integration-plan §03.
 *
 * Gating order (most specific first):
 *   1. record exists
 *   2. IsVisible
 *   3. PublishStatus = Published
 *   4. AllowEmbed
 *   5. RequiresExternalOpen != true
 *   6. PublishedUrl or EmbedUrl present
 *   7. DisplayFrom / DisplayThrough window
 *   8. URL origin is allowlisted (and preview-URL policy)
 */
import type { FoleonContentRecord } from '../types/foleon-content.types.js';
import type { FoleonGateResult } from '../types/foleon-runtime.types.js';
import { isAllowedFoleonUrl, type FoleonOriginPolicy } from './FoleonOriginPolicy.js';

export function evaluateFoleonReaderGate(
  record: FoleonContentRecord | undefined,
  policy: FoleonOriginPolicy,
  now: Date = new Date(),
): FoleonGateResult {
  if (!record) return { allowed: false, reason: 'missing-record' };
  if (!record.isVisible) return { allowed: false, reason: 'not-visible', record };
  if (record.publishStatus !== 'Published')
    return { allowed: false, reason: 'not-published', record };
  if (!record.allowEmbed) return { allowed: false, reason: 'embed-disallowed', record };
  if (record.requiresExternalOpen)
    return { allowed: false, reason: 'requires-external-open', record };

  const candidate = record.embedUrl && record.embedUrl.trim() ? record.embedUrl : record.publishedUrl;
  if (!candidate || !candidate.trim()) return { allowed: false, reason: 'no-url', record };

  const nowMs = now.getTime();
  if (record.displayFrom) {
    const fromMs = Date.parse(record.displayFrom);
    if (!Number.isNaN(fromMs) && fromMs > nowMs)
      return { allowed: false, reason: 'display-window-future', record };
  }
  if (record.displayThrough) {
    const throughMs = Date.parse(record.displayThrough);
    if (!Number.isNaN(throughMs) && throughMs < nowMs)
      return { allowed: false, reason: 'display-window-past', record };
  }

  const originCheck = isAllowedFoleonUrl(policy, candidate);
  if (!originCheck.allowed) {
    const reason = originCheck.reason === 'preview-url-blocked' ? 'preview-url-blocked' : 'origin-not-allowlisted';
    return { allowed: false, reason, record };
  }

  return { allowed: true, reason: 'ok', record, embedUrl: candidate };
}
