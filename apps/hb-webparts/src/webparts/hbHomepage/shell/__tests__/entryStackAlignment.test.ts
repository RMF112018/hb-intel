import { describe, it, expect } from 'vitest';
import {
  PRIORITY_ACTIONS_DEVICE_CLASS_TO_SHELL_STATE,
  SHELL_ENTRY_STATE_TO_PRIORITY_ACTIONS_DEVICE_CLASS,
  mapPriorityActionsDeviceClassToShellState,
  mapShellEntryStateToPriorityActionsDeviceClass,
  type PriorityActionsDeviceClass,
} from '../../../../homepage/entryStack/entryStackOrchestration.js';
import type { DeviceClass as RailDeviceClass } from '../../../../homepage/data/priorityActionsNormalization.js';
import { SHELL_ENTRY_STATES } from '../breakpointPolicy.js';
import type { ShellEntryStateId } from '../shellTypes.js';

// Compile-time assertion: the rail's author-facing DeviceClass union and
// the orchestration-seam PriorityActionsDeviceClass MUST be the same set
// of string literals. If the rail ever adds or renames a class, TypeScript
// fails the build here before runtime drift can occur.
const _checkAToB: RailDeviceClass = null as unknown as PriorityActionsDeviceClass;
const _checkBToA: PriorityActionsDeviceClass = null as unknown as RailDeviceClass;
void _checkAToB;
void _checkBToA;

describe('entryStack alignment — PriorityActionsRail DeviceClass ↔ ShellEntryStateId', () => {
  it('forward map covers every rail DeviceClass', () => {
    const keys = Object.keys(
      PRIORITY_ACTIONS_DEVICE_CLASS_TO_SHELL_STATE,
    ).sort();
    expect(keys).toEqual(
      ['desktop', 'laptop', 'phone', 'tabletLandscape', 'tabletPortrait'],
    );
  });

  it('inverse map covers every declared shell entry state', () => {
    for (const state of SHELL_ENTRY_STATES) {
      expect(
        SHELL_ENTRY_STATE_TO_PRIORITY_ACTIONS_DEVICE_CLASS[state.id],
      ).toBeDefined();
    }
  });

  it('round-trips forward then inverse back to a canonical rail class', () => {
    const classes: PriorityActionsDeviceClass[] = [
      'desktop',
      'laptop',
      'tabletLandscape',
      'tabletPortrait',
      'phone',
    ];
    for (const dc of classes) {
      const shellId = mapPriorityActionsDeviceClassToShellState(dc);
      const roundTrip = mapShellEntryStateToPriorityActionsDeviceClass(shellId);
      expect(roundTrip).toBe(dc);
    }
  });

  it('collapses shell states that share a rail class back to that class', () => {
    // tablet-portrait-large → tabletPortrait (collapse)
    // phone-landscape → phone (collapse)
    const collapses: Array<[ShellEntryStateId, PriorityActionsDeviceClass]> = [
      ['tablet-portrait-large', 'tabletPortrait'],
      ['tablet-portrait', 'tabletPortrait'],
      ['phone-portrait', 'phone'],
      ['phone-landscape', 'phone'],
    ];
    for (const [shellId, dc] of collapses) {
      expect(mapShellEntryStateToPriorityActionsDeviceClass(shellId)).toBe(dc);
    }
  });
});
