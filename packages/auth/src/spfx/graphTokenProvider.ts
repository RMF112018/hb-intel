/**
 * SPFx Graph token provider — creates an async function that returns
 * a Microsoft Graph-scoped Bearer token from the SPFx context.
 *
 * Usage:
 *   import { createSpfxGraphTokenProvider, getSpfxContext } from '@hbc/auth/spfx';
 *   const getGraphToken = createSpfxGraphTokenProvider(getSpfxContext());
 *   <HbcPeoplePicker searchPeople={useGraphPeopleSearch(getGraphToken)} />
 *
 * Requires the SPFx app to have User.Read.All (or People.Read) API permission
 * approved in the SharePoint admin center.
 */
import type { WebPartContext } from '@microsoft/sp-webpart-base';

const GRAPH_RESOURCE = 'https://graph.microsoft.com';

/**
 * Creates a stable async function that acquires a Graph-scoped access token
 * from the SPFx AadTokenProvider factory.
 *
 * @param context - SPFx WebPartContext (available after bootstrapSpfxAuth)
 * @returns Async function returning Bearer token string, or undefined if context is null
 */
export function createSpfxGraphTokenProvider(
  context: WebPartContext | null,
): (() => Promise<string>) | undefined {
  if (!context) return undefined;

  return async (): Promise<string> => {
    const tokenProvider = await context.aadTokenProviderFactory.getTokenProvider();
    return tokenProvider.getToken(GRAPH_RESOURCE);
  };
}
