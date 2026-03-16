import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcFormSection } from '../HbcFormSection.js';

function renderSection(props: Partial<React.ComponentProps<typeof HbcFormSection>> = {}) {
  return render(
    <HbcThemeProvider>
      <HbcFormSection title="General" {...props}>
        {props.children ?? <div>section content</div>}
      </HbcFormSection>
    </HbcThemeProvider>,
  );
}

describe('HbcFormSection', () => {
  it('renders with data-hbc-ui="form-section"', () => {
    const { container } = renderSection();
    const el = container.querySelector('[data-hbc-ui="form-section"]');
    expect(el).toBeInTheDocument();
  });

  it('renders title as an h4 element', () => {
    renderSection({ title: 'Contact Info' });
    const heading = screen.getByRole('heading', { level: 4 });
    expect(heading).toHaveTextContent('Contact Info');
  });

  it('renders description text when provided', () => {
    renderSection({ description: 'Fill in your details' });
    expect(screen.getByText('Fill in your details')).toBeInTheDocument();
  });

  it('omits description element when not provided', () => {
    const { container } = renderSection({ title: 'No Desc' });
    // Description is rendered in a <p> tag inside the titleGroup — should be absent
    const titleGroup = container.querySelector('[data-hbc-ui="form-section"]');
    const paragraphs = titleGroup?.querySelectorAll('p') ?? [];
    expect(paragraphs).toHaveLength(0);
  });

  it('renders collapsible toggle with aria-expanded', () => {
    renderSection({ collapsible: true });
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles aria-expanded on click', async () => {
    const user = userEvent.setup();
    renderSection({ collapsible: true, defaultExpanded: true });
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles on keyboard Enter', async () => {
    const user = userEvent.setup();
    renderSection({ collapsible: true, defaultExpanded: true });
    const toggle = screen.getByRole('button');

    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles on keyboard Space', async () => {
    const user = userEvent.setup();
    renderSection({ collapsible: true, defaultExpanded: true });
    const toggle = screen.getByRole('button');

    toggle.focus();
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});
