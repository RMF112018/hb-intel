/**
 * SPFx API token provider — creates an async function that returns
 * a Bearer token scoped to a custom API audience (e.g. the Project Setup
 * Azure Function App) from the SPFx AadTokenProvider factory.
 *
 * Each invocation acquires a fresh token; the SPFx token provider handles
 * caching and silent renewal internally.
 *
 * Usage:
 *   import { createSpfxApiTokenProvider, getSpfxContext } from '@hbc/auth/spfx';
 *   const getApiToken = createSpfxApiTokenProvider(getSpfxContext(), 'api://my-client-id');
 *   const token = await getApiToken?.();
 *
 * Requires the SPFx app to have the target API permission approved
 * in the SharePoint admin center.
 *
 * P3-02: Deliberate API-scoped token acquisition replacing opaque session
 * token injection for the Project Setup production auth path.
 */
import type { WebPartContext } from '@microsoft/sp-webpart-base';

/**
 * Creates a stable async function that acquires a token scoped to the given
 * API audience from the SPFx AadTokenProvider factory.
 *
 * @param context  - SPFx WebPartContext (available after bootstrapSpfxAuth)
 * @param audience - The API audience URI (e.g. `api://<client-id>`)
 * @returns Async function returning Bearer token string, or undefined if context is null
 */
export function createSpfxApiTokenProvider(
  context: WebPartContext | null,
  audience: string,
): (() => Promise<string>) | undefined {
  if (!context || !audience) return undefined;

  return async (): Promise<string> => {
    const tokenProvider = await context.aadTokenProviderFactory.getTokenProvider();
    return tokenProvider.getToken(audience);
  };
}
