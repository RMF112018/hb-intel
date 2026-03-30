/**
 * HbcPeoplePicker — Governed people selection primitive
 * Graph live lookup as sanctioned identity source.
 */
import type * as React from 'react';

// ── Person data ──────────────────────────────────────────────────────────

export interface PersonEntry {
  /** User principal name (email format) — primary key */
  upn: string;
  /** Display name from directory */
  displayName: string;
  /** Job title from directory */
  jobTitle?: string;
  /** Department from directory */
  department?: string;
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
}
