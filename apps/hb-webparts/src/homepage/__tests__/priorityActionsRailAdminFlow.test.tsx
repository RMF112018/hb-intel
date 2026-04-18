import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('../data/spContext.js', () => ({
  getSiteUrl: () => 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral',
}));

vi.mock('../data/priorityActionsConfigListSource.js', () => ({
  fetchPriorityActionsConfigWithDiagnostics: vi.fn(),
}));

vi.mock('../data/priorityActionsItemsListSource.js', () => ({
  fetchPriorityActionsItems: vi.fn(),
}));

vi.mock('../data/priorityActionsNormalization.js', () => ({
  normalizeItemRows: vi.fn(),
}));

vi.mock('../data/priorityActionsValidation.js', () => ({
  validatePriorityRailDraft: vi.fn(() => ({ valid: true, issues: [] })),
  validateItem: vi.fn(() => []),
}));

vi.mock('../data/priorityActionsAdminPermissions.js', () => ({
  resolvePriorityActionsAdminPermissions: vi.fn(),
}));

vi.mock('../data/priorityActionsListWriter.js', () => ({
  savePriorityRailBandConfig: vi.fn(),
  savePriorityRailItems: vi.fn(),
  archivePriorityRailItem: vi.fn(),
  reorderPriorityRailItems: vi.fn(),
}));

vi.mock('../data/usePriorityActionsData.js', () => ({
  invalidatePriorityActionsCache: vi.fn(),
}));

import { PriorityActionsRailAdmin } from '../../webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.js';
import { fetchPriorityActionsConfigWithDiagnostics } from '../data/priorityActionsConfigListSource.js';
import { fetchPriorityActionsItems } from '../data/priorityActionsItemsListSource.js';
import { normalizeItemRows } from '../data/priorityActionsNormalization.js';
import { resolvePriorityActionsAdminPermissions } from '../data/priorityActionsAdminPermissions.js';
import { validateItem } from '../data/priorityActionsValidation.js';
import {
  savePriorityRailBandConfig,
  savePriorityRailItems,
  archivePriorityRailItem,
  reorderPriorityRailItems,
} from '../data/priorityActionsListWriter.js';

const mockedFetchConfig = fetchPriorityActionsConfigWithDiagnostics as unknown as ReturnType<typeof vi.fn>;
const mockedFetchItems = fetchPriorityActionsItems as unknown as ReturnType<typeof vi.fn>;
const mockedNormalize = normalizeItemRows as unknown as ReturnType<typeof vi.fn>;
const mockedResolvePermissions = resolvePriorityActionsAdminPermissions as unknown as ReturnType<typeof vi.fn>;
const mockedValidateItem = validateItem as unknown as ReturnType<typeof vi.fn>;
const mockedSaveConfig = savePriorityRailBandConfig as unknown as ReturnType<typeof vi.fn>;
const mockedSaveItems = savePriorityRailItems as unknown as ReturnType<typeof vi.fn>;
const mockedArchive = archivePriorityRailItem as unknown as ReturnType<typeof vi.fn>;
const mockedReorder = reorderPriorityRailItems as unknown as ReturnType<typeof vi.fn>;

const SITE_URL = 'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

const CONFIG = {
  id: 7,
  title: 'Priority Actions',
  bandKey: 'homepage-primary',
  enabled: true,
  isActive: true,
  headingText: 'Priority Actions',
  overflowLabel: 'More tools',
  showHeading: true,
  showBadges: true,
  desktopLayoutMode: 'rail',
  tabletLayoutMode: 'grid',
  mobileLayoutMode: 'sheet-trigger',
  maxVisibleDesktop: 5,
  maxVisibleLaptop: 5,
  maxVisibleTabletLandscape: 4,
  maxVisibleTabletPortrait: 4,
  maxVisiblePhone: 4,
  openExternalInNewTabByDefault: true,
  adminNotes: '',
  modified: '2026-04-17T00:00:00Z',
};

const ITEM_A = {
  id: 101,
  actionKey: 'a',
  title: 'A',
  href: '/a',
  description: '',
  iconKey: '',
  badgeLabel: '',
  badgeVariant: 'neutral',
  priority: 'primary',
  groupKey: '',
  groupTitle: '',
  sortOrder: 10,
  overflowOnly: false,
  mobilePriority: 100,
  audienceMode: 'all',
  audienceKeys: [],
  isExternal: false,
  openInNewTab: false,
  visibleDesktop: true,
  visibleLaptop: true,
  visibleTabletLandscape: true,
  visibleTabletPortrait: true,
  visiblePhone: true,
  startsAtUtc: null,
  endsAtUtc: null,
};

const ITEM_B = {
  ...ITEM_A,
  id: 202,
  actionKey: 'b',
  title: 'B',
  href: '/b',
  sortOrder: 20,
};

beforeEach(() => {
  cleanup();
  mockedFetchConfig.mockReset();
  mockedFetchItems.mockReset();
  mockedNormalize.mockReset();
  mockedResolvePermissions.mockReset();
  mockedValidateItem.mockReset();
  mockedSaveConfig.mockReset();
  mockedSaveItems.mockReset();
  mockedArchive.mockReset();
  mockedReorder.mockReset();

  mockedFetchConfig.mockResolvedValue({ config: CONFIG, activeConfigCountForBand: 1 });
  mockedFetchItems.mockResolvedValue([]);
  mockedNormalize.mockReturnValue([ITEM_A, ITEM_B]);
  mockedValidateItem.mockReturnValue([]);
  mockedResolvePermissions.mockResolvedValue({
    status: 'resolved',
    posture: 'editable',
    permissions: {
      canView: true,
      canEdit: true,
      canPublish: true,
      canArchive: true,
      canReorder: true,
    },
    user: { isSiteAdmin: false, title: 'Maintainer' },
  });

  mockedSaveConfig.mockResolvedValue({ ok: true, itemId: CONFIG.id });
  mockedSaveItems.mockImplementation(async (_site: string, items: Array<{ itemId?: number }>) => items.map((i) => ({ ok: true, itemId: i.itemId ?? 999 })));
  mockedArchive.mockResolvedValue({ ok: true, itemId: ITEM_A.id });
  mockedReorder.mockResolvedValue([{ ok: true, itemId: ITEM_B.id }, { ok: true, itemId: ITEM_A.id }]);
});

describe('PriorityActionsRailAdmin identity + lifecycle seams', () => {
  it('reorder + save targets persisted IDs, not draft array index', async () => {
    render(<PriorityActionsRailAdmin siteUrl={SITE_URL} />);

    await waitFor(() => expect(mockedFetchConfig).toHaveBeenCalledWith(SITE_URL));

    const moveUpButtons = await screen.findAllByRole('button', { name: 'Move up' });
    fireEvent.click(moveUpButtons[1]);

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

    await waitFor(() => expect(mockedSaveItems).toHaveBeenCalledTimes(1));
    const payload = mockedSaveItems.mock.calls[0][1] as Array<{ itemId?: number }>;
    expect(payload.map((entry) => entry.itemId)).toEqual([202, 101]);

    await waitFor(() => expect(mockedReorder).toHaveBeenCalledTimes(1));
    const reorderPayload = mockedReorder.mock.calls[0][1] as Array<{ itemId: number; sortOrder: number }>;
    expect(reorderPayload.map((entry) => entry.itemId)).toEqual([202, 101]);
  });

  it('archive remains an intent until save and can be discarded', async () => {
    render(<PriorityActionsRailAdmin siteUrl={SITE_URL} />);

    await waitFor(() => expect(mockedFetchConfig).toHaveBeenCalledWith(SITE_URL));

    const archiveButtons = await screen.findAllByRole('button', { name: 'Archive' });
    fireEvent.click(archiveButtons[0]);

    expect(mockedArchive).toHaveBeenCalledTimes(0);

    const discardButtons = screen.getAllByRole('button', { name: 'Discard' });
    fireEvent.click(discardButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Discard Changes' }));

    expect(screen.queryByText(/archived on save/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await waitFor(() => expect(mockedArchive).toHaveBeenCalledTimes(0));
  });

  it('preview exposes five device classes and shows mapping normalization state', async () => {
    render(<PriorityActionsRailAdmin siteUrl={SITE_URL} />);

    await waitFor(() => expect(mockedFetchConfig).toHaveBeenCalledWith(SITE_URL));

    expect(screen.getByRole('button', { name: 'Desktop' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Laptop' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Tablet Landscape' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Tablet Portrait' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Phone' })).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Phone' }));
    expect(screen.getByText(/Authored -> Resolved:/i).textContent).toContain('sheet-trigger -> compact');
  });

  it('library filters segment rows by invalid status', async () => {
    mockedValidateItem.mockImplementation((_draft: unknown, index?: number) => (
      index === 1 ? [{ kind: 'missing-href', message: 'Missing href', field: 'href', rowId: 1 }] : []
    ));

    render(<PriorityActionsRailAdmin siteUrl={SITE_URL} />);
    await waitFor(() => expect(mockedFetchConfig).toHaveBeenCalledWith(SITE_URL));

    expect((await screen.findAllByRole('button', { name: 'Archive' })).length).toBe(2);
    fireEvent.click(screen.getByRole('button', { name: /Invalid \(1\)/i }));
    expect((await screen.findAllByRole('button', { name: 'Archive' })).length).toBe(1);
  });

  it('read-only posture blocks mutating controls but preserves preview navigation', async () => {
    mockedResolvePermissions.mockResolvedValueOnce({
      status: 'resolved',
      posture: 'read-only',
      permissions: {
        canView: true,
        canEdit: false,
        canPublish: false,
        canArchive: false,
        canReorder: false,
      },
      user: { isSiteAdmin: false, title: 'Viewer' },
    });

    render(<PriorityActionsRailAdmin siteUrl={SITE_URL} />);
    await waitFor(() => expect(mockedFetchConfig).toHaveBeenCalledWith(SITE_URL));

    expect(screen.getByRole('button', { name: 'Publish' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Save' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: '+ Add Action' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('button', { name: 'Phone' })).not.toBeNull();
  });

  it('insufficient permission posture blocks authoring workspace load', async () => {
    mockedResolvePermissions.mockResolvedValueOnce({
      status: 'resolved',
      posture: 'insufficient-permission',
      permissions: {
        canView: false,
        canEdit: false,
        canPublish: false,
        canArchive: false,
        canReorder: false,
      },
      user: { isSiteAdmin: false, title: 'Denied' },
    });

    render(<PriorityActionsRailAdmin siteUrl={SITE_URL} />);
    await waitFor(() => expect(mockedResolvePermissions).toHaveBeenCalledWith(SITE_URL));

    expect(screen.queryByText('Band Settings')).toBeNull();
    expect(screen.getByText(/Insufficient permission:/i)).not.toBeNull();
    expect(mockedFetchConfig).not.toHaveBeenCalled();
  });
});
