/**
 * Phase-04 audit G-09 — governed file-input primitive.
 *
 * Verifies the full contract of SafetyFileInput:
 *   - keyboard activation (Enter / Space) opens the file picker,
 *   - selecting / replacing a file calls onFileSelected,
 *   - the clear control invokes onClear,
 *   - disabled suppresses trigger, clear, and the hidden input,
 *   - aria associations (labelledby / describedby / errormessage) are
 *     populated correctly so the primitive is programmatically labeled.
 */
import { useState, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SafetyFileInput } from '../components/SafetyFileInput.js';

function makeFile(name = 'checklist.xlsx', size = 2048): File {
  return new File(['stub'.repeat(Math.max(1, Math.floor(size / 4)))], name, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function Controlled({
  initial = null,
  onSelect,
  onClearSpy,
  ...rest
}: {
  initial?: File | null;
  onSelect?: (file: File | null) => void;
  onClearSpy?: () => void;
} & Partial<React.ComponentProps<typeof SafetyFileInput>>): ReactNode {
  const [file, setFile] = useState<File | null>(initial);
  return (
    <SafetyFileInput
      label="Checklist workbook (.xlsx)"
      accept=".xlsx"
      selectedFile={file}
      onFileSelected={(f) => {
        setFile(f);
        onSelect?.(f);
      }}
      onClear={() => {
        setFile(null);
        onClearSpy?.();
      }}
      {...rest}
    />
  );
}

describe('SafetyFileInput — governed primitive contract (audit G-09)', () => {
  it('renders a labeled group so the whole control has a programmatic name', () => {
    render(<Controlled />);
    const group = screen.getByRole('group', { name: /checklist workbook/i });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-labelledby');
  });

  it('shows "Choose file" when no file is selected and "Replace file" once one is', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Controlled onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: /choose file/i })).toBeInTheDocument();
    expect(screen.getByText('No file selected')).toBeInTheDocument();

    const hidden = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(hidden).not.toBeNull();
    await user.upload(hidden, makeFile('first.xlsx'));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /replace file/i })).toBeInTheDocument();
    expect(screen.getByText(/first\.xlsx/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/first\.xlsx/);
  });

  it('keyboard activation (Enter) on the trigger opens the picker', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const trigger = screen.getByRole('button', { name: /choose file/i });
    trigger.focus();
    expect(trigger).toHaveFocus();

    const hidden = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(hidden, 'click');
    await user.keyboard('{Enter}');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('keyboard activation (Space) on the trigger opens the picker', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const trigger = screen.getByRole('button', { name: /choose file/i });
    trigger.focus();

    const hidden = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(hidden, 'click');
    await user.keyboard(' ');
    expect(clickSpy).toHaveBeenCalled();
  });

  it('replace-file reports the new file through onFileSelected without needing a separate flow', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Controlled initial={makeFile('old.xlsx')} onSelect={onSelect} />);

    const hidden = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(hidden, makeFile('new.xlsx'));
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'new.xlsx' }));
    expect(screen.getByText(/new\.xlsx/)).toBeInTheDocument();
  });

  it('clear control invokes onClear and clears the displayed filename', async () => {
    const user = userEvent.setup();
    const onClearSpy = vi.fn();
    render(<Controlled initial={makeFile('to-clear.xlsx')} onClearSpy={onClearSpy} />);

    const clear = screen.getByRole('button', { name: /clear file/i });
    await user.click(clear);

    expect(onClearSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByText('No file selected')).toBeInTheDocument();
  });

  it('disabled suppresses the trigger, clear control, and underlying input', () => {
    render(<Controlled initial={makeFile('locked.xlsx')} disabled />);
    const trigger = screen.getByRole('button', { name: /replace file/i });
    expect(trigger).toBeDisabled();
    // Clear button is hidden when disabled per contract.
    expect(screen.queryByRole('button', { name: /clear file/i })).toBeNull();
    const hidden = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(hidden).toBeDisabled();
  });

  it('errorText is associated via aria-errormessage and marked invalid', () => {
    render(<Controlled errorText="Select a workbook under 5 MB" />);
    const trigger = screen.getByRole('button', { name: /choose file/i });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-errormessage');
    expect(screen.getByRole('alert')).toHaveTextContent(/under 5 MB/);
  });

  it('helpText is associated via aria-describedby when present', () => {
    render(<Controlled helpText="v1 Safety Checklist only." />);
    const trigger = screen.getByRole('button', { name: /choose file/i });
    expect(trigger).toHaveAttribute('aria-describedby');
    expect(trigger.getAttribute('aria-describedby')).toMatch(/help/);
  });
});
