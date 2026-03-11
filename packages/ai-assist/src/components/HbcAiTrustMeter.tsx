/**
 * HbcAiTrustMeter — D-SF15-T01 scaffold
 *
 * Progressive confidence and rationale disclosure component
 * for Essential/Standard/Expert trust tiers.
 * Full implementation in SF15-T06.
 */
import type { FC } from 'react';

import type { AiTrustLevel } from '../types/index.js';

/** Props for the Trust Meter component. */
export interface HbcAiTrustMeterProps {
  readonly trustLevel: AiTrustLevel;
  readonly confidence: number;
}

/** Scaffold placeholder — full implementation in SF15-T06. */
export const HbcAiTrustMeter: FC<HbcAiTrustMeterProps> = () => null;

HbcAiTrustMeter.displayName = 'HbcAiTrustMeter';
