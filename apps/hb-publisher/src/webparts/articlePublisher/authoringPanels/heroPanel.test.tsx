import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { HeroPanel, hasAdvancedHeroOverrides } from './HeroPanel.js';
import type { PublisherArticleRow } from '../../../data/publisherAdapter/index.js';

afterEach(cleanup);

function baseDraft(overrides: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'Untitled',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'untitled',
    TemplateKey: 'ps-inprogress-monthly-v1',
    WorkflowState: 'draft',
    Subhead: '',
    SummaryExcerpt: '',
    BodyRichText: '',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-01T00:00:00Z',
    HeroPrimaryImage: '',
    HeroPrimaryImageAltText: '',
    ...overrides,
  } as PublisherArticleRow;
}

describe('HeroPanel progressive disclosure', () => {
  it('keeps the hero image picker and alt text on the primary path', () => {
    render(<HeroPanel draft={baseDraft()} onChange={vi.fn()} />);
    expect(screen.getByLabelText(/Hero image source URL/i)).toBeTruthy();
    expect(screen.getByLabelText(/Alt text/i)).toBeTruthy();
  });

  it('wraps headline override, eyebrow, category, theme, and metadata toggle inside a collapsed disclosure', () => {
    render(<HeroPanel draft={baseDraft()} onChange={vi.fn()} />);
    const section = screen.getByTestId('hero-advanced-section') as HTMLDetailsElement;
    expect(section.tagName).toBe('DETAILS');
    expect(section.open).toBe(false);
    // Fields still exist in the DOM inside the collapsed section — the
    // native <details> element hides them visually but they remain
    // keyboard-discoverable once the section is expanded.
    expect(section.querySelector('input[placeholder*="article headline"]')).toBeTruthy();
    expect(section.querySelector('input[placeholder*="above the headline"]')).toBeTruthy();
    expect(section.textContent).toMatch(/Hero theme/);
    expect(section.textContent).toMatch(/Show article metadata on the hero/);
  });

  it('starts the advanced section open when the seeded draft already has overrides', () => {
    render(
      <HeroPanel
        draft={baseDraft({ HeroEyebrow: 'From the field' })}
        onChange={vi.fn()}
      />,
    );
    const section = screen.getByTestId('hero-advanced-section') as HTMLDetailsElement;
    expect(section.open).toBe(true);
  });

  it('uses the bound ProjectName as the category-label placeholder', () => {
    render(
      <HeroPanel draft={baseDraft({ ProjectName: 'Bayshore Tower' })} onChange={vi.fn()} />,
    );
    const section = screen.getByTestId('hero-advanced-section') as HTMLDetailsElement;
    section.open = true;
    const input = section.querySelector(
      'input[placeholder="Bayshore Tower"]',
    ) as HTMLInputElement | null;
    expect(input).not.toBeNull();
  });

  it('edits to the hero image still flow through onChange on the primary path', () => {
    const onChange = vi.fn();
    render(<HeroPanel draft={baseDraft()} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/Hero image source URL/i), {
      target: { value: 'https://img.example/new.jpg' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ HeroPrimaryImage: 'https://img.example/new.jpg' }),
    );
  });

  it('keeps the advanced section closed when HeroCategoryLabel carries only the project-derived system default', () => {
    render(
      <HeroPanel
        draft={baseDraft({
          ProjectName: 'Bayshore Tower',
          HeroCategoryLabel: 'Bayshore Tower',
        })}
        onChange={vi.fn()}
      />,
    );
    const section = screen.getByTestId('hero-advanced-section') as HTMLDetailsElement;
    expect(section.open).toBe(false);
  });

  it('opens the advanced section when the author has typed a category different from the project name', () => {
    render(
      <HeroPanel
        draft={baseDraft({
          ProjectName: 'Bayshore Tower',
          HeroCategoryLabel: 'Field Story',
        })}
        onChange={vi.fn()}
      />,
    );
    const section = screen.getByTestId('hero-advanced-section') as HTMLDetailsElement;
    expect(section.open).toBe(true);
  });
});

describe('hasAdvancedHeroOverrides', () => {
  it('is false for a freshly-seeded draft with no overrides', () => {
    expect(hasAdvancedHeroOverrides(baseDraft())).toBe(false);
  });

  it('treats a HeroCategoryLabel that matches the bound project name as the system default, not an override', () => {
    expect(
      hasAdvancedHeroOverrides(
        baseDraft({ ProjectName: 'Riverside Tower', HeroCategoryLabel: 'Riverside Tower' }),
      ),
    ).toBe(false);
  });

  it('treats an authored HeroCategoryLabel that differs from the project name as an override', () => {
    expect(
      hasAdvancedHeroOverrides(
        baseDraft({ ProjectName: 'Riverside Tower', HeroCategoryLabel: 'Field Story' }),
      ),
    ).toBe(true);
  });

  it('treats a HeroCategoryLabel set without a bound project as an override', () => {
    expect(
      hasAdvancedHeroOverrides(baseDraft({ HeroCategoryLabel: 'Field Story' })),
    ).toBe(true);
  });

  it('still flags HeroTitle, HeroEyebrow, non-default HeroThemeVariant, and HeroShowMetadata as overrides', () => {
    expect(hasAdvancedHeroOverrides(baseDraft({ HeroTitle: 'Custom' }))).toBe(true);
    expect(hasAdvancedHeroOverrides(baseDraft({ HeroEyebrow: 'From the field' }))).toBe(true);
    expect(hasAdvancedHeroOverrides(baseDraft({ HeroThemeVariant: 'dark' }))).toBe(true);
    expect(hasAdvancedHeroOverrides(baseDraft({ HeroShowMetadata: true }))).toBe(true);
  });

  it('does not flag a HeroThemeVariant of `default` as an override', () => {
    expect(hasAdvancedHeroOverrides(baseDraft({ HeroThemeVariant: 'default' }))).toBe(false);
  });
});
