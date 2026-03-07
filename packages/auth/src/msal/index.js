/**
 * Map an MSAL-like account object to ICurrentUser.
 * Used by the PWA's msal-init.ts after successful authentication.
 */
export function mapMsalAccountToUser(account) {
    return {
        id: account.localAccountId,
        displayName: account.name ?? account.username,
        email: account.username,
        roles: [
            {
                id: 'role-default',
                name: 'User',
                permissions: ['project:read', 'document:read'],
            },
        ],
    };
}
/**
 * Validate MSAL configuration. Throws if required fields are missing.
 */
export function validateMsalConfig(config) {
    if (!config.clientId)
        throw new Error('MSAL clientId is required');
    if (!config.authority)
        throw new Error('MSAL authority is required');
    if (!config.redirectUri)
        throw new Error('MSAL redirectUri is required');
}
//# sourceMappingURL=index.js.map