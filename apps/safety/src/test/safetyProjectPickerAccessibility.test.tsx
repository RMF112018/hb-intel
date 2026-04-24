import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SafetyProjectPicker } from '../components/SafetyProjectPicker.js';

const entries = [
  {
    recordKey: '1',
    projectName: 'Alpha',
    projectNumber: 'P-1',
    sourceClassification: 'project-only',
  },
  {
    recordKey: '2',
    projectName: 'Bravo',
    projectNumber: 'P-2',
    sourceClassification: 'project-only',
  },
];

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

vi.mock('@hbc/spfx/project-sites/search-seam', () => ({
  SCOPE_ALL: 'all',
  EMPTY_FILTERS: {},
  useProjectSites: () => ({
    status: 'success',
    entries,
  }),
  applyProjectSitesPipeline: ({ entries: source }: any) => source,
}));

vi.mock('@hbc/ui-kit', () => ({
  HbcTypography: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('../components/SafetyStatusPanel.js', () => ({
  SafetyStatusPanel: ({ description }: any) => <div>{description}</div>,
}));

describe('SafetyProjectPicker accessibility semantics', () => {
  it('announces highlighted result and supports Home/End keyboard movement', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <SafetyProjectPicker
        label="Project"
        selected={null}
        onSelect={onSelect}
      />,
    );
    const input = screen.getByRole('textbox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{End}');
    expect(screen.getByRole('status')).toHaveTextContent(/2 result\(s\). Highlighted Bravo P-2/i);
    await user.keyboard('{Home}');
    expect(screen.getByRole('status')).toHaveTextContent(/2 result\(s\). Highlighted Alpha P-1/i);
  });
});
