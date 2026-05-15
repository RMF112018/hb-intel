/**
 * My Dashboard page-header greeting helper.
 *
 * Pure, deterministic, My-Dashboard-local. Mirrors the behavior of the HB
 * Signature Hero helpers in `apps/hb-webparts/src/homepage/helpers/` (greeting
 * boundaries, first-name fallback order, headline composition) without
 * importing across app boundaries. The signature hero remains the
 * cross-tenant canonical implementation; this helper is scoped to the
 * application-owned compact header in `MyWorkHeroBand`.
 */

export type MyWorkPageHeaderGreeting = 'Good morning' | 'Good afternoon' | 'Good evening';

export interface MyWorkPageHeaderIdentityInput {
  readonly preferredName?: string;
  readonly displayName?: string;
  readonly email?: string;
}

export interface MyWorkPageHeaderWelcomeMessage {
  readonly greeting: MyWorkPageHeaderGreeting;
  readonly firstName: string;
  readonly headline: string;
}

const MORNING_START = 3 * 60; // 03:00 → 180
const AFTERNOON_START = 12 * 60; // 12:00 → 720
const EVENING_START = 17 * 60 + 1; // 17:01 → 1021

export function resolveMyWorkPageHeaderGreetingForTime(
  hour24: number,
  minute: number,
): MyWorkPageHeaderGreeting {
  const totalMinutes = hour24 * 60 + minute;
  if (totalMinutes >= MORNING_START && totalMinutes < AFTERNOON_START) {
    return 'Good morning';
  }
  if (totalMinutes >= AFTERNOON_START && totalMinutes < EVENING_START) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

export function resolveMyWorkPageHeaderGreetingAt(now: Date): MyWorkPageHeaderGreeting {
  return resolveMyWorkPageHeaderGreetingForTime(now.getHours(), now.getMinutes());
}

function firstToken(value: string): string {
  return value.trim().split(/\s+/)[0] ?? '';
}

export function resolveMyWorkPageHeaderFirstName(identity: MyWorkPageHeaderIdentityInput): string {
  if (identity.preferredName?.trim()) {
    return firstToken(identity.preferredName);
  }
  if (identity.displayName?.trim()) {
    return firstToken(identity.displayName);
  }
  if (identity.email?.trim()) {
    const localPart = identity.email.split('@')[0] ?? '';
    const normalized = localPart.replace(/[._-]+/g, ' ').trim();
    if (normalized) {
      return firstToken(normalized);
    }
  }
  return 'there';
}

export function resolveMyWorkPageHeaderWelcomeMessage(
  identity: MyWorkPageHeaderIdentityInput,
  now: Date,
): MyWorkPageHeaderWelcomeMessage {
  const greeting = resolveMyWorkPageHeaderGreetingAt(now);
  const firstName = resolveMyWorkPageHeaderFirstName(identity);
  return {
    greeting,
    firstName,
    headline: `${greeting}, ${firstName}.`,
  };
}
