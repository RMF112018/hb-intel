export interface HomepageIdentityInput {
  preferredName?: string;
  displayName?: string;
  email?: string;
}

function firstToken(value: string): string {
  return value.trim().split(/\s+/)[0] ?? '';
}

export function resolveFirstName(identity: HomepageIdentityInput): string {
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
