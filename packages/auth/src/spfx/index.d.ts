import type { ISpfxPageContext, SpfxHostContainerMetadata, SpfxHostSignalState, SpfxIdentityBridgeInput } from '../types.js';
/**
 * Approved SPFx host integration seam for Phase 5.14.
 *
 * Boundary rule:
 * - Allowed: host container metadata + identity context + narrow host signals.
 * - Disallowed: shell composition controls (mode/sidebar/layout) from SPFx.
 */
export interface SpfxHostBridgeInput {
    pageContext: ISpfxPageContext;
    hostContainer: SpfxHostContainerMetadata;
    hostContextRef: string;
    hostSignals?: SpfxHostSignalState;
}
/**
 * Validate strict SPFx host-bridge input before auth-store bootstrap.
 */
export declare function assertValidSpfxHostBridgeInput(input: SpfxHostBridgeInput): void;
/**
 * Build normalized identity bridge payload from approved SPFx host input.
 */
export declare function toSpfxIdentityBridgeInput(input: SpfxHostBridgeInput): SpfxIdentityBridgeInput;
/**
 * Bootstrap authentication from SPFx page context.
 * Call once before React renders in SPFx webpart entry point.
 */
export declare function bootstrapSpfxAuth(input: ISpfxPageContext | SpfxHostBridgeInput): void;
//# sourceMappingURL=index.d.ts.map