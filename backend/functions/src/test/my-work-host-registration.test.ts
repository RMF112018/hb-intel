import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * My Dashboard / My Work host route-registration regression guard.
 *
 * Azure Functions v4 registers routes via import side effects. The My Work
 * read-model and Adobe Sign delegated OAuth route modules existed in source
 * but were never imported by the monolithic Function App entry point, so the
 * deployed host returned 404 for the My Dashboard backend routes.
 *
 * This guard reads the entry point directly and fails if either host module
 * import statement is removed, so a route module cannot exist in source while
 * remaining absent from the executable host.
 */

const FUNCTIONS_SRC = resolve(import.meta.dirname, '..');

describe('My Dashboard / My Work host route registration', () => {
  const monoIndex = readFileSync(resolve(FUNCTIONS_SRC, 'index.ts'), 'utf-8');

  it('imports the My Work protected read-model route module', () => {
    expect(
      monoIndex,
      "index.ts must import './hosts/my-work-read-model/my-work-read-model-routes.js'",
    ).toMatch(
      /import\s+['"]\.\/hosts\/my-work-read-model\/my-work-read-model-routes\.js['"];?/,
    );
  });

  it('imports the Adobe Sign delegated OAuth route module', () => {
    expect(
      monoIndex,
      "index.ts must import './hosts/my-work-read-model/adobe-sign-oauth-routes.js'",
    ).toMatch(
      /import\s+['"]\.\/hosts\/my-work-read-model\/adobe-sign-oauth-routes\.js['"];?/,
    );
  });

  it('imports the Adobe Sign action-link resolver route module', () => {
    expect(
      monoIndex,
      "index.ts must import './hosts/my-work-read-model/adobe-sign-action-link-routes.js'",
    ).toMatch(
      /import\s+['"]\.\/hosts\/my-work-read-model\/adobe-sign-action-link-routes\.js['"];?/,
    );
  });
});
