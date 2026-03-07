import type { ReactNode } from 'react';
import type { AdminAccessControlPageProps } from './types.js';
/**
 * Phase 5.11 minimal production admin UX surface.
 *
 * This component intentionally keeps rendering framework-agnostic so `@hbc/auth`
 * does not depend on shell/ui packages, preserving locked package boundaries.
 */
export declare function AdminAccessControlPage({ repository, initialSection, title, }: AdminAccessControlPageProps): ReactNode;
//# sourceMappingURL=AdminAccessControlPage.d.ts.map