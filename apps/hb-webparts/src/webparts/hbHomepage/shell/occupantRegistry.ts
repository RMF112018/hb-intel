import type {
  GovernanceCategory,
  OccupantDescriptor,
  OccupantId,
  ReorderDomain,
  SlotRole,
  VisibilityEligibility,
} from './shellTypes.js';

const LOCKED_VISIBILITY: VisibilityEligibility = {
  removable: false,
  hideableByMaintainer: false,
};

const REGISTRY_ENTRIES: readonly OccupantDescriptor[] = [
  {
    id: 'company-pulse',
    status: 'active',
    displayName: 'Company Pulse',
    renderKey: 'CompanyPulseZone',
    allowedSlotRoles: ['primary', 'secondary'],
    prominenceCeiling: 'anchor',
    firstLaneEligible: true,
    firstLanePromotionRank: 20,
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    shellFit: {
      narrowestStableShellWidth: 480,
      narrowestStablePairedWidth: 520,
      supportedModes: ['standard'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: ['requires-standard-card-density'],
    },
    allowedBandSemantics: ['communications-newsroom', 'operational-spotlight'],
    reorderDomain: 'within-compatible-bands',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: ['limitedReorderWithinCompatibleBands'],
    lockedToRow: { bandSemanticRole: 'communications-newsroom', role: 'primary' },
  },
  {
    id: 'leadership-message',
    status: 'active',
    displayName: 'Leadership Message',
    renderKey: 'LeadershipMessageZone',
    allowedSlotRoles: ['primary', 'secondary'],
    prominenceCeiling: 'anchor',
    firstLaneEligible: true,
    firstLanePromotionRank: 30,
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    shellFit: {
      narrowestStableShellWidth: 480,
      narrowestStablePairedWidth: 520,
      supportedModes: ['standard'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: ['requires-editorial-frame'],
    },
    allowedBandSemantics: ['communications-editorial', 'communications-newsroom'],
    reorderDomain: 'within-compatible-bands',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: ['limitedReorderWithinCompatibleBands'],
    lockedToRow: { bandSemanticRole: 'communications-editorial', role: 'primary' },
  },
  {
    id: 'project-portfolio-spotlight',
    status: 'active',
    displayName: 'Project Portfolio Spotlight',
    renderKey: 'ProjectPortfolioSpotlightZone',
    allowedSlotRoles: ['primary', 'secondary'],
    prominenceCeiling: 'anchor',
    firstLaneEligible: true,
    firstLanePromotionRank: 10,
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    shellFit: {
      narrowestStableShellWidth: 520,
      narrowestStablePairedWidth: 560,
      supportedModes: ['standard'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: ['locked-anchor-preferred'],
    },
    allowedBandSemantics: ['operational-spotlight'],
    reorderDomain: 'locked',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: [],
    lockedToRow: { bandSemanticRole: 'operational-spotlight', role: 'primary' },
  },
  {
    id: 'people-culture-public',
    status: 'active',
    displayName: 'People & Culture Public',
    renderKey: 'PeopleCulturePublicZone',
    allowedSlotRoles: ['primary', 'secondary'],
    prominenceCeiling: 'anchor',
    firstLaneEligible: false,
    firstLanePromotionRank: 90,
    // Wave-01 shell-legality contract: paired at tablet-landscape floor
    // (minor slot ≈ 327 px at 980). Premium visual polish at narrow
    // widths remains Wave-02 surface work.
    comfort: {
      minWidth: 300,
      preferredWidth: 960,
      narrowestStablePairedWidth: 320,
      supportsCompact: true,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    shellFit: {
      narrowestStableShellWidth: 300,
      narrowestStablePairedWidth: 320,
      supportedModes: ['standard', 'compact'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: [],
    },
    allowedBandSemantics: ['people-culture', 'communications-editorial'],
    reorderDomain: 'locked',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: [],
    lockedToRow: { bandSemanticRole: 'communications-editorial', role: 'secondary' },
  },
  {
    id: 'hb-kudos',
    status: 'active',
    displayName: 'HB Kudos',
    renderKey: 'HbKudosZone',
    allowedSlotRoles: ['primary', 'secondary'],
    prominenceCeiling: 'contextual',
    firstLaneEligible: false,
    firstLanePromotionRank: 95,
    // Wave-01 shell-legality contract: paired at tablet-landscape floor
    // (minor slot ≈ 327 px at 980). Wave-02 owns premium polish.
    comfort: {
      minWidth: 300,
      preferredWidth: 720,
      narrowestStablePairedWidth: 320,
      supportsCompact: true,
      supportsStandard: true,
      supportsSummaryCollapse: true,
    },
    shellFit: {
      narrowestStableShellWidth: 300,
      narrowestStablePairedWidth: 320,
      supportedModes: ['standard', 'compact', 'summary-collapsed'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: ['recognition-cannot-be-primary-anchor'],
    },
    allowedBandSemantics: ['recognition', 'operational-spotlight'],
    reorderDomain: 'locked',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: [],
    lockedToRow: { bandSemanticRole: 'operational-spotlight', role: 'secondary' },
  },
  {
    id: 'safety-field-excellence',
    status: 'active',
    displayName: 'Safety Field Excellence',
    renderKey: 'SafetyFieldExcellenceZone',
    allowedSlotRoles: ['primary', 'secondary'],
    prominenceCeiling: 'anchor',
    firstLaneEligible: false,
    firstLanePromotionRank: 80,
    // Rebuilt safety surface contract: shell can continue pairing at the
    // tablet-landscape floor (minor slot ≈ 327 px at 980), while the child
    // consumer maps shell render modes to the surface's explicit
    // standard/compact/minimal behavior.
    comfort: {
      minWidth: 300,
      preferredWidth: 720,
      narrowestStablePairedWidth: 320,
      supportsCompact: true,
      supportsStandard: true,
      supportsSummaryCollapse: true,
    },
    shellFit: {
      narrowestStableShellWidth: 320,
      narrowestStablePairedWidth: 320,
      supportedModes: ['standard', 'compact', 'summary-collapsed'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: ['operational-strip-eligible'],
    },
    allowedBandSemantics: ['operational-spotlight', 'communications-newsroom'],
    reorderDomain: 'locked',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: [],
    lockedToRow: { bandSemanticRole: 'communications-newsroom', role: 'secondary' },
  },
] as const;

export const OCCUPANT_REGISTRY: ReadonlyMap<OccupantId, OccupantDescriptor> = new Map(
  REGISTRY_ENTRIES.map((entry) => [entry.id, entry]),
);

export function getOccupant(id: OccupantId): OccupantDescriptor | undefined {
  return OCCUPANT_REGISTRY.get(id);
}

export function getActiveOccupants(): OccupantDescriptor[] {
  return [...OCCUPANT_REGISTRY.values()].filter((o) => o.status === 'active');
}

export function getFirstLaneEligibleOccupants(): OccupantDescriptor[] {
  return getActiveOccupants().filter((o) => o.firstLaneEligible);
}

export function isOccupantAllowedInSlot(id: OccupantId, role: SlotRole): boolean {
  const occupant = OCCUPANT_REGISTRY.get(id);
  if (!occupant) return false;
  return occupant.allowedSlotRoles.includes(role);
}

export function areOccupantsPairableInBand(a: OccupantId, b: OccupantId): boolean {
  const occupantA = OCCUPANT_REGISTRY.get(a);
  const occupantB = OCCUPANT_REGISTRY.get(b);
  if (!occupantA || !occupantB) return false;
  if (occupantA.pairingRestrictions?.includes(b)) return false;
  if (occupantB.pairingRestrictions?.includes(a)) return false;
  return true;
}

export function canOccupantPairAtWidth(id: OccupantId, slotWidth: number): boolean {
  const occupant = OCCUPANT_REGISTRY.get(id);
  if (!occupant) return false;
  return slotWidth >= Math.max(
    occupant.comfort.narrowestStablePairedWidth,
    occupant.shellFit.narrowestStablePairedWidth,
  );
}

export interface OccupantGovernanceView {
  readonly id: OccupantId;
  readonly category: GovernanceCategory;
  readonly reorderDomain: ReorderDomain;
  readonly visibilityEligibility: VisibilityEligibility;
  readonly allowedBandSemantics: readonly OccupantDescriptor['allowedBandSemantics'][number][];
  readonly shellFit: OccupantDescriptor['shellFit'];
  readonly persistedPolicyKeys: readonly string[];
}

export function getOccupantGovernance(id: OccupantId): OccupantGovernanceView | undefined {
  const occupant = OCCUPANT_REGISTRY.get(id);
  if (!occupant) return undefined;
  return {
    id: occupant.id,
    category: 'shell-fit',
    reorderDomain: occupant.reorderDomain,
    visibilityEligibility: occupant.visibilityEligibility,
    allowedBandSemantics: occupant.allowedBandSemantics,
    shellFit: occupant.shellFit,
    persistedPolicyKeys: occupant.persistedPolicyKeys,
  };
}
