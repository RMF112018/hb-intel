/**
 * HbcPeoplePicker — Governed people selection primitive.
 * Graph live lookup as sanctioned identity source.
 */

// ── Person data ──────────────────────────────────────────────────────────

export interface PersonEntry {
  /** User principal name (email format) — primary key */
  upn: string;
  /** Display name from directory */
  displayName: string;
  /** Entra/Graph stable object ID when available */
  id?: string;
  /** Given (first) name from directory */
  givenName?: string;
  /** Surname (last name) from directory */
  surname?: string;
  /** Primary mail address when distinct from UPN */
  mail?: string;
  /** Job title from directory */
  jobTitle?: string;
  /** Department from directory */
  department?: string;
  /**
   * Photo URL or blob URL when available. Photo retrieval is a
   * separate path from user search — this field is populated
   * asynchronously after the initial search result arrives.
   */
  photoUrl?: string;
}

// ── Photo state ─────────────────────────────────────────────────────────

/**
 * Typed avatar/photo state for a person. Distinguishes the normal
 * "user has no photo" case (ImageNotFound) from transient failures.
 *
 * - `idle`         — photo not yet requested
 * - `loading`      — fetch in progress
 * - `available`    — photo blob URL ready for rendering
 * - `missing`      — endpoint returned 404 ImageNotFound (normal)
 * - `failed`       — transient error (network, auth, unexpected status)
 */
export type PhotoState = 'idle' | 'loading' | 'available' | 'missing' | 'failed';

export interface PersonPhotoEntry {
  /** The person's canonical key (UPN or Graph id) used for cache keying */
  key: string;
  state: PhotoState;
  /** Blob URL when state is 'available'; undefined otherwise */
  url?: string;
}

// ── Photo adapter ───────────────────────────────────────────────────────

/**
 * Async function that fetches a person's photo binary and returns a
 * blob URL, or `undefined` if the photo is missing (404 ImageNotFound).
 * Throws on transient failures so callers can distinguish missing from broken.
 */
export type PersonPhotoFn = (personIdOrUpn: string) => Promise<string | undefined>;

// ── Search adapter ───────────────────────────────────────────────────────

/** Async function that searches people by query string and returns matches. */
export type PeopleSearchFn = (query: string) => Promise<PersonEntry[]>;

// ── Component props ──────────────────────────────────────────────────────

export interface HbcPeoplePickerProps {
  /** Field label */
  label: string;
  /** Selected people (UPN strings for backward compat, or PersonEntry objects) */
  value: string[] | PersonEntry[];
  /** Called when selection changes — always returns PersonEntry[] for type safety */
  onChange: (people: PersonEntry[]) => void;
  /** Search adapter — must be provided for live lookup */
  searchPeople?: PeopleSearchFn;
  /** Single-select (default) or multi-select */
  mode?: 'single' | 'multi';
  /** Placeholder text for search input */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Disable the entire picker */
  disabled?: boolean;
  /** Validation error message */
  validationMessage?: string;
  /** Additional CSS class */
  className?: string;
  /**
   * When true, the picker hides the outer Field/label wrapper and
   * renders only the input area + dropdown. Useful when the consumer
   * provides its own label and layout (e.g. KudosComposer buckets).
   */
  bare?: boolean;
  /**
   * Photo retrieval adapter. When provided, the picker fetches avatars
   * for search results and selected chips through this separate path
   * (Graph /photo/$value or equivalent). The adapter returns a blob URL
   * when the photo exists and `undefined` for 404 ImageNotFound.
   * Throws on transient failures.
   */
  fetchPersonPhoto?: PersonPhotoFn;
}
