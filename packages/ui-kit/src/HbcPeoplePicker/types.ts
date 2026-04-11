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
}
