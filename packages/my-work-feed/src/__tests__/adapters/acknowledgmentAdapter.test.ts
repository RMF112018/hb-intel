import { describe, it, expect } from 'vitest';
import { acknowledgmentAdapter } from '../../adapters/acknowledgmentAdapter.js';
import { createMockRuntimeContext, createMockMyWorkQuery } from '@hbc/my-work-feed/testing';

describe('acknowledgmentAdapter', () => {
  it('reports isEnabled as false', () => {
    expect(acknowledgmentAdapter.isEnabled(createMockRuntimeContext())).toBe(false);
  });

  it('returns empty array from load', async () => {
    const items = await acknowledgmentAdapter.load(
      createMockMyWorkQuery(),
      createMockRuntimeContext(),
    );
    expect(items).toEqual([]);
  });

  it('has source set to acknowledgment', () => {
    expect(acknowledgmentAdapter.source).toBe('acknowledgment');
  });
});
