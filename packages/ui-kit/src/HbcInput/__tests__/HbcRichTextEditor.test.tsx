import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcRichTextEditor } from '../HbcRichTextEditor.js';

function renderEditor(props: Partial<React.ComponentProps<typeof HbcRichTextEditor>> = {}) {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
  };
  return render(
    <HbcThemeProvider>
      <HbcRichTextEditor {...defaultProps} {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcRichTextEditor', () => {
  it('renders with data-hbc-ui="rich-text-editor"', () => {
    const { container } = renderEditor();
    const el = container.querySelector('[data-hbc-ui="rich-text-editor"]');
    expect(el).toBeInTheDocument();
  });

  it('renders label text', () => {
    renderEditor({ label: 'Comments' });
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('renders toolbar buttons for default actions', () => {
    renderEditor();
    // Default toolbar: bold, italic, underline, list, link
    expect(screen.getByRole('button', { name: 'bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'italic' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'underline' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'list' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'link' })).toBeInTheDocument();
  });

  it('disabled state applies', () => {
    const { container } = renderEditor({ disabled: true });
    // The editor wrapper gets the disabled class with opacity
    const editable = container.querySelector('[contenteditable]');
    expect(editable).toHaveAttribute('contenteditable', 'false');
  });

  it('validation message renders when provided', () => {
    renderEditor({ validationMessage: 'Content is required' });
    expect(screen.getByText('Content is required')).toBeInTheDocument();
  });

  it('custom toolbar prop controls which buttons appear', () => {
    renderEditor({ toolbar: ['bold', 'italic'] });
    expect(screen.getByRole('button', { name: 'bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'italic' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'underline' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'list' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'link' })).not.toBeInTheDocument();
  });
});
