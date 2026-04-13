import * as React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, cleanup } from '@testing-library/react';

// Mock the read/write seams the admin app depends on.
vi.mock('../data/heroBannerListSource.js', () => ({
  fetchHeroBannerListConfig: vi.fn(),
}));
vi.mock('../data/heroBannerListWriter.js', () => ({
  saveHeroBannerConfig: vi.fn(),
}));

import { HbHeroBannerAdmin } from '../../webparts/hbHeroBannerAdmin/HbHeroBannerAdmin.js';
import { fetchHeroBannerListConfig } from '../data/heroBannerListSource.js';
import { saveHeroBannerConfig } from '../data/heroBannerListWriter.js';

const mockedFetch = fetchHeroBannerListConfig as unknown as ReturnType<typeof vi.fn>;
const mockedSave = saveHeroBannerConfig as unknown as ReturnType<typeof vi.fn>;

const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

beforeEach(() => {
  cleanup();
  mockedFetch.mockReset();
  mockedSave.mockReset();
});

describe('HbHeroBannerAdmin — Phase-02 Prompt-05 authoring flow', () => {
  it('loads the current config into the form and preview', async () => {
    mockedFetch.mockResolvedValueOnce({
      headline: 'Current headline',
      message: 'Current message',
      eyebrow: 'HB Central',
      enabled: true,
    });

    const { container } = render(<HbHeroBannerAdmin siteUrl={SITE_URL} />);

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledWith(SITE_URL));

    const titleInput = await screen.findByRole('textbox', { name: /Title/i }) as HTMLInputElement;
    expect(titleInput.value).toBe('Current headline');

    const preview = container.querySelector('[data-hbc-admin-preview="hero-banner"]');
    expect(preview).not.toBeNull();
    expect(within(preview as HTMLElement).getByText('Current headline')).not.toBeNull();
  });

  it('flips to dirty state on edit and enables Save', async () => {
    mockedFetch.mockResolvedValueOnce({
      headline: 'Start',
      enabled: true,
    });
    render(<HbHeroBannerAdmin siteUrl={SITE_URL} />);

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledWith(SITE_URL));
    const titleInput = await screen.findByRole('textbox', { name: /Title/i });
    const saveBtn = screen.getByRole('button', { name: /Save configuration/i });
    expect((saveBtn as HTMLButtonElement).disabled).toBe(true);

    fireEvent.change(titleInput, { target: { value: 'Edited' } });
    expect(screen.getByText(/You have unsaved changes/i)).not.toBeNull();
    expect((saveBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('guards Cancel with an in-component discard dialog (no browser prompt)', async () => {
    mockedFetch.mockResolvedValueOnce({ headline: 'Start', enabled: true });
    render(<HbHeroBannerAdmin siteUrl={SITE_URL} />);

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledWith(SITE_URL));
    const titleInput = await screen.findByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Edited' } });

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.getByRole('alertdialog', { name: /Discard unsaved changes/i })).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Discard changes/i }));
    const titleAfter = screen.getByRole('textbox', { name: /Title/i }) as HTMLInputElement;
    expect(titleAfter.value).toBe('Start');
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('saves the draft through the writer and re-reads the canonical config', async () => {
    mockedFetch.mockResolvedValueOnce({ headline: 'Start', enabled: true });
    mockedSave.mockResolvedValueOnce({ ok: true, itemId: 7 });
    mockedFetch.mockResolvedValueOnce({ headline: 'Edited', enabled: true });

    render(<HbHeroBannerAdmin siteUrl={SITE_URL} />);
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledWith(SITE_URL));
    const titleInput = await screen.findByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Edited' } });

    fireEvent.click(screen.getByRole('button', { name: /Save configuration/i }));

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));
    expect(mockedSave.mock.calls[0][0]).toBe(SITE_URL);
    expect(mockedSave.mock.calls[0][1]).toMatchObject({
      headline: 'Edited',
      enabled: true,
    });

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByText(/Saved\. The public Hero Banner will refresh/i),
    ).not.toBeNull();
  });

  it('surfaces save failures and keeps the draft dirty', async () => {
    mockedFetch.mockResolvedValueOnce({ headline: 'Start', enabled: true });
    mockedSave.mockResolvedValueOnce({ ok: false, error: 'Network is down.' });

    render(<HbHeroBannerAdmin siteUrl={SITE_URL} />);
    await waitFor(() => expect(mockedFetch).toHaveBeenCalledWith(SITE_URL));
    const titleInput = await screen.findByRole('textbox', { name: /Title/i });
    fireEvent.change(titleInput, { target: { value: 'Edited' } });
    fireEvent.click(screen.getByRole('button', { name: /Save configuration/i }));

    expect(await screen.findByText(/Save failed: Network is down/i)).not.toBeNull();
    // Still dirty → Save button still enabled.
    const saveBtnAfter = screen.getByRole('button', { name: /Save configuration/i }) as HTMLButtonElement;
    expect(saveBtnAfter.disabled).toBe(false);
  });
});
