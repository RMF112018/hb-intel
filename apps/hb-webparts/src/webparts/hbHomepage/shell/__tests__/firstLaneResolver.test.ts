import { describe, expect, it } from 'vitest';
import { DEFAULT_PRESET } from '../defaultPreset.js';
import { SHELL_ENTRY_STATES } from '../breakpointPolicy.js';
import { resolveFirstLaneBand, toFirstLaneDecisionDataAttributes } from '../firstLaneResolver.js';
import type { OccupantId, ShellEntryState } from '../shellTypes.js';
import type {
  OccupantContentStateKind,
  OccupantContentStateMap,
  OccupantContentStateReport,
} from '../occupantContentState.js';

const STANDARD_LAPTOP = SHELL_ENTRY_STATES.find((s) => s.id === 'standard-laptop') as ShellEntryState;

function buildReports(
  entries: Partial<Record<OccupantId, OccupantContentStateKind>>,
): OccupantContentStateMap {
  const map = new Map<OccupantId, OccupantContentStateReport>();
  for (const [id, kind] of Object.entries(entries) as [OccupantId, OccupantContentStateKind][]) {
    map.set(id, { occupantId: id, kind, reportedAt: 1 });
  }
  return map;
}

const FIRST_BAND = DEFAULT_PRESET.bands[0];

describe('firstLaneResolver', () => {
  it('promotes a strong external candidate into a weak/vacant secondary slot', () => {
    const result = resolveFirstLaneBand({
      band: {
        ...FIRST_BAND,
        semanticRole: 'communications-newsroom',
        slots: [
          { ...FIRST_BAND.slots[0], occupantId: 'company-pulse' },
          { ...FIRST_BAND.slots[1], occupantId: null, role: 'secondary' },
        ],
      },
      reports: buildReports({
        'company-pulse': 'strong',
        'leadership-message': 'strong',
      }),
      entryState: STANDARD_LAPTOP,
    });
    expect(result.decision.action).toBe('promoted');
    expect(result.band.slots[1].occupantId).toBe('leadership-message');
  });

  it('swaps strong secondary into weak primary using deterministic ranking', () => {
    const result = resolveFirstLaneBand({
      band: {
        ...FIRST_BAND,
        semanticRole: 'communications-newsroom',
        slots: [
          { ...FIRST_BAND.slots[0], occupantId: 'leadership-message', role: 'primary' },
          { ...FIRST_BAND.slots[1], occupantId: 'company-pulse', role: 'secondary' },
        ],
      },
      reports: buildReports({
        'leadership-message': 'empty',
        'company-pulse': 'strong',
      }),
      entryState: STANDARD_LAPTOP,
    });
    expect(result.decision.action).toBe('swapped');
    expect(result.band.slots[0].occupantId).toBe('company-pulse');
    expect(result.band.slots[1].occupantId).toBe('leadership-message');
  });

  it('retains the preset when both first-lane occupants are strong', () => {
    const result = resolveFirstLaneBand({
      band: FIRST_BAND,
      reports: buildReports({
        'project-portfolio-spotlight': 'strong',
        'company-pulse': 'strong',
      }),
      entryState: STANDARD_LAPTOP,
    });
    expect(result.decision.action).toBe('retained');
    expect(result.band.slots.map((s) => s.occupantId)).toEqual([
      'project-portfolio-spotlight',
      'company-pulse',
    ]);
  });

  it('reduces to single when the secondary is empty and no legal replacement exists', () => {
    // company-pulse (secondary) reports empty. Only project-portfolio-spotlight
    // and safety-field-excellence are allowedBandSemantics=operational-spotlight,
    // and safety-field-excellence is not firstLaneEligible — so no replacement
    // is legal. The resolver nulls the secondary slot.
    const result = resolveFirstLaneBand({
      band: FIRST_BAND,
      reports: buildReports({
        'project-portfolio-spotlight': 'strong',
        'company-pulse': 'empty',
      }),
      entryState: STANDARD_LAPTOP,
    });
    expect(result.decision.action).toBe('reduced-to-single');
    expect(result.band.slots[0].occupantId).toBe('project-portfolio-spotlight');
    expect(result.band.slots[1].occupantId).toBeNull();
    expect(result.decision.slotDecisions[0].from).toBe('company-pulse');
    expect(result.decision.slotDecisions[0].to).toBeNull();
  });

  it('retains when primary is weak but reorderDomain is locked and no swap/replacement is legal', () => {
    // project-portfolio-spotlight (primary) is reorderDomain:'locked'. When it
    // reports empty and company-pulse (secondary) is strong, the resolver may
    // consider swapping — but company-pulse allowedBandSemantics includes
    // operational-spotlight AND primary role, so a swap is legal. However
    // the primary is locked and cannot move, so the swap path is rejected.
    // No external strong candidate can replace the primary in this band,
    // therefore the band is retained with a diagnostic.
    const result = resolveFirstLaneBand({
      band: FIRST_BAND,
      reports: buildReports({
        'project-portfolio-spotlight': 'empty',
        'company-pulse': 'strong',
      }),
      entryState: STANDARD_LAPTOP,
    });
    expect(result.decision.action).toBe('retained');
    // Protected: locked primary never moves.
    expect(result.band.slots[0].occupantId).toBe('project-portfolio-spotlight');
    expect(result.band.slots[1].occupantId).toBe('company-pulse');
    const slotDecision = result.decision.slotDecisions.find((d) => d.slotId === FIRST_BAND.slots[0].id);
    expect(slotDecision?.reason).toBe('primary-locked');
  });

  it('preserves locked primary and nulls weak secondary when both weak', () => {
    const result = resolveFirstLaneBand({
      band: FIRST_BAND,
      reports: buildReports({
        'project-portfolio-spotlight': 'empty',
        'company-pulse': 'empty',
      }),
      entryState: STANDARD_LAPTOP,
    });
    expect(result.decision.action).toBe('reduced-to-single');
    expect(result.band.slots[0].occupantId).toBe('project-portfolio-spotlight');
    expect(result.band.slots[1].occupantId).toBeNull();
  });

  it('does not reshuffle on loading or unknown reports', () => {
    const loading = resolveFirstLaneBand({
      band: FIRST_BAND,
      reports: buildReports({
        'project-portfolio-spotlight': 'loading',
        'company-pulse': 'loading',
      }),
      entryState: STANDARD_LAPTOP,
    });
    expect(loading.decision.action).toBe('retained');
    expect(loading.band.slots.map((s) => s.occupantId)).toEqual([
      'project-portfolio-spotlight',
      'company-pulse',
    ]);

    const unknown = resolveFirstLaneBand({
      band: FIRST_BAND,
      reports: new Map(),
      entryState: STANDARD_LAPTOP,
    });
    expect(unknown.decision.action).toBe('retained');
  });

  it('never promotes a non-first-lane-eligible or semantically incompatible occupant', () => {
    // leadership-message is first-lane eligible but its allowedBandSemantics
    // are communications-editorial/communications-newsroom — NOT
    // operational-spotlight. The resolver must never promote it into this
    // band even when the primary is empty.
    const result = resolveFirstLaneBand({
      band: FIRST_BAND,
      reports: buildReports({
        'project-portfolio-spotlight': 'empty',
        'company-pulse': 'empty',
        'leadership-message': 'strong',
        'safety-field-excellence': 'strong', // not first-lane-eligible
      }),
      entryState: STANDARD_LAPTOP,
    });
    const occupantIds = result.band.slots.map((s) => s.occupantId);
    expect(occupantIds).not.toContain('leadership-message');
    expect(occupantIds).not.toContain('safety-field-excellence');
  });

  it('demotes weak primary but preserves secondary to avoid fully empty first lane', () => {
    const result = resolveFirstLaneBand({
      band: {
        ...FIRST_BAND,
        semanticRole: 'recognition',
        slots: [
          { ...FIRST_BAND.slots[0], occupantId: 'company-pulse', role: 'primary' },
          { ...FIRST_BAND.slots[1], occupantId: 'leadership-message', role: 'secondary' },
        ],
      },
      reports: buildReports({
        'company-pulse': 'empty',
        'leadership-message': 'empty',
        'project-portfolio-spotlight': 'empty',
      }),
      entryState: STANDARD_LAPTOP,
    });
    expect(result.decision.action).toBe('demoted-primary');
    expect(result.band.slots[0].occupantId).toBeNull();
    expect(result.band.slots[1].occupantId).toBe('leadership-message');
  });

  it('emits inspectable data attributes from the decision', () => {
    const result = resolveFirstLaneBand({
      band: FIRST_BAND,
      reports: buildReports({
        'project-portfolio-spotlight': 'strong',
        'company-pulse': 'empty',
      }),
      entryState: STANDARD_LAPTOP,
    });
    const attrs = toFirstLaneDecisionDataAttributes(result.decision);
    expect(attrs['data-shell-first-lane-action']).toBe('reduced-to-single');
    expect(attrs['data-shell-first-lane-replacements']).toBe(1);
    expect(attrs['data-shell-first-lane-candidates-considered']).toBeGreaterThanOrEqual(0);
    expect(typeof attrs['data-shell-first-lane-reason']).toBe('string');
  });
});
