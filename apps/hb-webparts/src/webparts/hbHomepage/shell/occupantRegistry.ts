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
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
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
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
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
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
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
    allowedSlotRoles: ['primary'],
    prominenceCeiling: 'anchor',
    firstLaneEligible: false,
    comfort: {
      minWidth: 600,
      preferredWidth: 960,
      narrowestStablePairedWidth: 640,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    pairingRestrictions: ['hb-kudos'],
    allowedBandSemantics: ['people-culture'],
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
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    pairingRestrictions: ['people-culture-public'],
    allowedBandSemantics: ['recognition'],
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
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      narrowestStablePairedWidth: 520,
      supportsCompact: false,
      supportsStandard: true,
      supportsSummaryCollapse: false,
    },
    allowedBandSemantics: ['operational-spotlight'],
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
  return slotWidth >= occupant.comfort.narrowestStablePairedWidth;
}

export interface OccupantGovernanceView {
  readonly id: OccupantId;
  readonly category: GovernanceCategory;
  readonly reorderDomain: ReorderDomain;
  readonly visibilityEligibility: VisibilityEligibility;
  readonly allowedBandSemantics: readonly OccupantDescriptor['allowedBandSemantics'][number][];
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
    persistedPolicyKeys: occupant.persistedPolicyKeys,
  };
}
