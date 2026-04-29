import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from './PccApp';

describe('PccApp scaffold', () => {
  it('renders the preview-only banner', () => {
    render(<PccApp />);
    const previewLabel = screen.getByText(/preview only/i);
    const banner = previewLabel.closest('p');
    expect(banner, 'banner paragraph should wrap the preview label').not.toBeNull();
    expect(banner?.textContent).toMatch(/no live integrations/i);
  });

  it('renders every PCC MVP surface label and description from @hbc/models/pcc', () => {
    const { container } = render(<PccApp />);
    const list = container.querySelector('[data-pcc-surface-list]');
    expect(list, 'surface list root should render').not.toBeNull();
    for (const id of PCC_MVP_SURFACE_IDS) {
      const surface = PCC_MVP_SURFACES[id];
      const item = list?.querySelector(`[data-pcc-surface-id="${id}"]`);
      expect(item, `surface row for ${id} should render`).not.toBeNull();
      expect(item?.textContent).toContain(surface.displayName);
      expect(item?.textContent).toContain(surface.description);
    }
  });
});
