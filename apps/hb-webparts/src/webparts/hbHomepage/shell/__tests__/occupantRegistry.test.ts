import { describe, it, expect } from 'vitest';
import {
  OCCUPANT_REGISTRY,
  getOccupant,
  getActiveOccupants,
  getFirstLaneEligibleOccupants,
  isOccupantAllowedInSlot,
  areOccupantsPairableInBand,
  canOccupantPairAtWidth,
} from '../occupantRegistry.js';

describe('OCCUPANT_REGISTRY', () => {
  it('contains all six known occupants', () => {
    expect(OCCUPANT_REGISTRY.size).toBe(6);
  });

  it('has five active occupants', () => {
    expect(getActiveOccupants()).toHaveLength(5);
  });

  it('has safety-field-excellence as inactive-candidate', () => {
    const sfe = getOccupant('safety-field-excellence');
    expect(sfe).toBeDefined();
    expect(sfe!.status).toBe('inactive-candidate');
  });
});

describe('capability metadata', () => {
  it('people-culture-public has anchor prominence ceiling', () => {
    const pc = getOccupant('people-culture-public')!;
    expect(pc.prominenceCeiling).toBe('anchor');
  });

  it('hb-kudos has contextual prominence ceiling', () => {
    const kudos = getOccupant('hb-kudos')!;
    expect(kudos.prominenceCeiling).toBe('contextual');
  });

  it('project-portfolio-spotlight has supporting prominence ceiling', () => {
    const pps = getOccupant('project-portfolio-spotlight')!;
    expect(pps.prominenceCeiling).toBe('supporting');
  });

  it('people-culture-public is not first-lane eligible', () => {
    const pc = getOccupant('people-culture-public')!;
    expect(pc.firstLaneEligible).toBe(false);
  });

  it('company-pulse is first-lane eligible', () => {
    const cp = getOccupant('company-pulse')!;
    expect(cp.firstLaneEligible).toBe(true);
  });
});

describe('first-lane eligibility', () => {
  it('returns only first-lane eligible occupants', () => {
    const eligible = getFirstLaneEligibleOccupants();
    const ids = eligible.map((o) => o.id);
    expect(ids).toContain('company-pulse');
    expect(ids).toContain('leadership-message');
    expect(ids).not.toContain('hb-kudos');
    expect(ids).not.toContain('people-culture-public');
  });
});

describe('slot eligibility', () => {
  it('allows company-pulse in primary and secondary', () => {
    expect(isOccupantAllowedInSlot('company-pulse', 'primary')).toBe(true);
    expect(isOccupantAllowedInSlot('company-pulse', 'secondary')).toBe(true);
  });

  it('restricts people-culture-public to primary only', () => {
    expect(isOccupantAllowedInSlot('people-culture-public', 'primary')).toBe(true);
    expect(isOccupantAllowedInSlot('people-culture-public', 'secondary')).toBe(false);
    expect(isOccupantAllowedInSlot('people-culture-public', 'compact')).toBe(false);
  });
});

describe('pairing restrictions', () => {
  it('prohibits people-culture-public and hb-kudos pairing', () => {
    expect(areOccupantsPairableInBand('people-culture-public', 'hb-kudos')).toBe(false);
    expect(areOccupantsPairableInBand('hb-kudos', 'people-culture-public')).toBe(false);
  });

  it('allows company-pulse and leadership-message pairing', () => {
    expect(areOccupantsPairableInBand('company-pulse', 'leadership-message')).toBe(true);
  });
});

describe('narrowest stable paired width', () => {
  it('people-culture-public cannot pair below 640px', () => {
    expect(canOccupantPairAtWidth('people-culture-public', 600)).toBe(false);
    expect(canOccupantPairAtWidth('people-culture-public', 640)).toBe(true);
  });

  it('company-pulse can pair at 520px', () => {
    expect(canOccupantPairAtWidth('company-pulse', 520)).toBe(true);
    expect(canOccupantPairAtWidth('company-pulse', 500)).toBe(false);
  });
});
