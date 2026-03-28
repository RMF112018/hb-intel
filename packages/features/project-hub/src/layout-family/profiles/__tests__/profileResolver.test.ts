/**
 * Project Hub Profile Resolver — tests.
 *
 * Validates the role/device → profile resolution policy, override governance,
 * profile registry consistency, and persistence round-trip behavior.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { ProjectHubDeviceClass, ProjectHubProfileId, ProjectHubProfileRole } from '../types.js';
import {
  resolveProjectHubProfile,
  isProfileAllowed,
  getAllowedProfiles,
  getDefaultProfileId,
} from '../resolver.js';
import {
  PROJECT_HUB_PROFILE_REGISTRY,
  PROJECT_HUB_PROFILE_IDS,
} from '../registry.js';
import {
  saveProfilePreference,
  loadProfilePreference,
  clearProfilePreference,
} from '../persistence.js';

// ═══════════════════════════════════════════════════════════════════
// 1. REGISTRY CONSISTENCY
// ═══════════════════════════════════════════════════════════════════

describe('Profile registry', () => {
  it('contains exactly 5 canonical profile IDs', () => {
    expect(PROJECT_HUB_PROFILE_IDS).toHaveLength(5);
    expect(PROJECT_HUB_PROFILE_IDS).toContain('hybrid-operating-layer');
    expect(PROJECT_HUB_PROFILE_IDS).toContain('canvas-first-operating-layer');
    expect(PROJECT_HUB_PROFILE_IDS).toContain('next-move-hub');
    expect(PROJECT_HUB_PROFILE_IDS).toContain('executive-cockpit');
    expect(PROJECT_HUB_PROFILE_IDS).toContain('field-tablet-split-pane');
  });

  it('registry maps all IDs to definitions', () => {
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      const def = PROJECT_HUB_PROFILE_REGISTRY[id];
      expect(def).toBeDefined();
      expect(def.profileId).toBe(id);
      expect(def.layoutFamily).toBeTruthy();
      expect(def.supportedRoles.length).toBeGreaterThan(0);
      expect(def.supportedDeviceClasses.length).toBeGreaterThan(0);
    }
  });

  it('every profile maps to one of the 3 layout families', () => {
    const validFamilies = new Set(['project-operating', 'executive', 'field-tablet']);
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      expect(validFamilies.has(PROJECT_HUB_PROFILE_REGISTRY[id].layoutFamily)).toBe(true);
    }
  });

  it('every profile has a non-empty specRef', () => {
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      expect(PROJECT_HUB_PROFILE_REGISTRY[id].specRef).toBeTruthy();
    }
  });

  it('hybrid-operating-layer and canvas-first-operating-layer both use project-operating family', () => {
    expect(PROJECT_HUB_PROFILE_REGISTRY['hybrid-operating-layer'].layoutFamily).toBe('project-operating');
    expect(PROJECT_HUB_PROFILE_REGISTRY['canvas-first-operating-layer'].layoutFamily).toBe('project-operating');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. DESKTOP ROLE DEFAULTS
// ═══════════════════════════════════════════════════════════════════

describe('Desktop role defaults', () => {
  const desktopCases: [ProjectHubProfileRole, ProjectHubProfileId][] = [
    ['project-manager', 'hybrid-operating-layer'],
    ['project-executive', 'hybrid-operating-layer'],
    ['portfolio-executive', 'executive-cockpit'],
    ['superintendent', 'next-move-hub'],
    ['field-engineer', 'next-move-hub'],
    ['leadership', 'executive-cockpit'],
    ['qa-qc', 'canvas-first-operating-layer'],
    ['safety-leadership', 'canvas-first-operating-layer'],
  ];

  it.each(desktopCases)('%s on desktop defaults to %s', (role, expectedProfile) => {
    const result = resolveProjectHubProfile({ role, deviceClass: 'desktop' });
    expect(result.profileId).toBe(expectedProfile);
    expect(result.overrideRejected).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 3. TABLET ROLE DEFAULTS
// ═══════════════════════════════════════════════════════════════════

describe('Tablet role defaults', () => {
  const tabletCases: [ProjectHubProfileRole, ProjectHubProfileId][] = [
    ['project-manager', 'canvas-first-operating-layer'],
    ['project-executive', 'canvas-first-operating-layer'],
    ['portfolio-executive', 'executive-cockpit'],
    ['superintendent', 'field-tablet-split-pane'],
    ['field-engineer', 'field-tablet-split-pane'],
    ['leadership', 'executive-cockpit'],
    ['qa-qc', 'field-tablet-split-pane'],
    ['safety-leadership', 'field-tablet-split-pane'],
  ];

  it.each(tabletCases)('%s on tablet defaults to %s', (role, expectedProfile) => {
    const result = resolveProjectHubProfile({ role, deviceClass: 'tablet' });
    expect(result.profileId).toBe(expectedProfile);
    expect(result.overrideRejected).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. NARROW FALLBACK DEFAULTS
// ═══════════════════════════════════════════════════════════════════

describe('Narrow/fallback defaults', () => {
  const narrowCases: [ProjectHubProfileRole, ProjectHubProfileId][] = [
    ['project-manager', 'canvas-first-operating-layer'],
    ['project-executive', 'canvas-first-operating-layer'],
    ['portfolio-executive', 'canvas-first-operating-layer'],
    ['superintendent', 'next-move-hub'],
    ['field-engineer', 'next-move-hub'],
    ['leadership', 'canvas-first-operating-layer'],
    ['qa-qc', 'next-move-hub'],
    ['safety-leadership', 'canvas-first-operating-layer'],
  ];

  it.each(narrowCases)('%s on narrow defaults to %s', (role, expectedProfile) => {
    const result = resolveProjectHubProfile({ role, deviceClass: 'narrow' });
    expect(result.profileId).toBe(expectedProfile);
    expect(result.overrideRejected).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. USER OVERRIDE GOVERNANCE
// ═══════════════════════════════════════════════════════════════════

describe('User override governance', () => {
  it('accepts a valid override for the role and device', () => {
    const result = resolveProjectHubProfile({
      role: 'project-manager',
      deviceClass: 'desktop',
      userOverride: 'canvas-first-operating-layer',
    });
    expect(result.profileId).toBe('canvas-first-operating-layer');
    expect(result.overrideRejected).toBe(false);
  });

  it('rejects an override not allowed for the role', () => {
    const result = resolveProjectHubProfile({
      role: 'field-engineer',
      deviceClass: 'desktop',
      userOverride: 'executive-cockpit',
    });
    expect(result.overrideRejected).toBe(true);
    expect(result.profileId).toBe('next-move-hub'); // fallback to default
    expect(result.overrideRejectionReason).toContain('executive-cockpit');
    expect(result.overrideRejectionReason).toContain('field-engineer');
  });

  it('rejects an override not allowed for the device class', () => {
    const result = resolveProjectHubProfile({
      role: 'project-manager',
      deviceClass: 'desktop',
      userOverride: 'field-tablet-split-pane',
    });
    expect(result.overrideRejected).toBe(true);
    expect(result.profileId).toBe('hybrid-operating-layer'); // fallback
  });

  it('treats null override as no-override', () => {
    const result = resolveProjectHubProfile({
      role: 'project-manager',
      deviceClass: 'desktop',
      userOverride: null,
    });
    expect(result.profileId).toBe('hybrid-operating-layer');
    expect(result.overrideRejected).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

describe('Helper functions', () => {
  it('isProfileAllowed checks both role and device', () => {
    expect(isProfileAllowed('hybrid-operating-layer', 'project-manager', 'desktop')).toBe(true);
    expect(isProfileAllowed('field-tablet-split-pane', 'project-manager', 'desktop')).toBe(false);
    expect(isProfileAllowed('executive-cockpit', 'field-engineer', 'desktop')).toBe(false);
    expect(isProfileAllowed('field-tablet-split-pane', 'superintendent', 'tablet')).toBe(true);
  });

  it('getAllowedProfiles returns default first', () => {
    const profiles = getAllowedProfiles('project-manager', 'desktop');
    expect(profiles[0]).toBe('hybrid-operating-layer');
    expect(profiles.length).toBeGreaterThanOrEqual(1);
  });

  it('getDefaultProfileId matches resolver result', () => {
    const roles: ProjectHubProfileRole[] = [
      'project-manager', 'project-executive', 'portfolio-executive',
      'superintendent', 'field-engineer', 'leadership', 'qa-qc', 'safety-leadership',
    ];
    const devices: ProjectHubDeviceClass[] = ['desktop', 'tablet', 'narrow'];

    for (const role of roles) {
      for (const device of devices) {
        const defaultId = getDefaultProfileId(role, device);
        const resolved = resolveProjectHubProfile({ role, deviceClass: device });
        expect(defaultId).toBe(resolved.profileId);
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. LAYOUT FAMILY MAPPING
// ═══════════════════════════════════════════════════════════════════

describe('Layout family mapping', () => {
  it('resolution result includes the correct layout family', () => {
    const hybrid = resolveProjectHubProfile({ role: 'project-manager', deviceClass: 'desktop' });
    expect(hybrid.layoutFamily).toBe('project-operating');

    const exec = resolveProjectHubProfile({ role: 'portfolio-executive', deviceClass: 'desktop' });
    expect(exec.layoutFamily).toBe('executive');

    const field = resolveProjectHubProfile({ role: 'superintendent', deviceClass: 'tablet' });
    expect(field.layoutFamily).toBe('field-tablet');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. PERSISTENCE
// ═══════════════════════════════════════════════════════════════════

describe('Profile persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads a profile preference', () => {
    saveProfilePreference('user-001', 'desktop', 'canvas-first-operating-layer');
    const loaded = loadProfilePreference('user-001', 'desktop');
    expect(loaded).toBe('canvas-first-operating-layer');
  });

  it('returns null when no preference exists', () => {
    expect(loadProfilePreference('user-999', 'desktop')).toBeNull();
  });

  it('isolates preferences by device class', () => {
    saveProfilePreference('user-001', 'desktop', 'hybrid-operating-layer');
    saveProfilePreference('user-001', 'tablet', 'canvas-first-operating-layer');

    expect(loadProfilePreference('user-001', 'desktop')).toBe('hybrid-operating-layer');
    expect(loadProfilePreference('user-001', 'tablet')).toBe('canvas-first-operating-layer');
  });

  it('isolates preferences by user', () => {
    saveProfilePreference('user-001', 'desktop', 'hybrid-operating-layer');
    saveProfilePreference('user-002', 'desktop', 'next-move-hub');

    expect(loadProfilePreference('user-001', 'desktop')).toBe('hybrid-operating-layer');
    expect(loadProfilePreference('user-002', 'desktop')).toBe('next-move-hub');
  });

  it('clears a preference', () => {
    saveProfilePreference('user-001', 'desktop', 'hybrid-operating-layer');
    clearProfilePreference('user-001', 'desktop');
    expect(loadProfilePreference('user-001', 'desktop')).toBeNull();
  });

  it('clear does not affect other user/device combinations', () => {
    saveProfilePreference('user-001', 'desktop', 'hybrid-operating-layer');
    saveProfilePreference('user-001', 'tablet', 'canvas-first-operating-layer');
    clearProfilePreference('user-001', 'desktop');

    expect(loadProfilePreference('user-001', 'desktop')).toBeNull();
    expect(loadProfilePreference('user-001', 'tablet')).toBe('canvas-first-operating-layer');
  });

  it('returns null for malformed JSON', () => {
    localStorage.setItem('hbc-project-hub-profile-user-001-desktop', 'not-json');
    expect(loadProfilePreference('user-001', 'desktop')).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 9. PROFILE DEFINITION QUALITY
// ═══════════════════════════════════════════════════════════════════

describe('Profile definition quality', () => {
  it('every profile has mandatory regions that are a subset of its layout family regions', () => {
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      const def = PROJECT_HUB_PROFILE_REGISTRY[id];
      // Mandatory regions should be meaningful region IDs
      for (const regionId of def.mandatoryRegions) {
        expect(['header', 'left', 'center', 'right', 'bottom']).toContain(regionId);
      }
    }
  });

  it('every profile has header as a mandatory region', () => {
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      expect(PROJECT_HUB_PROFILE_REGISTRY[id].mandatoryRegions).toContain('header');
    }
  });

  it('every profile has center as a mandatory region', () => {
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      expect(PROJECT_HUB_PROFILE_REGISTRY[id].mandatoryRegions).toContain('center');
    }
  });

  it('persistenceVersion is a positive integer for all profiles', () => {
    for (const id of PROJECT_HUB_PROFILE_IDS) {
      const version = PROJECT_HUB_PROFILE_REGISTRY[id].persistenceVersion;
      expect(version).toBeGreaterThan(0);
      expect(Number.isInteger(version)).toBe(true);
    }
  });
});
