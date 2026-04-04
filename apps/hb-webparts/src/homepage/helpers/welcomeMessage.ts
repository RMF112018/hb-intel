import { resolveFirstName, type HomepageIdentityInput } from './identity.js';
import { resolveGreetingAt } from './greeting.js';

export interface WelcomeMessage {
  firstName: string;
  greeting: string;
  headline: string;
}

export function resolveWelcomeMessage(identity: HomepageIdentityInput, now: Date): WelcomeMessage {
  const greeting = resolveGreetingAt(now);
  const firstName = resolveFirstName(identity);
  return {
    greeting,
    firstName,
    headline: `${greeting}, ${firstName}.`,
  };
}
