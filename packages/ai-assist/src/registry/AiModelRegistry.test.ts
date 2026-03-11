import { describe, it, expect, beforeEach } from 'vitest';
import { AiModelRegistry } from './AiModelRegistry.js';
import { createMockAiModelRegistration } from '../../testing/createMockAiModelRegistration.js';
import type { IAiActionInvokeContext } from '../types/index.js';

const baseContext: IAiActionInvokeContext = {
  userId: 'user-1',
  role: 'estimator',
  recordType: 'scorecard',
  recordId: 'sc-1',
  complexity: 'standard',
};

beforeEach(() => {
  AiModelRegistry._clearForTests();
});

describe('AiModelRegistry', () => {
  describe('registerModel', () => {
    it('registers and resolves a model', () => {
      const model = createMockAiModelRegistration();
      AiModelRegistry.registerModel(model);
      expect(AiModelRegistry.resolveModel('gpt-4o', baseContext)).toBe(model);
    });

    it('rejects duplicate modelKey', () => {
      AiModelRegistry.registerModel(createMockAiModelRegistration());
      expect(() => AiModelRegistry.registerModel(createMockAiModelRegistration())).toThrow(
        '[ai-assist] Duplicate model registration: "gpt-4o"',
      );
    });

    it('throws on empty modelKey', () => {
      expect(() =>
        AiModelRegistry.registerModel(createMockAiModelRegistration({ modelKey: '' })),
      ).toThrow('modelKey must be non-empty');
    });

    it('throws on empty displayName', () => {
      expect(() =>
        AiModelRegistry.registerModel(createMockAiModelRegistration({ displayName: '' })),
      ).toThrow('displayName must be non-empty');
    });

    it('throws on empty deploymentName', () => {
      expect(() =>
        AiModelRegistry.registerModel(createMockAiModelRegistration({ deploymentName: '' })),
      ).toThrow('deploymentName must be non-empty');
    });

    it('throws on empty deploymentVersion', () => {
      expect(() =>
        AiModelRegistry.registerModel(createMockAiModelRegistration({ deploymentVersion: '' })),
      ).toThrow('deploymentVersion must be non-empty');
    });
  });

  describe('resolveModel', () => {
    it('throws for unknown model key', () => {
      expect(() => AiModelRegistry.resolveModel('unknown', baseContext)).toThrow(
        '[ai-assist] Unknown model key: "unknown"',
      );
    });

    it('throws when role not authorized', () => {
      AiModelRegistry.registerModel(
        createMockAiModelRegistration({ modelKey: 'restricted', allowedRoles: ['admin'] }),
      );
      expect(() => AiModelRegistry.resolveModel('restricted', baseContext)).toThrow(
        '[ai-assist] Role not authorized for model "restricted": "estimator"',
      );
    });

    it('allows all roles when allowedRoles undefined', () => {
      AiModelRegistry.registerModel(createMockAiModelRegistration());
      expect(AiModelRegistry.resolveModel('gpt-4o', baseContext)).toBeDefined();
    });
  });

  describe('listModels', () => {
    it('returns all registered models', () => {
      AiModelRegistry.registerModel(createMockAiModelRegistration({ modelKey: 'm1' }));
      AiModelRegistry.registerModel(createMockAiModelRegistration({ modelKey: 'm2' }));
      expect(AiModelRegistry.listModels()).toHaveLength(2);
    });
  });
});
