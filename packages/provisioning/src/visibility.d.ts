import type { NormalizedAuthSession as IAuthSession } from '@hbc/auth';
/**
 * D-PH6-09 role-based provisioning visibility resolver.
 * Traceability: docs/architecture/plans/PH6.9-Provisioning-Package.md §6.9.4
 */
export declare function getProvisioningVisibility(session: IAuthSession | null, submittedBy: string): 'full' | 'notification' | 'none';
//# sourceMappingURL=visibility.d.ts.map