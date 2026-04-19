// =============================================================================
// First-lane recomposition resolver (Wave-01 Prompt-05)
// -----------------------------------------------------------------------------
// Consumes the Prompt-04 content-state contract and produces a shell-governed
// revision of the first band's slot assignments. The resolver never widens
// the band vocabulary, never violates prohibited pairings, never overrides
// `firstLaneEligible`, and never changes a `reorderDomain: 'locked'`
// occupant's placement.
//
// Outcomes (inspectable as `data-shell-first-lane-action`):
//   - 'retained'            — preset honored; no legal improvement found
//   - 'promoted'            — an empty/invalid slot's occupant was replaced
//                             by a legal stronger candidate
//   - 'swapped'             — two slots' occupants were reordered to put the
//                             strong candidate in the primary slot
//   - 'reduced-to-single'   — an empty/invalid secondary was nulled because
//                             no legal replacement existed
//   - 'demoted-primary'     — the primary was empty/invalid, no replacement
//                             could be promoted, and its slot was nulled
//                             (occupant is not `reorderDomain: 'locked'`)
//
// The resolver is a pure function of:
//   - the preset's first band
//   - the current content-state report map
//   - the active entry state
// It does not reach into the registry to mutate it, and it does not know
// about module internals. Later visibility/persistence work (e.g. a control
// panel) may revisit these decisions; today the resolver runs at render.
// =============================================================================

import {
  OCCUPANT_REGISTRY,
  areOccupantsPairableInBand,
  getOccupant,
} from './occupantRegistry.js';
import type {
  OccupantId,
  ShellBand,
  ShellEntryState,
  ShellSlot,
  SlotRole,
} from './shellTypes.js';
import type {
  OccupantContentStateKind,
  OccupantContentStateMap,
  OccupantContentStateReport,
} from './occupantContentState.js';

const STRENGTH: Record<OccupantContentStateKind, number> = {
  strong: 3,
  'low-signal': 2,
  loading: 1,
  unknown: 1,
  empty: 0,
  invalid: -1,
};

/** Strength threshold below which a slot is considered "weak" and a candidate
 *  for demotion/promotion. Loading/unknown deliberately do not trigger reshuffling. */
const WEAK_THRESHOLD = 0;
type CandidateRejectionReason =
  | 'excluded-current-band'
  | 'inactive'
  | 'not-first-lane-eligible'
  | 'slot-role-incompatible'
  | 'semantic-role-incompatible'
  | 'paired-fit-ineligible'
  | 'pairing-prohibited'
  | 'report-not-strong'
  | 'promoted';

export type FirstLaneAction =
  | 'retained'
  | 'promoted'
  | 'swapped'
  | 'reduced-to-single'
  | 'demoted-primary';

export interface FirstLaneSlotDecision {
  readonly slotId: string;
  readonly from: OccupantId | null;
  readonly to: OccupantId | null;
  readonly reason: string;
  readonly reportKind: OccupantContentStateKind;
}

export interface FirstLaneDecision {
  readonly action: FirstLaneAction;
  readonly reason: string;
  readonly slotDecisions: readonly FirstLaneSlotDecision[];
  readonly candidateEvaluations?: readonly {
    occupantId: OccupantId;
    rank: number;
    accepted: boolean;
    reason: CandidateRejectionReason;
  }[];
}

export interface FirstLaneResolverInput {
  readonly band: ShellBand;
  readonly reports: OccupantContentStateMap;
  readonly entryState: ShellEntryState;
}

export interface FirstLaneResolverResult {
  readonly band: ShellBand;
  readonly decision: FirstLaneDecision;
}

function reportFor(
  reports: OccupantContentStateMap,
  occupantId: OccupantId | null,
): OccupantContentStateReport | undefined {
  if (!occupantId) return undefined;
  return reports.get(occupantId);
}

function kindFor(report: OccupantContentStateReport | undefined): OccupantContentStateKind {
  return report?.kind ?? 'unknown';
}

function isWeak(kind: OccupantContentStateKind): boolean {
  return STRENGTH[kind] <= WEAK_THRESHOLD;
}

function isStrong(kind: OccupantContentStateKind): boolean {
  return kind === 'strong';
}

function candidateAllowedInSlot(
  candidateId: OccupantId,
  slotRole: SlotRole,
  bandSemanticRole: ShellBand['semanticRole'],
  entryState: ShellEntryState,
): boolean {
  const descriptor = getOccupant(candidateId);
  if (!descriptor) return false;
  if (descriptor.status !== 'active') return false;
  if (!descriptor.firstLaneEligible) return false;
  if (!descriptor.allowedSlotRoles.includes(slotRole)) return false;
  if (!descriptor.allowedBandSemantics.includes(bandSemanticRole)) return false;
  if (
    slotRole !== 'primary' &&
    entryState.firstLanePairingAllowed &&
    !descriptor.shellFit.pairedLayoutEligible
  ) {
    return false;
  }
  return true;
}

function candidateRejectionForSlot(
  descriptor: NonNullable<ReturnType<typeof getOccupant>>,
  slotRole: SlotRole,
  bandSemanticRole: ShellBand['semanticRole'],
  entryState: ShellEntryState,
): CandidateRejectionReason | undefined {
  if (descriptor.status !== 'active') return 'inactive';
  if (!descriptor.firstLaneEligible) return 'not-first-lane-eligible';
  if (!descriptor.allowedSlotRoles.includes(slotRole)) return 'slot-role-incompatible';
  if (!descriptor.allowedBandSemantics.includes(bandSemanticRole)) return 'semantic-role-incompatible';
  if (
    slotRole !== 'primary' &&
    entryState.firstLanePairingAllowed &&
    !descriptor.shellFit.pairedLayoutEligible
  ) {
    return 'paired-fit-ineligible';
  }
  return undefined;
}

function occupantPairableWithAll(
  candidateId: OccupantId,
  otherIds: readonly OccupantId[],
): boolean {
  for (const other of otherIds) {
    if (!areOccupantsPairableInBand(candidateId, other)) return false;
  }
  return true;
}

function findPromotableCandidate(
  slot: ShellSlot,
  bandSemanticRole: ShellBand['semanticRole'],
  reports: OccupantContentStateMap,
  excludedIds: readonly OccupantId[],
  otherRetainedIds: readonly OccupantId[],
  entryState: ShellEntryState,
): {
  winner: OccupantId | undefined;
  evaluations: Array<{
    occupantId: OccupantId;
    rank: number;
    accepted: boolean;
    reason: CandidateRejectionReason;
  }>;
} {
  const ordered = [...OCCUPANT_REGISTRY.values()].sort(
    (a, b) => a.firstLanePromotionRank - b.firstLanePromotionRank,
  );
  const evaluations: Array<{
    occupantId: OccupantId;
    rank: number;
    accepted: boolean;
    reason: CandidateRejectionReason;
  }> = [];

  for (const descriptor of ordered) {
    const id = descriptor.id;
    if (excludedIds.includes(id)) {
      evaluations.push({
        occupantId: id,
        rank: descriptor.firstLanePromotionRank,
        accepted: false,
        reason: 'excluded-current-band',
      });
      continue;
    }
    const rejection = candidateRejectionForSlot(
      descriptor,
      slot.role,
      bandSemanticRole,
      entryState,
    );
    if (rejection) {
      evaluations.push({
        occupantId: id,
        rank: descriptor.firstLanePromotionRank,
        accepted: false,
        reason: rejection,
      });
      continue;
    }
    if (!occupantPairableWithAll(id, otherRetainedIds)) {
      evaluations.push({
        occupantId: id,
        rank: descriptor.firstLanePromotionRank,
        accepted: false,
        reason: 'pairing-prohibited',
      });
      continue;
    }
    const kind = kindFor(reports.get(id));
    if (!isStrong(kind)) {
      evaluations.push({
        occupantId: id,
        rank: descriptor.firstLanePromotionRank,
        accepted: false,
        reason: 'report-not-strong',
      });
      continue;
    }
    evaluations.push({
      occupantId: id,
      rank: descriptor.firstLanePromotionRank,
      accepted: true,
      reason: 'promoted',
    });
    return { winner: id, evaluations };
  }

  return { winner: undefined, evaluations };
}

function isLocked(occupantId: OccupantId | null): boolean {
  if (!occupantId) return false;
  const descriptor = getOccupant(occupantId);
  return descriptor?.reorderDomain === 'locked';
}

/**
 * Run the first-lane recomposition resolver for a single band.
 *
 * The resolver returns a NEW band (structurally frozen) with any promotions,
 * demotions, or reductions applied, plus a decision record describing what
 * happened and why. Callers that want the preset untouched should pass the
 * preset's first band and splice the returned band back in at index 0.
 */
export function resolveFirstLaneBand(input: FirstLaneResolverInput): FirstLaneResolverResult {
  const { band, reports, entryState } = input;
  const candidateEvaluations: Array<{
    occupantId: OccupantId;
    rank: number;
    accepted: boolean;
    reason: CandidateRejectionReason;
  }> = [];

  const slots = band.slots;
  const activeOccupants = slots
    .map((s) => s.occupantId)
    .filter((id): id is OccupantId => id !== null);

  // Nothing to reason about — an unpopulated band is a preset-authoring concern,
  // not a content-state one.
  if (activeOccupants.length === 0) {
    return {
      band,
      decision: {
        action: 'retained',
        reason: 'no-active-occupants',
        slotDecisions: [],
        candidateEvaluations,
      },
    };
  }

  // Classify slots by weakness.
  const classifications = slots.map((slot) => {
    const report = reportFor(reports, slot.occupantId);
    const kind = kindFor(report);
    return { slot, kind, weak: slot.occupantId === null || isWeak(kind) };
  });

  const hasWeak = classifications.some((c) => c.weak);

  if (!hasWeak) {
    return {
      band,
      decision: {
        action: 'retained',
        reason: 'all-occupants-strong-or-neutral',
        slotDecisions: [],
        candidateEvaluations,
      },
    };
  }

  // Single-slot bands: simple demotion. If the occupant is weak and not locked,
  // null the slot; otherwise retain.
  if (slots.length === 1) {
    const only = classifications[0];
    if (only.slot.occupantId === null || !only.weak) {
      return {
        band,
        decision: {
          action: 'retained',
          reason: 'single-slot-not-weak',
          slotDecisions: [],
          candidateEvaluations,
        },
      };
    }
    if (isLocked(only.slot.occupantId)) {
      return {
        band,
        decision: {
          action: 'retained',
          reason: 'single-slot-weak-but-locked',
          slotDecisions: [
            {
              slotId: only.slot.id,
              from: only.slot.occupantId,
              to: only.slot.occupantId,
              reason: 'reorder-domain-locked',
              reportKind: only.kind,
            },
          ],
          candidateEvaluations,
        },
      };
    }
    return {
      band: {
        ...band,
        slots: [{ ...only.slot, occupantId: null }],
      },
      decision: {
        action: 'reduced-to-single',
        reason: 'single-weak-slot-nulled',
        slotDecisions: [
          {
            slotId: only.slot.id,
            from: only.slot.occupantId,
            to: null,
            reason: 'weak-no-replacement',
            reportKind: only.kind,
          },
        ],
        candidateEvaluations,
      },
    };
  }

  // Multi-slot bands. For now the resolver supports the two-slot first-lane
  // shape that the default preset uses; 3+ slot first bands are not a
  // present-repo concern and can be extended when a preset introduces them.
  if (slots.length !== 2) {
    return {
      band,
      decision: {
        action: 'retained',
        reason: 'unsupported-slot-count',
        slotDecisions: [],
        candidateEvaluations,
      },
    };
  }

  const [primary, secondary] = classifications;
  const slotDecisions: FirstLaneSlotDecision[] = [];

  const primaryOccupant = primary.slot.occupantId;
  const secondaryOccupant = secondary.slot.occupantId;

  const primaryWeak = primary.weak;
  const secondaryWeak = secondary.weak;

  // Case A: primary strong, secondary weak.
  if (!primaryWeak && secondaryWeak) {
    const replacementResult = findPromotableCandidate(
      secondary.slot,
      band.semanticRole,
      reports,
      (primaryOccupant ? [primaryOccupant, secondaryOccupant] : [secondaryOccupant]).filter(
        (id): id is OccupantId => id !== null,
      ),
      primaryOccupant ? [primaryOccupant] : [],
      entryState,
    );
    candidateEvaluations.push(...replacementResult.evaluations);
    if (replacementResult.winner) {
      slotDecisions.push({
        slotId: secondary.slot.id,
        from: secondaryOccupant,
        to: replacementResult.winner,
        reason: 'secondary-weak-replaced-with-strong',
        reportKind: secondary.kind,
      });
      return {
        band: {
          ...band,
          slots: [primary.slot, { ...secondary.slot, occupantId: replacementResult.winner }],
        },
        decision: {
          action: 'promoted',
          reason: 'strong-candidate-promoted-into-secondary',
          slotDecisions,
          candidateEvaluations,
        },
      };
    }
    slotDecisions.push({
      slotId: secondary.slot.id,
      from: secondaryOccupant,
      to: null,
      reason: 'secondary-weak-no-replacement',
      reportKind: secondary.kind,
    });
    return {
      band: {
        ...band,
        slots: [primary.slot, { ...secondary.slot, occupantId: null }],
      },
      decision: {
        action: 'reduced-to-single',
        reason: 'secondary-weak-nulled',
        slotDecisions,
        candidateEvaluations,
      },
    };
  }

  if (primaryOccupant === null && !secondaryWeak && secondaryOccupant) {
    slotDecisions.push(
      {
        slotId: primary.slot.id,
        from: null,
        to: secondaryOccupant,
        reason: 'vacant-primary-filled-from-strong-secondary',
        reportKind: primary.kind,
      },
      {
        slotId: secondary.slot.id,
        from: secondaryOccupant,
        to: null,
        reason: 'secondary-cleared-after-primary-fill',
        reportKind: secondary.kind,
      },
    );
    return {
      band: {
        ...band,
        slots: [
          { ...primary.slot, occupantId: secondaryOccupant },
          { ...secondary.slot, occupantId: null },
        ],
      },
      decision: {
        action: 'promoted',
        reason: 'vacant-primary-resolved-from-secondary',
        slotDecisions,
        candidateEvaluations,
      },
    };
  }

  // Case B: secondary strong, primary weak.
  if (primaryWeak && !secondaryWeak && primaryOccupant && secondaryOccupant) {
    // Prefer swapping the strong secondary into the primary slot when the
    // registry allows — this preserves both occupants and gives the strong
    // one top position.
    const secondaryFitsPrimary = candidateAllowedInSlot(
      secondaryOccupant,
      primary.slot.role,
      band.semanticRole,
      entryState,
    );
    const primaryCanDemote = !isLocked(primaryOccupant)
      && candidateAllowedInSlot(primaryOccupant, secondary.slot.role, band.semanticRole, entryState)
      && areOccupantsPairableInBand(primaryOccupant, secondaryOccupant);

    if (secondaryFitsPrimary && primaryCanDemote) {
      slotDecisions.push(
        {
          slotId: primary.slot.id,
          from: primaryOccupant,
          to: secondaryOccupant,
          reason: 'strong-promoted-into-primary',
          reportKind: primary.kind,
        },
        {
          slotId: secondary.slot.id,
          from: secondaryOccupant,
          to: primaryOccupant,
          reason: 'weak-demoted-to-secondary',
          reportKind: secondary.kind,
        },
      );
      return {
        band: {
          ...band,
          slots: [
            { ...primary.slot, occupantId: secondaryOccupant },
            { ...secondary.slot, occupantId: primaryOccupant },
          ],
        },
        decision: {
          action: 'swapped',
          reason: 'weak-primary-swapped-with-strong-secondary',
          slotDecisions,
        },
      };
    }

    // Try promoting a different strong candidate into the primary slot.
    const replacementResult = findPromotableCandidate(
      primary.slot,
      band.semanticRole,
      reports,
      [primaryOccupant, secondaryOccupant].filter((id): id is OccupantId => id !== null),
      [secondaryOccupant],
      entryState,
    );
    candidateEvaluations.push(...replacementResult.evaluations);
    if (replacementResult.winner && !isLocked(primaryOccupant)) {
      slotDecisions.push({
        slotId: primary.slot.id,
        from: primaryOccupant,
        to: replacementResult.winner,
        reason: 'primary-weak-replaced-with-strong',
        reportKind: primary.kind,
      });
      return {
        band: {
          ...band,
          slots: [{ ...primary.slot, occupantId: replacementResult.winner }, secondary.slot],
        },
        decision: {
          action: 'promoted',
          reason: 'strong-candidate-promoted-into-primary',
          slotDecisions,
          candidateEvaluations,
        },
      };
    }

    // Primary is locked or no swap/replacement legal — retain.
    slotDecisions.push({
      slotId: primary.slot.id,
      from: primaryOccupant,
      to: primaryOccupant,
      reason: isLocked(primaryOccupant) ? 'primary-locked' : 'no-legal-replacement-for-primary',
      reportKind: primary.kind,
    });
    return {
      band,
      decision: {
        action: 'retained',
        reason: 'weak-primary-but-no-legal-improvement',
        slotDecisions,
        candidateEvaluations,
      },
    };
  }

  // Case C: both weak. Try to promote into the primary slot; else demote
  // primary to null if unlocked.
  if (primaryWeak && secondaryWeak) {
    const replacementResult = findPromotableCandidate(
      primary.slot,
      band.semanticRole,
      reports,
      [primaryOccupant, secondaryOccupant].filter((id): id is OccupantId => id !== null),
      [],
      entryState,
    );
    candidateEvaluations.push(...replacementResult.evaluations);
    if (replacementResult.winner) {
      slotDecisions.push(
        {
          slotId: primary.slot.id,
          from: primaryOccupant,
          to: replacementResult.winner,
          reason: 'primary-weak-replaced-with-strong',
          reportKind: primary.kind,
        },
        {
          slotId: secondary.slot.id,
          from: secondaryOccupant,
          to: null,
          reason: 'secondary-weak-nulled-after-primary-promotion',
          reportKind: secondary.kind,
        },
      );
      return {
        band: {
          ...band,
          slots: [
            { ...primary.slot, occupantId: replacementResult.winner },
            { ...secondary.slot, occupantId: null },
          ],
        },
        decision: {
          action: 'promoted',
          reason: 'both-weak-primary-replaced',
          slotDecisions,
          candidateEvaluations,
        },
      };
    }

    if (primaryOccupant && !isLocked(primaryOccupant) && secondaryOccupant) {
      slotDecisions.push(
        {
          slotId: primary.slot.id,
          from: primaryOccupant,
          to: null,
          reason: 'primary-weak-nulled-secondary-retained',
          reportKind: primary.kind,
        },
      );
      return {
        band: {
          ...band,
          slots: [
            { ...primary.slot, occupantId: null },
            secondary.slot,
          ],
        },
        decision: {
          action: 'demoted-primary',
          reason: 'both-weak-no-replacement-primary-demoted',
          slotDecisions,
          candidateEvaluations,
        },
      };
    }

    // Locked primary + weak secondary — preserve the locked anchor, drop
    // the secondary.
    slotDecisions.push(
      {
        slotId: primary.slot.id,
        from: primaryOccupant,
        to: primaryOccupant,
        reason: 'primary-locked-preserved',
        reportKind: primary.kind,
      },
      {
        slotId: secondary.slot.id,
        from: secondaryOccupant,
        to: null,
        reason: 'secondary-weak-nulled-with-locked-primary',
        reportKind: secondary.kind,
      },
    );
    return {
      band: {
        ...band,
        slots: [primary.slot, { ...secondary.slot, occupantId: null }],
      },
      decision: {
        action: 'reduced-to-single',
        reason: 'locked-primary-retained-weak-secondary-nulled',
        slotDecisions,
        candidateEvaluations,
      },
    };
  }

  // Default safety net.
  return {
    band,
    decision: {
      action: 'retained',
      reason: 'no-actionable-condition',
      slotDecisions: [],
      candidateEvaluations,
    },
  };
}

export function toFirstLaneDecisionDataAttributes(decision: FirstLaneDecision): {
  'data-shell-first-lane-action': FirstLaneAction;
  'data-shell-first-lane-reason': string;
  'data-shell-first-lane-replacements': number;
  'data-shell-first-lane-candidates-considered': number;
} {
  const replacements = decision.slotDecisions.filter((d) => d.from !== d.to).length;
  return {
    'data-shell-first-lane-action': decision.action,
    'data-shell-first-lane-reason': decision.reason,
    'data-shell-first-lane-replacements': replacements,
    'data-shell-first-lane-candidates-considered': decision.candidateEvaluations?.length ?? 0,
  };
}
