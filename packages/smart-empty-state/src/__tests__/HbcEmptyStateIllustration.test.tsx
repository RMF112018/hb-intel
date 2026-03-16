import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HbcEmptyStateIllustration } from '../components/HbcEmptyStateIllustration.js';

describe('HbcEmptyStateIllustration', () => {
  // ---------- classification → default icon ----------

  it('first-use renders Search icon', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="first-use" />,
    );
    expect(container.querySelector('[data-testid="icon-Search"]')).not.toBeNull();
  });

  it('truly-empty renders StatusDraftIcon', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="truly-empty" />,
    );
    expect(container.querySelector('[data-testid="icon-StatusDraftIcon"]')).not.toBeNull();
  });

  it('filter-empty renders Filter icon', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="filter-empty" />,
    );
    expect(container.querySelector('[data-testid="icon-Filter"]')).not.toBeNull();
  });

  it('permission-empty renders HardHat icon', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="permission-empty" />,
    );
    expect(container.querySelector('[data-testid="icon-HardHat"]')).not.toBeNull();
  });

  it('loading-failed renders StatusAttentionIcon', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="loading-failed" />,
    );
    expect(container.querySelector('[data-testid="icon-StatusAttentionIcon"]')).not.toBeNull();
  });

  // ---------- illustrationKey override ----------

  it('explicit illustrationKey overrides classification default', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="truly-empty" illustrationKey="filter" />,
    );
    // Should render Filter icon instead of StatusDraftIcon
    expect(container.querySelector('[data-testid="icon-Filter"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="icon-StatusDraftIcon"]')).toBeNull();
  });

  it('unknown illustrationKey falls back to StatusInfoIcon', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="truly-empty" illustrationKey="nonexistent" />,
    );
    expect(container.querySelector('[data-testid="icon-StatusInfoIcon"]')).not.toBeNull();
  });

  // ---------- size variants ----------

  it('size sm passes to icon', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="truly-empty" size="sm" />,
    );
    const icon = container.querySelector('[data-testid="icon-StatusDraftIcon"]');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('data-size')).toBe('sm');
  });

  it('size md is default', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="truly-empty" />,
    );
    const icon = container.querySelector('[data-testid="icon-StatusDraftIcon"]');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('data-size')).toBe('md');
  });

  it('size lg passes to icon', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="truly-empty" size="lg" />,
    );
    const icon = container.querySelector('[data-testid="icon-StatusDraftIcon"]');
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('data-size')).toBe('lg');
  });

  // ---------- accessibility & data attributes ----------

  it('root element has aria-hidden="true"', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="truly-empty" />,
    );
    const root = container.querySelector('[data-testid="empty-state-illustration"]');
    expect(root).not.toBeNull();
    expect(root!.getAttribute('aria-hidden')).toBe('true');
  });

  it('data-classification attribute set', () => {
    const { container } = render(
      <HbcEmptyStateIllustration classification="truly-empty" />,
    );
    const root = container.querySelector('[data-testid="empty-state-illustration"]');
    expect(root).not.toBeNull();
    expect(root!.getAttribute('data-classification')).toBe('truly-empty');
  });
});
