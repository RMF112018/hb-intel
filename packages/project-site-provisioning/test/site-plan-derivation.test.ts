import { describe, expect, it } from 'vitest';
import { deriveSitePlan } from '../src/index.js';

describe('deriveSitePlan (frozen PCC URL rule)', () => {
  it('derives /sites/26000 from accounting number 26-000-00', () => {
    const { sitePlan, warnings } = deriveSitePlan({ projectNumber: '26-000-00', projectName: 'Test' });
    expect(sitePlan.urlDerivation.status).toBe('derived');
    expect(sitePlan.urlDerivation.projectBaseNumber).toBe('26-000');
    expect(sitePlan.urlDerivation.projectBaseNumberNoHyphen).toBe('26000');
    expect(sitePlan.urlDerivation.resolved).toBe('/sites/26000');
    expect(warnings).toEqual([]);
  });

  it('derives /sites/26123 from accounting number 26-123-45', () => {
    const { sitePlan } = deriveSitePlan({ projectNumber: '26-123-45', projectName: 'Other' });
    expect(sitePlan.urlDerivation.projectBaseNumberNoHyphen).toBe('26123');
    expect(sitePlan.urlDerivation.resolved).toBe('/sites/26123');
  });

  it('strips non-numeric characters from the first six positions', () => {
    // First six chars of '2A6-X00' are '2A6-X0'; numerics-only = '260'.
    const { sitePlan } = deriveSitePlan({ projectNumber: '2A6-X00', projectName: 'P' });
    expect(sitePlan.urlDerivation.projectBaseNumber).toBe('2A6-X0');
    expect(sitePlan.urlDerivation.projectBaseNumberNoHyphen).toBe('260');
    expect(sitePlan.urlDerivation.resolved).toBe('/sites/260');
  });

  it('produces placeholders and warnings when projectNumber is missing', () => {
    const { sitePlan, warnings } = deriveSitePlan(undefined);
    expect(sitePlan.urlDerivation.status).toBe('placeholder');
    expect(sitePlan.urlDerivation.resolved).toBeNull();
    expect(sitePlan.urlDerivation.projectBaseNumber).toBeNull();
    expect(sitePlan.title.status).toBe('placeholder');
    expect(sitePlan.title.resolved).toBeNull();
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.includes('projectNumber'))).toBe(true);
  });

  it('produces placeholder title when projectName is missing but projectNumber is supplied', () => {
    const { sitePlan, warnings } = deriveSitePlan({ projectNumber: '26-000-00' });
    expect(sitePlan.urlDerivation.status).toBe('derived');
    expect(sitePlan.title.status).toBe('placeholder');
    expect(warnings.some((w) => w.includes('projectName'))).toBe(true);
  });

  it('does not invent values for empty projectNumber strings', () => {
    const { sitePlan, warnings } = deriveSitePlan({ projectNumber: '', projectName: 'P' });
    expect(sitePlan.urlDerivation.status).toBe('placeholder');
    expect(warnings.some((w) => w.includes('projectNumber'))).toBe(true);
  });

  it('flags projectNumber that yields no numerics in first six chars', () => {
    const { sitePlan, warnings } = deriveSitePlan({ projectNumber: 'AB-CDE-FG', projectName: 'P' });
    expect(sitePlan.urlDerivation.status).toBe('placeholder');
    expect(sitePlan.urlDerivation.projectBaseNumberNoHyphen).toBe('');
    expect(warnings.some((w) => w.includes('no numeric characters'))).toBe(true);
  });
});
