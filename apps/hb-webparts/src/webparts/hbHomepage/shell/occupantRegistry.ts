import type { OccupantDescriptor, OccupantId, SlotRole } from './shellTypes.js';

const REGISTRY_ENTRIES: readonly OccupantDescriptor[] = [
  {
    id: 'company-pulse',
    status: 'active',
    displayName: 'Company Pulse',
    renderKey: 'CompanyPulseZone',
    allowedSlotRoles: ['primary', 'secondary'],
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      supportsCompact: false,
      supportsStandard: true,
    },
  },
  {
    id: 'leadership-message',
    status: 'active',
    displayName: 'Leadership Message',
    renderKey: 'LeadershipMessageZone',
    allowedSlotRoles: ['primary', 'secondary'],
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      supportsCompact: false,
      supportsStandard: true,
    },
  },
  {
    id: 'project-portfolio-spotlight',
    status: 'active',
    displayName: 'Project Portfolio Spotlight',
    renderKey: 'ProjectPortfolioSpotlightZone',
    allowedSlotRoles: ['primary', 'secondary'],
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      supportsCompact: false,
      supportsStandard: true,
    },
  },
  {
    id: 'people-culture-public',
    status: 'active',
    displayName: 'People & Culture Public',
    renderKey: 'PeopleCulturePublicZone',
    allowedSlotRoles: ['primary'],
    comfort: {
      minWidth: 720,
      preferredWidth: 1040,
      supportsCompact: false,
      supportsStandard: true,
    },
    pairingRestrictions: ['hb-kudos'],
  },
  {
    id: 'hb-kudos',
    status: 'active',
    displayName: 'HB Kudos',
    renderKey: 'HbKudosZone',
    allowedSlotRoles: ['primary', 'secondary'],
    comfort: {
      minWidth: 480,
      preferredWidth: 720,
      supportsCompact: false,
      supportsStandard: true,
    },
    pairingRestrictions: ['people-culture-public'],
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
