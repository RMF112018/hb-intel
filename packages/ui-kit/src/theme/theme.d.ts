/**
 * HB Intel Design System — Light, Field Mode & Dark themes (V2.1)
 * Blueprint §1d — Fluent v9 theme with HBC semantic overrides
 * PH4.3 §3.1 — Warm off-white surfaces, sunlight-optimized Field Mode
 */
import { type Theme } from '@fluentui/react-components';
import { type HbcSemanticTokens } from './tokens.js';
/** Extended HBC theme type — Fluent Theme + HBC semantic tokens */
export type HbcTheme = Theme & HbcSemanticTokens;
/** HB Intel light theme — primary theme for the platform (V2.1 warm off-white) */
export declare const hbcLightTheme: HbcTheme;
/** HB Intel Field Mode theme — high-contrast dark for jobsite/sunlight use (V2.1) */
export declare const hbcFieldTheme: HbcTheme;
/** @deprecated Use hbcFieldTheme — kept as alias for backward compatibility */
export declare const hbcDarkTheme: HbcTheme;
//# sourceMappingURL=theme.d.ts.map