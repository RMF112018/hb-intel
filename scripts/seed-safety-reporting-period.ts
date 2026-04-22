import {
  ManagedIdentityTokenService,
  type IManagedIdentityTokenService,
} from '../backend/functions/src/services/managed-identity-token-service.js';
import { SharePointService } from '../backend/functions/src/services/sharepoint-service.js';

export function resolveSeedTokenService(
  env: NodeJS.ProcessEnv = process.env,
): IManagedIdentityTokenService {
  const overrideToken = env.SHAREPOINT_BEARER_TOKEN?.trim();
  if (!overrideToken) {
    return new ManagedIdentityTokenService();
  }

  return {
    async getSharePointToken(): Promise<string> {
      return overrideToken;
    },
    async acquireAppToken(): Promise<string> {
      return overrideToken;
    },
  };
}

async function main(): Promise<void> {
  const service = new SharePointService(resolveSeedTokenService());
  const result = await withTimeout(
    service.ensureCurrentWeekSafetyReportingPeriod(),
    90_000,
    'ensureCurrentWeekSafetyReportingPeriod',
  );
  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    process.exitCode = 1;
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timed out after ${timeoutMs}ms: ${label}`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]);
}

if (!process.env.VITEST) {
  const keepAlive = setInterval(() => {}, 250);
  main()
    .catch((err) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error(
        JSON.stringify(
          {
            success: false,
            outcome: 'failed',
            message,
          },
          null,
          2,
        ),
      );
      process.exit(1);
    })
    .finally(() => {
      clearInterval(keepAlive);
    });
}
