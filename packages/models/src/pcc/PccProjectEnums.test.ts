import { describe, it, expect, expectTypeOf } from 'vitest';
import {
  PCC_PROJECT_STAGES,
  PCC_PROJECT_STATUSES,
  PCC_PROJECT_TYPES,
  type PccProjectStage,
  type PccProjectStatus,
  type PccProjectType,
} from './PccProjectEnums.js';

describe('PCC project enums match contract', () => {
  it('PccProjectStage has the six contract-frozen values in order', () => {
    expect([...PCC_PROJECT_STAGES]).toEqual([
      'lead',
      'estimating',
      'preconstruction',
      'active_construction',
      'closeout',
      'warranty',
    ]);
  });

  it('PccProjectStatus has the four contract values in order', () => {
    expect([...PCC_PROJECT_STATUSES]).toEqual(['Active', 'On Hold', 'Closed', 'Archived']);
  });

  it('PccProjectType has the five contract-frozen values in order', () => {
    expect([...PCC_PROJECT_TYPES]).toEqual([
      'commercial',
      'multifamily',
      'municipal',
      'luxury_residential',
      'environmental',
    ]);
  });

  it('union types stay in sync with frozen value arrays', () => {
    expectTypeOf<PccProjectStage>().toEqualTypeOf<(typeof PCC_PROJECT_STAGES)[number]>();
    expectTypeOf<PccProjectStatus>().toEqualTypeOf<(typeof PCC_PROJECT_STATUSES)[number]>();
    expectTypeOf<PccProjectType>().toEqualTypeOf<(typeof PCC_PROJECT_TYPES)[number]>();
  });
});
