import { describe, expect, it } from 'vitest';
import {
  PROJECT_SETUP_COACHING_PROMPTS,
  getCoachingPrompt,
} from './coaching-prompt-registry.js';

// ─── PROJECT_SETUP_COACHING_PROMPTS ──────────────────────────────────────────

describe('PROJECT_SETUP_COACHING_PROMPTS', () => {
  it('has exactly 4 prompts', () => {
    expect(PROJECT_SETUP_COACHING_PROMPTS).toHaveLength(4);
  });

  it('all prompts have maxTier: essential', () => {
    for (const prompt of PROJECT_SETUP_COACHING_PROMPTS) {
      expect(prompt.maxTier).toBe('essential');
    }
  });

  it('every prompt has a unique promptId', () => {
    const ids = PROJECT_SETUP_COACHING_PROMPTS.map((p) => p.promptId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every prompt has non-empty text and context', () => {
    for (const prompt of PROJECT_SETUP_COACHING_PROMPTS) {
      expect(prompt.text.length).toBeGreaterThan(0);
      expect(prompt.context.length).toBeGreaterThan(0);
    }
  });
});

// ─── getCoachingPrompt ───────────────────────────────────────────────────────

describe('getCoachingPrompt', () => {
  it('returns correct prompt by ID', () => {
    const prompt = getCoachingPrompt('setup-step1-tip');
    expect(prompt).toBeDefined();
    expect(prompt!.promptId).toBe('setup-step1-tip');
    expect(prompt!.context).toBe('Setup form, Step 1');
  });

  it('returns undefined for nonexistent ID', () => {
    expect(getCoachingPrompt('nonexistent')).toBeUndefined();
  });

  it('finds all 4 registered prompts', () => {
    const ids = ['setup-step1-tip', 'setup-step2-department', 'setup-step3-lead', 'status-provisioning'];
    for (const id of ids) {
      expect(getCoachingPrompt(id)).toBeDefined();
    }
  });
});
