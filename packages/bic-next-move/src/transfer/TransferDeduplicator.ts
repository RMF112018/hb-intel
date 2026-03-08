import { BIC_TRANSFER_DEDUP_BUCKET_MS } from '../constants/manifest';

/**
 * Deduplication guard for BIC transfer events (D-03).
 *
 * Transfers are keyed on: `${itemKey}::${fromUserId}::${toUserId}::${bucketId}`
 * where bucketId = Math.floor(Date.now() / BIC_TRANSFER_DEDUP_BUCKET_MS).
 *
 * This 60-second bucket ensures that when both the hook-level diff detection
 * (useBicNextMove) AND an explicit recordBicTransfer() call detect the same
 * ownership change, only one notification is registered with
 * @hbc/notification-intelligence.
 *
 * The deduplicator is a module-level singleton — same instance for the entire
 * browser session. It uses a Set with automatic expiry to prevent unbounded growth.
 */

const _seen = new Set<string>();
const _expiry = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Returns true if this transfer event has NOT been seen in the current bucket window.
 * Marks the event as seen and schedules automatic expiry after the bucket window.
 */
export function shouldFireTransfer(
  itemKey: string,
  fromUserId: string | null,
  toUserId: string | null
): boolean {
  const bucketId = Math.floor(Date.now() / BIC_TRANSFER_DEDUP_BUCKET_MS);
  const key = `${itemKey}::${fromUserId ?? 'null'}::${toUserId ?? 'null'}::${bucketId}`;

  if (_seen.has(key)) {
    return false; // Duplicate — skip
  }

  _seen.add(key);

  // Auto-expire after 2× the bucket window to handle edge cases near bucket boundaries
  const timeout = setTimeout(() => {
    _seen.delete(key);
    _expiry.delete(key);
  }, BIC_TRANSFER_DEDUP_BUCKET_MS * 2);

  _expiry.set(key, timeout);
  return true;
}

/**
 * Clears all deduplication state. Used in tests only.
 * @internal
 */
export function _clearDeduplicatorForTests(): void {
  for (const timeout of _expiry.values()) {
    clearTimeout(timeout);
  }
  _seen.clear();
  _expiry.clear();
}
