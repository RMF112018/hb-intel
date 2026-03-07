/**
 * MSAL initialization helpers — Blueprint §2b.
 * Shared utilities that apps/pwa/src/auth/msal-init.ts delegates to.
 * Keeps @hbc/auth as the single auth abstraction layer.
 */
import type { ICurrentUser } from '@hbc/models';
import type { IMsalConfig } from '../adapters/index.js';
/**
 * Map an MSAL-like account object to ICurrentUser.
 * Used by the PWA's msal-init.ts after successful authentication.
 */
export declare function mapMsalAccountToUser(account: {
    localAccountId: string;
    name?: string;
    username: string;
}): ICurrentUser;
/**
 * Validate MSAL configuration. Throws if required fields are missing.
 */
export declare function validateMsalConfig(config: IMsalConfig): void;
//# sourceMappingURL=index.d.ts.map