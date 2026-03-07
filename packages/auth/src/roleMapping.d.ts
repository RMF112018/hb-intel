import type { AdapterIdentityPayload } from './types.js';
import type { RoleMappingInput, RoleMappingOptions } from './types.js';
/**
 * Convert provider/context identity into HB Intel app roles.
 *
 * Core rule (locked Option C): provider semantics are translated here once and
 * only the resulting app roles are consumed by feature code.
 *
 * Alignment notes:
 * - D-04: deterministic, route-safe role evaluation input.
 * - D-07: explicit role output supports deterministic guarded action checks.
 * - D-10: centralized mapping boundary prevents direct provider coupling.
 * - D-12: keeps shell/overlay rendering policy independent from provider shape.
 */
export declare function mapIdentityToAppRoles(identity: AdapterIdentityPayload, options?: RoleMappingOptions): string[];
/**
 * Convert adapter identity into the canonical role-mapping input contract.
 */
export declare function toRoleMappingInput(identity: AdapterIdentityPayload): RoleMappingInput;
//# sourceMappingURL=roleMapping.d.ts.map