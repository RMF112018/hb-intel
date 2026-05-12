import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import type { ComponentProps } from 'react';
import {
  EMPTY_PCC_DOCUMENT_CONTROL_HOME_FEED,
  SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED,
} from '@hbc/models/pcc';
import { PccDocumentControlCard } from './PccDocumentControlCard';
import { PccBentoGrid } from '../../layout/PccBentoGrid';

function renderCard(props?: Partial<ComponentProps<typeof PccDocumentControlCard>>) {
  return render(
    <PccBentoGrid forceMode="desktop">
      <PccDocumentControlCard {...props} />
    </PccBentoGrid>,
  );
}

describe('PccDocumentControlCard feed tabs', () => {
  it('renders My Recent Files as default active tab and five rows', () => {
    const { container } = renderCard();
    const card = container.querySelector('[data-pcc-document-control-card]');
    expect(card).not.toBeNull();
    expect(card!.getAttribute('data-pcc-document-control-feed-mode')).toBe('my-recent-files');
    const activePanel = card!.querySelector(
      '[data-pcc-document-control-feed-panel="my-recent-files"][data-pcc-document-control-feed-panel-state="active"]',
    );
    expect(activePanel).not.toBeNull();
    expect(activePanel!.querySelectorAll('[data-pcc-document-control-feed-item]')).toHaveLength(5);
  });

  it('switches to Latest Changes and emits change-kind markers', () => {
    const { container } = renderCard();
    const latestTab = container.querySelector<HTMLButtonElement>(
      '[data-pcc-document-control-feed-tab="latest-changes"]',
    );
    expect(latestTab).not.toBeNull();
    fireEvent.click(latestTab!);

    const activePanel = container.querySelector(
      '[data-pcc-document-control-feed-panel="latest-changes"][data-pcc-document-control-feed-panel-state="active"]',
    );
    expect(activePanel).not.toBeNull();

    const rows = activePanel!.querySelectorAll('[data-pcc-document-control-feed-item]');
    expect(rows).toHaveLength(5);
    for (const row of rows) {
      expect(row.getAttribute('data-pcc-document-control-feed-change-kind')).toMatch(
        /^(added|updated)$/,
      );
    }
  });

  it('renders empty-state copy for selected empty feed', () => {
    const { container } = renderCard({ homeFeed: EMPTY_PCC_DOCUMENT_CONTROL_HOME_FEED });
    const card = container.querySelector('[data-pcc-document-control-card]');
    expect(card).not.toBeNull();

    expect(card!.textContent).toContain('No items available in this view yet.');
    const rows = card!.querySelectorAll('[data-pcc-document-control-feed-item]');
    expect(rows).toHaveLength(0);
  });

  it('non-preview state renders preview-state posture, not feed rows', () => {
    const { container } = renderCard({ state: 'error' });
    expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-document-control-feed-item]')).toBeNull();
  });

  it('uses provided feed order without client-side resorting', () => {
    const reversed = {
      myRecentFiles: [...SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED.myRecentFiles].reverse(),
      latestChanges: [...SAMPLE_PCC_DOCUMENT_CONTROL_HOME_FEED.latestChanges].reverse(),
    };
    const { container } = renderCard({ homeFeed: reversed });
    const first = container.querySelector('[data-pcc-document-control-feed-item]');
    expect(first).not.toBeNull();
    expect(first!.getAttribute('data-pcc-document-control-feed-item-id')).toBe(
      reversed.myRecentFiles[0]!.id,
    );
  });
});
