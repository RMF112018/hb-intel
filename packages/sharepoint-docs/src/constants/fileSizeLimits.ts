/**
 * File size thresholds for upload validation (D-10).
 * All values in bytes.
 */

/** Files below this size use standard chunked upload without confirmation. */
export const SIZE_STANDARD_MAX = 250 * 1024 * 1024;       // 250 MB

/** Files between SIZE_STANDARD_MAX and SIZE_CONFIRM_MAX require user confirmation. */
export const SIZE_CONFIRM_MAX = 1024 * 1024 * 1024;       // 1 GB

/** Files above SIZE_CONFIRM_MAX are blocked entirely. */
export const SIZE_HARD_BLOCK = SIZE_CONFIRM_MAX;

/** Files above this threshold use Graph API chunked upload sessions (>4MB). */
export const SIZE_CHUNKED_THRESHOLD = 4 * 1024 * 1024;    // 4 MB

/** Maximum file size that can be queued in the offline queue (D-03). */
export const SIZE_OFFLINE_MAX = 50 * 1024 * 1024;         // 50 MB

/** Chunk size for chunked Graph API upload sessions. */
export const UPLOAD_CHUNK_SIZE = 10 * 1024 * 1024;        // 10 MB per chunk
