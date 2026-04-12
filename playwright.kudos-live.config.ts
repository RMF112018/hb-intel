/**
 * HB Kudos live-SharePoint integration lane (phase-16a/06).
 *
 * Opt-in, environment-gated. This config does NOT start a local web
 * server and does NOT point at the dev harness. It issues real REST
 * requests against a dedicated SharePoint dev/staging site via a
 * cookie-authenticated storage state.
 *
 * **Never point this at a production list.**
 *
 * Required env vars (all must be set or the suite self-skips):
 *   HB_KUDOS_LIVE_SITE_URL        e.g. https://<tenant>.sharepoint.com/sites/HBCentralDev
 *   HB_KUDOS_LIVE_KUDOS_LIST_ID   GUID of the non-production People Culture Kudos test list
 *   HB_KUDOS_LIVE_AUDIT_LIST_ID   GUID of the non-production Kudos Audit Events test list
 *   HB_KUDOS_LIVE_TEST_USER_EMAIL email of a known safe test user (ensureUser target)
 *   HB_KUDOS_LIVE_STORAGE_STATE   path to a Playwright storageState JSON with SP auth cookies
 *
 * Optional:
 *   HB_KUDOS_LIVE_SEARCH_QUERY    safe people-search query (defaults to a single first-name prefix)
 *   HB_KUDOS_LIVE_KEEP_SEEDS      "true" to skip the post-test delete step (diagnostics)
 *
 * See e2e/live-sharepoint/README.md for setup instructions.
 */
import { defineConfig } from '@playwright/test';

const storageState = process.env.HB_KUDOS_LIVE_STORAGE_STATE;

export default defineConfig({
  testDir: './e2e/live-sharepoint',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  // No webServer — this lane hits real SharePoint.
  use: {
    storageState: storageState && storageState.length > 0 ? storageState : undefined,
    trace: 'retain-on-failure',
  },
});
