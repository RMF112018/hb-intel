import { describe, expect, it } from 'vitest';

import { parseCostCodeDictionary } from '../../index.js';

describe('P3-E4-T02 cost-code dictionary reference', () => {
  it('parses 3-column format (stage,csi_code,description)', () => {
    const csv = [
      'stage,csi_code,csi_code_description',
      'Presentation,01-00-000,GENERAL',
      'Presentation,01-01-000,CONDITIONS',
      'Presentation,03-01-025,PLAN COPY',
    ].join('\n');

    const codes = parseCostCodeDictionary(csv);
    expect(codes.has('01-00-000')).toBe(true);
    expect(codes.has('01-01-000')).toBe(true);
    expect(codes.has('03-01-025')).toBe(true);
    expect(codes.size).toBe(3);
  });

  it('parses 2-column format (csi_code,description) with space-separated codes', () => {
    const csv = [
      'csi_code,csi_code_description',
      '01 00 000,General',
      '03 01 025,PlanCopy',
    ].join('\n');

    const codes = parseCostCodeDictionary(csv);
    expect(codes.has('01-00-000')).toBe(true);
    expect(codes.has('03-01-025')).toBe(true);
    expect(codes.size).toBe(2);
  });

  it('skips empty lines', () => {
    const csv = [
      'stage,csi_code,csi_code_description',
      'A,01-00-000,X',
      '',
      '  ',
      'B,03-01-025,Y',
    ].join('\n');

    const codes = parseCostCodeDictionary(csv);
    expect(codes.size).toBe(2);
  });

  it('returns empty set for empty content', () => {
    expect(parseCostCodeDictionary('').size).toBe(0);
  });

  it('handles CRLF line endings', () => {
    const csv = 'stage,csi_code,desc\r\nA,01-00-000,X\r\nB,03-01-025,Y\r\n';
    const codes = parseCostCodeDictionary(csv);
    expect(codes.size).toBe(2);
  });
});
