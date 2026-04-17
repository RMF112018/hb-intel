import type { OccupantDescriptor, OccupantId, SlotRole } from './shellTypes.js';

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
  },
  {
    id: 'safety-field-excellence',
    status: 'inactive-candidate',
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
