import { describe, it } from 'vitest';

/**
 * Prompt 01 (single primary-page command surface) retired the focused-Adobe
 * route. The Connect CTA previously lived inside
 * `AdobeSignConnectionGuidanceCard`, reached only via the launcher → menu →
 * focused-module path that no longer exists. The shell's `onConnectAdobeSign`
 * callback (the OAuth start handler) is unreachable from the live shell until
 * Prompt 03 surfaces the Connect CTA on the consolidated Adobe Sign module
 * card.
 *
 * The two previous tests are preserved here as `it.todo` so Prompt 03 must
 * re-wire and re-cover the OAuth start path. The callback banner — the OAuth
 * *return* side, which is URL-driven and route-agnostic — continues to be
 * covered by `AdobeSignCallbackBanner.test.tsx` and is unaffected.
 */
describe('MyWorkShell — Adobe Sign OAuth end-to-end handler', () => {
  it.todo(
    'Prompt 03: POSTs to /api/my-work/me/adobe-sign/oauth/start with bearer + returnPath, then navigates to authorizationUrl (consolidated Adobe card Connect CTA)',
  );

  it.todo(
    'Prompt 03: omits the Connect CTA on the consolidated Adobe card when getApiToken is not provided (legacy fixture posture)',
  );
});
