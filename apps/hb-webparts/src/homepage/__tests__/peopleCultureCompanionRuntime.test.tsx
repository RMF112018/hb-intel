import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, within } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
import * as React from 'react';
import { PeopleCultureCompanion } from '../../webparts/peopleCultureCompanion/PeopleCultureCompanion.js';
import type {
  PeopleCultureCompanionConfig,
  PeopleCultureIntakeSubmission,
  PeopleCultureItem,
  PeopleCultureMilestoneCandidate,
} from '../webparts/peopleCultureSplitContracts.js';

function makeItem(overrides: Partial<PeopleCultureItem> & { id: string }): PeopleCultureItem {
  return {
    family: 'announcement',
    lifecycleState: 'live',
    title: `Item ${overrides.id}`,
    body: `Body ${overrides.id}`,
    approvalTrigger: 'standard',
    audience: { kind: 'companyWide' },
    homepage: { tier: 'supporting', overrideSource: 'systemDefault', isPinned: false },
    mediaSource: { kind: 'none' },
    publishedAt: '2026-04-01T00:00:00Z',
    ...overrides,
  };
}

function makeCandidate(id: string): PeopleCultureMilestoneCandidate {
  return {
    id,
    candidateType: 'birthday',
    personId: `u-${id}`,
    personDisplayName: `Person ${id}`,
    occursOn: '2026-04-15',
    generatedAt: '2026-04-01T00:00:00Z',
    sourceSystem: 'PeopleData',
    reviewState: 'pendingReview',
  };
}

function makeIntake(id: string): PeopleCultureIntakeSubmission {
  return {
    id,
    submittedBy: { id: `s-${id}`, displayName: `Submitter ${id}` },
    submitterRole: 'manager',
    submittedAt: '2026-04-01T00:00:00Z',
    suggestedFamily: 'announcement',
    title: `Intake ${id}`,
    body: 'Please share this.',
    reviewState: 'awaitingHrReview',
  };
}

function baseConfig(): PeopleCultureCompanionConfig {
  return {
    heading: 'PC Ops Console',
    items: [
      makeItem({ id: 'ann-live', family: 'announcement', lifecycleState: 'live' }),
      makeItem({
        id: 'ann-draft',
        family: 'announcement',
        lifecycleState: 'draft',
      }),
      makeItem({
        id: 'ann-needs-approval',
        family: 'announcement',
        lifecycleState: 'needsApproval',
        submittedAt: '2026-04-05T00:00:00Z',
        approvalTrigger: 'homepagePinned',
        homepage: { tier: 'featured', overrideSource: 'systemDefault', isPinned: true },
      }),
      makeItem({
        id: 'cel-scheduled',
        family: 'celebrationMilestone',
        lifecycleState: 'scheduled',
        scheduledStart: '2026-04-20T00:00:00Z',
      }),
      makeItem({
        id: 'prog-live',
        family: 'cultureProgramEvent',
        lifecycleState: 'live',
        homepage: { tier: 'featured', overrideSource: 'hrOverride', isPinned: false },
      }),
    ],
    milestoneCandidates: [makeCandidate('m1'), makeCandidate('m2')],
    intakeSubmissions: [makeIntake('i1')],
    currentUserRole: 'approver',
  };
}

describe('PeopleCultureCompanion shell', () => {
  it('renders all six top-level tabs', () => {
    const { getAllByRole } = render(<PeopleCultureCompanion splitConfig={baseConfig()} />);
    const tabs = getAllByRole('tab').map((el) => el.textContent);
    expect(tabs).toEqual([
      'Overview',
      'Announcements',
      'Celebrations / Milestones',
      'Culture Programs / Events',
      'Approvals',
      'Homepage',
    ]);
  });

  it('defaults to Overview and shows lifecycle dashboard cards', () => {
    const { container } = render(<PeopleCultureCompanion splitConfig={baseConfig()} />);
    expect(container.querySelector('[data-hbc-companion-tab="overview"]')).toBeTruthy();
    expect(
      container.querySelector('[data-hbc-companion-overview-card="announcement"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-hbc-companion-overview-card="celebrationMilestone"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-hbc-companion-overview-card="cultureProgramEvent"]'),
    ).toBeTruthy();
  });

  it('surfaces pending approvals count + upcoming scheduled on overview', () => {
    const { container, getByText } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    const scheduledCard = container.querySelector(
      '[data-hbc-companion-overview-card="scheduled"]',
    );
    expect(scheduledCard?.textContent).toContain('1');
    expect(getByText(/Open approvals inbox/)).toBeTruthy();
  });

  it('switches to Announcements tab and shows lifecycle filter chips', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Announcements' }));
    expect(
      container.querySelector('[data-hbc-companion-section="content-family"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-hbc-companion-family="announcement"]'),
    ).toBeTruthy();
    // All eight lifecycle chips present
    const chips = container.querySelectorAll('[data-hbc-companion-lifecycle-chip]');
    expect(chips.length).toBe(8);
  });

  it('filters content-family list by lifecycle state', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Announcements' }));
    // Default filter is 'live'
    expect(
      container.querySelector('[data-hbc-companion-item-id="ann-live"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-hbc-companion-item-id="ann-draft"]'),
    ).toBeNull();
    // Switch to 'draft'
    const draftChip = container.querySelector(
      '[data-hbc-companion-lifecycle-chip="draft"]',
    ) as HTMLButtonElement;
    fireEvent.click(draftChip);
    expect(
      container.querySelector('[data-hbc-companion-item-id="ann-draft"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-hbc-companion-item-id="ann-live"]'),
    ).toBeNull();
  });

  it('toggles between list and calendar views', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Celebrations / Milestones' }));
    const calendarToggle = container.querySelector(
      '[data-hbc-companion-view-toggle="calendar"]',
    ) as HTMLButtonElement;
    fireEvent.click(calendarToggle);
    expect(
      container.querySelector('[data-hbc-companion-view="calendar"]'),
    ).toBeTruthy();
  });
});

describe('PeopleCultureCompanion approvals inbox', () => {
  it('renders needsApproval items and approves via the approve button', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Approvals' }));
    expect(
      container.querySelector('[data-hbc-companion-approval-item="ann-needs-approval"]'),
    ).toBeTruthy();
    const approveBtn = container.querySelector(
      '[data-hbc-companion-action="approve"][data-hbc-companion-action-target="ann-needs-approval"]',
    ) as HTMLButtonElement;
    fireEvent.click(approveBtn);
    // Item is no longer in the approvals inbox after approval
    expect(
      container.querySelector('[data-hbc-companion-approval-item="ann-needs-approval"]'),
    ).toBeNull();
  });

  it('supports claim + reassign on approval work only', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Approvals' }));
    const claimBtn = container.querySelector(
      '[data-hbc-companion-action="claim"][data-hbc-companion-action-target="ann-needs-approval"]',
    ) as HTMLButtonElement;
    fireEvent.click(claimBtn);
    const row = container.querySelector(
      '[data-hbc-companion-approval-item="ann-needs-approval"]',
    );
    expect(row?.getAttribute('data-hbc-companion-approval-owner')).toBe('HR Operator');

    const reassignInput = container.querySelector(
      '[data-hbc-companion-reassign-input="ann-needs-approval"]',
    ) as HTMLInputElement;
    fireEvent.change(reassignInput, { target: { value: 'Casey' } });
    const reassignBtn = container.querySelector(
      '[data-hbc-companion-action="reassign"][data-hbc-companion-action-target="ann-needs-approval"]',
    ) as HTMLButtonElement;
    fireEvent.click(reassignBtn);
    const rowAfter = container.querySelector(
      '[data-hbc-companion-approval-item="ann-needs-approval"]',
    );
    expect(rowAfter?.getAttribute('data-hbc-companion-approval-owner')).toBe('Casey');
  });

  it('disables approve for editor role', () => {
    const config = baseConfig();
    config.currentUserRole = 'editor';
    const { getByRole, container } = render(<PeopleCultureCompanion splitConfig={config} />);
    fireEvent.click(getByRole('tab', { name: 'Approvals' }));
    const approveBtn = container.querySelector(
      '[data-hbc-companion-action="approve"][data-hbc-companion-action-target="ann-needs-approval"]',
    ) as HTMLButtonElement;
    expect(approveBtn?.disabled).toBe(true);
  });
});

describe('PeopleCultureCompanion homepage governance', () => {
  it('shows featured/supporting/excluded cards and lists items', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Homepage' }));
    expect(
      container.querySelector('[data-hbc-companion-homepage-card="featured"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-hbc-companion-homepage-item="prog-live"]'),
    ).toBeTruthy();
  });

  it('toggling pin marks item as HR-overridden and pinned', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Homepage' }));
    const pinToggle = container.querySelector(
      '[data-hbc-companion-action="toggle-pin"][data-hbc-companion-action-target="prog-live"]',
    ) as HTMLButtonElement;
    fireEvent.click(pinToggle);
    const row = container.querySelector(
      '[data-hbc-companion-homepage-item="prog-live"]',
    );
    expect(row?.getAttribute('data-hbc-companion-homepage-override')).toBe('hrOverride');
  });
});

describe('PeopleCultureCompanion overview milestone + intake triage', () => {
  it('accepts milestone candidates via the Accept button', () => {
    const { container } = render(<PeopleCultureCompanion splitConfig={baseConfig()} />);
    const acceptBtn = container.querySelector(
      '[data-hbc-companion-action="accept-milestone"][data-hbc-companion-action-target="m1"]',
    ) as HTMLButtonElement;
    fireEvent.click(acceptBtn);
    expect(container.querySelector('[data-hbc-companion-milestone-id="m1"]')).toBeNull();
    // m2 still pending
    expect(container.querySelector('[data-hbc-companion-milestone-id="m2"]')).toBeTruthy();
  });

  it('promotes intake submissions into draft', () => {
    const { container } = render(<PeopleCultureCompanion splitConfig={baseConfig()} />);
    const promoteBtn = container.querySelector(
      '[data-hbc-companion-action="promote-intake"][data-hbc-companion-action-target="i1"]',
    ) as HTMLButtonElement;
    fireEvent.click(promoteBtn);
    expect(container.querySelector('[data-hbc-companion-intake-id="i1"]')).toBeNull();
  });
});

describe('PeopleCultureCompanion quick-edit drawer', () => {
  it('opens the drawer on item selection and saves changes back to state', () => {
    const { getByRole, container, getByLabelText } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Announcements' }));
    const row = container.querySelector(
      '[data-hbc-companion-item-id="ann-live"]',
    ) as HTMLElement;
    // Click on the text body wrapper (first button in the row — the
    // row text area; the second button is "Full editor").
    const buttons = within(row).getAllByRole('button');
    fireEvent.click(buttons[0]);

    const drawer = container.querySelector('[data-hbc-companion-drawer="quick-edit"]');
    expect(drawer).toBeTruthy();

    const titleInput = getByLabelText('Title') as HTMLInputElement;
    fireEvent.change(titleInput, { target: { value: 'Updated live title' } });
    const saveBtn = container.querySelector(
      '[data-hbc-companion-action="quick-save"]',
    ) as HTMLButtonElement;
    fireEvent.click(saveBtn);

    // Drawer closes, updated title appears in the list
    expect(container.querySelector('[data-hbc-companion-drawer="quick-edit"]')).toBeNull();
    expect(
      container.querySelector('[data-hbc-companion-item-id="ann-live"]')?.textContent,
    ).toContain('Updated live title');
  });

  it('opens the full editor from a content-family row', () => {
    const { getByRole, container } = render(
      <PeopleCultureCompanion splitConfig={baseConfig()} />,
    );
    fireEvent.click(getByRole('tab', { name: 'Culture Programs / Events' }));
    const fullEditorBtn = container.querySelector(
      '[data-hbc-companion-action="open-full-editor"][data-hbc-companion-action-target="prog-live"]',
    ) as HTMLButtonElement;
    fireEvent.click(fullEditorBtn);
    expect(
      container.querySelector('[data-hbc-companion-editor="full-editor"]'),
    ).toBeTruthy();
  });
});

describe('PeopleCultureCompanion boundary with HB Kudos', () => {
  it('renders no Kudos branding or recognition affordance anywhere', () => {
    const { container } = render(<PeopleCultureCompanion splitConfig={baseConfig()} />);
    const html = container.innerHTML.toLowerCase();
    expect(html).not.toContain('kudos');
    expect(html).not.toContain('recognition');
  });
});
