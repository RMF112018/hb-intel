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
    comfort: {
      minWidth: 600,
      preferredWidth: 960,
      narrowestStablePairedWidth: 640,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    shellFit: {
      narrowestStableShellWidth: 680,
      narrowestStablePairedWidth: 720,
      supportedModes: ['standard'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: [],
    },
    allowedBandSemantics: ['people-culture', 'communications-editorial'],
    reorderDomain: 'locked',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: [],
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
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: true,
      supportsStandard: true,
      supportsSummaryCollapse: true,
    },
    shellFit: {
      narrowestStableShellWidth: 420,
      narrowestStablePairedWidth: 520,
      supportedModes: ['standard', 'compact', 'summary-collapsed'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: ['recognition-cannot-be-primary-anchor'],
    },
    allowedBandSemantics: ['recognition', 'operational-spotlight'],
    reorderDomain: 'locked',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: [],
  },
  {
    id: 'safety-field-excellence',
    status: 'active',
    displayName: 'Safety Field Excellence',
    renderKey: 'SafetyFieldExcellenceZone',
    allowedSlotRoles: ['primary', 'secondary'],
    prominenceCeiling: 'supporting',
    firstLaneEligible: false,
    firstLanePromotionRank: 80,
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: true,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    shellFit: {
      narrowestStableShellWidth: 440,
      narrowestStablePairedWidth: 520,
      supportedModes: ['standard', 'compact'],
      pairedLayoutEligible: true,
      fallbackWhenUnsafe: 'force-stack',
      protectedConstraints: ['operational-strip-eligible'],
    },
    allowedBandSemantics: ['operational-spotlight', 'communications-newsroom'],
    reorderDomain: 'within-band',
    visibilityEligibility: LOCKED_VISIBILITY,
    persistedPolicyKeys: [],
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
