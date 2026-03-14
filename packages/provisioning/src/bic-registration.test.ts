import { describe, expect, it, vi } from 'vitest';
import {
  createProjectSetupBicRegistration,
  PROVISIONING_BIC_MODULE_KEY,
  PROVISIONING_BIC_MODULE_LABEL,
} from './bic-registration.js';

describe('createProjectSetupBicRegistration', () => {
  it('produces a registration with the fixed module key and label', () => {
    const queryFn = vi.fn().mockResolvedValue([]);
    const reg = createProjectSetupBicRegistration(queryFn);
    expect(reg.key).toBe(PROVISIONING_BIC_MODULE_KEY);
    expect(reg.key).toBe('provisioning');
    expect(reg.label).toBe(PROVISIONING_BIC_MODULE_LABEL);
    expect(reg.label).toBe('Project Setup');
    expect(reg.queryFn).toBe(queryFn);
  });

  it('delegates queryFn calls to the provided function', async () => {
    const mockItems = [{ itemKey: 'provisioning:req-1' }];
    const queryFn = vi.fn().mockResolvedValue(mockItems);
    const reg = createProjectSetupBicRegistration(queryFn);
    const result = await reg.queryFn('user-1');
    expect(queryFn).toHaveBeenCalledWith('user-1');
    expect(result).toBe(mockItems);
  });
});
