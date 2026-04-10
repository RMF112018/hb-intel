/**
 * Token source for SharePoint REST calls. Lazy evaluation, dry-run safe.
 */
import { execSync } from 'node:child_process';

export function createTokenSource(opts: {
  siteUrl: string;
  explicitToken?: string;
}): () => Promise<string> {
  let cached: string | undefined;
  return async () => {
    if (cached) return cached;
    const fromArg = opts.explicitToken?.trim();
    if (fromArg) { cached = fromArg; return cached; }
    const fromEnv = process.env.SHAREPOINT_BEARER_TOKEN?.trim();
    if (fromEnv) { cached = fromEnv; return cached; }
    try {
      const origin = new URL(opts.siteUrl).origin;
      const out = execSync(
        `az account get-access-token --resource ${origin} --query accessToken -o tsv`,
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      );
      cached = out.trim();
      return cached;
    } catch (err) {
      throw new Error(
        `No SharePoint bearer token available. Provide via SHAREPOINT_BEARER_TOKEN env or --token. ` +
        `Underlying: ${(err as Error).message}`,
      );
    }
  };
}
