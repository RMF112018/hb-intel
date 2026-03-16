import { describe, it, expect } from 'vitest';
import {
  elevationLevel0,
  elevationLevel1,
  elevationLevel2,
  elevationLevel3,
  elevationLevel4,
  elevationCard,
  elevationModal,
  elevationBlocking,
  hbcElevationField,
} from '../elevation.js';

describe('Elevation system (elevation.ts)', () => {
  it('all 5 standard levels defined', () => {
    expect(elevationLevel0).toBeDefined();
    expect(elevationLevel1).toBeDefined();
    expect(elevationLevel2).toBeDefined();
    expect(elevationLevel3).toBeDefined();
    expect(elevationLevel4).toBeDefined();
  });

  it('field mode variants have same structure as standard', () => {
    expect(hbcElevationField.level0).toBeDefined();
    expect(hbcElevationField.level1).toBeDefined();
    expect(hbcElevationField.level2).toBeDefined();
    expect(hbcElevationField.level3).toBeDefined();
    expect(hbcElevationField.level4).toBeDefined();
  });

  it('semantic aliases point to correct levels', () => {
    expect(elevationCard).toBe(elevationLevel1);
    expect(elevationModal).toBe(elevationLevel3);
    expect(elevationBlocking).toBe(elevationLevel4);
  });

  it('elevationLevel0 is none', () => {
    expect(elevationLevel0).toBe('none');
  });
});
