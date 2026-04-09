/**
 * HB Kudos runtime smoke tests — Phase-14 kudos/ Prompt-02.
 *
 * Covers the employee-facing HB Kudos webpart at the composer draft +
 * validation layer and the webpart render path. SharePoint REST calls
 * are mocked so these tests can run in the jsdom environment.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';

afterEach(() => {
  cleanup();
});

// Mock SPFx site context before importing the webpart so the data
// hooks fall through to the manifest-config fallback path.
vi.mock('../data/spContext.js', () => ({
  getSiteUrl: () => undefined,
  storeSiteUrl: vi.fn(),
}));

import { HbKudos } from '../../webparts/hbKudos/HbKudos.js';

describe('HbKudos webpart — runtime smoke', () => {
  it('renders the kudos recognition section root with the Phase-14 marker', () => {
    render(<HbKudos />);
    const section = document.querySelector('[data-hbc-webpart="hb-kudos"]');
    expect(section).not.toBeNull();
    expect(section?.getAttribute('data-hbc-webpart-phase')).toBe('phase-14-kudos-prompt-02');
  });

  it('renders the recognition archive heading by default (empty state when no data)', () => {
    render(<HbKudos />);
    // Archive heading is always rendered; the list body falls through to
    // the empty state when no approved kudos exist.
    expect(screen.getByText('Recognition archive')).toBeTruthy();
  });

  it('hides the recognition archive when showArchive=false', () => {
    render(<HbKudos config={{ showArchive: false }} />);
    expect(screen.queryByText('Recognition archive')).toBeNull();
  });
});

describe('HbKudos — typed composer hook integration', () => {
  // The hook module under test is the one the webpart uses directly.
  // Split button handlers so state updates flush between steps — the
  // useCallback-based `actions.submit` closes over `draft`, and React
  // batches state updates within a single event handler, which means a
  // single click that updates then submits reads the stale draft. All
  // three tests split update + submit into separate clicks.

  it('typed recipients mode blocks submit until an individual email is added', async () => {
    const { useKudosComposer } = await import('../data/useKudosComposer.js');
    const submitSpy = vi.fn().mockResolvedValue(undefined);

    function Harness(): React.JSX.Element {
      const { state, actions } = useKudosComposer(submitSpy, { recipientsMode: 'typed' });
      return (
        <div>
          <span data-testid="status">{state.status}</span>
          <span data-testid="recipientsError">{state.validationErrors.recipients ?? ''}</span>
          <button
            data-testid="openAndFillContent"
            onClick={() => {
              actions.open();
              actions.updateDraft({ headline: 'Great work', excerpt: 'Thanks for the help' });
            }}
          >
            open
          </button>
          <button
            data-testid="addIndividual"
            onClick={() =>
              actions.updateDraft({
                recipients: {
                  individualEmails: ['riley@hedrickbrothers.com'],
                  teamLabels: [],
                  departmentLabels: [],
                  projectGroupLabels: [],
                },
              })
            }
          >
            add
          </button>
          <button data-testid="submitBtn" onClick={() => actions.submit()}>
            submit
          </button>
        </div>
      );
    }

    const { getByTestId } = render(<Harness />);
    fireEvent.click(getByTestId('openAndFillContent'));
    // First submit — no recipients yet.
    fireEvent.click(getByTestId('submitBtn'));
    await Promise.resolve();
    expect(getByTestId('recipientsError').textContent).toBe(
      'Add at least one individual recipient email',
    );
    expect(submitSpy).not.toHaveBeenCalled();

    // Add a valid individual, then submit again.
    fireEvent.click(getByTestId('addIndividual'));
    fireEvent.click(getByTestId('submitBtn'));
    // Allow microtasks to flush.
    await Promise.resolve();
    await Promise.resolve();
    expect(submitSpy).toHaveBeenCalled();
    const submittedDraft = submitSpy.mock.calls[0][0];
    expect(submittedDraft.recipients.individualEmails).toEqual(['riley@hedrickbrothers.com']);
    expect(submittedDraft.headline).toBe('Great work');
  });

  it('typed recipients mode rejects obviously invalid email addresses', async () => {
    const { useKudosComposer } = await import('../data/useKudosComposer.js');
    const submitSpy = vi.fn();
    function Harness(): React.JSX.Element {
      const { state, actions } = useKudosComposer(submitSpy, { recipientsMode: 'typed' });
      return (
        <div>
          <span data-testid="err">{state.validationErrors.recipients ?? ''}</span>
          <button
            data-testid="fill"
            onClick={() => {
              actions.open();
              actions.updateDraft({
                headline: 'h',
                excerpt: 'e',
                recipients: {
                  individualEmails: ['not-an-email'],
                  teamLabels: [],
                  departmentLabels: [],
                  projectGroupLabels: [],
                },
              });
            }}
          >
            fill
          </button>
          <button data-testid="submit" onClick={() => actions.submit()}>
            submit
          </button>
        </div>
      );
    }

    const { getByTestId } = render(<Harness />);
    fireEvent.click(getByTestId('fill'));
    fireEvent.click(getByTestId('submit'));
    await Promise.resolve();
    expect(getByTestId('err').textContent).toContain('not-an-email');
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('text mode still validates the legacy recipientNames field', async () => {
    const { useKudosComposer } = await import('../data/useKudosComposer.js');
    const submitSpy = vi.fn();
    function Harness(): React.JSX.Element {
      const { state, actions } = useKudosComposer(submitSpy);
      return (
        <div>
          <span data-testid="err">{state.validationErrors.recipientNames ?? ''}</span>
          <button
            data-testid="fill"
            onClick={() => {
              actions.open();
              actions.updateDraft({ headline: 'h', excerpt: 'e' });
            }}
          >
            fill
          </button>
          <button data-testid="submit" onClick={() => actions.submit()}>
            submit
          </button>
        </div>
      );
    }

    const { getByTestId } = render(<Harness />);
    fireEvent.click(getByTestId('fill'));
    fireEvent.click(getByTestId('submit'));
    await Promise.resolve();
    expect(getByTestId('err').textContent).toBe('At least one recipient is required');
    expect(submitSpy).not.toHaveBeenCalled();
  });
});

describe('submitKudosDraft — typed recipient resolution', () => {
  it('resolveTypedRecipientBuckets walks each email through ensureUser', async () => {
    // Re-mock fetch for this describe block. The resolver calls
    // `${siteUrl}/_api/web/ensureuser('email')` once per individual email.
    const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
      if (typeof url === 'string' && url.includes('ensureuser')) {
        // Return 42 for riley, reject everything else so we see the
        // unresolved path too.
        if (url.includes('riley')) {
          return {
            ok: true,
            json: async () => ({ Id: 42 }),
          };
        }
        return { ok: false, json: async () => ({}) };
      }
      return { ok: true, json: async () => ({}) };
    });
    const originalFetch = global.fetch;
    global.fetch = fetchSpy as unknown as typeof fetch;

    try {
      const { resolveTypedRecipientBuckets } = await import(
        '../data/peopleCultureSubmissionSource.js'
      );
      const result = await resolveTypedRecipientBuckets(
        'https://example.sharepoint.com/sites/intel',
        {
          individualEmails: ['riley@hedrickbrothers.com', 'ghost@unknown.example'],
          teamLabels: ['Field Safety'],
          departmentLabels: [],
          projectGroupLabels: ['Downtown Tower'],
        },
        'test-digest',
      );

      expect(result.resolvedIndividualUserIds).toEqual([42]);
      expect(result.unresolvedIndividualEmails).toEqual(['ghost@unknown.example']);
      expect(result.teamLabels).toEqual(['Field Safety']);
      expect(result.departmentLabels).toEqual([]);
      expect(result.projectGroupLabels).toEqual(['Downtown Tower']);
    } finally {
      global.fetch = originalFetch;
    }
  });
});

describe('HbcKudosComposerForm — typed recipient bucket input', () => {
  it('renders four labeled buckets when recipientsMode is typed', async () => {
    const {
      HbcKudosComposerForm,
      EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS,
    } = await import('@hbc/ui-kit/homepage');

    const draft = {
      recipientNames: '',
      recipients: { ...EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS },
      headline: '',
      excerpt: '',
      details: '',
    };

    render(
      <HbcKudosComposerForm draft={draft} onDraftChange={() => {}} recipientsMode="typed" />,
    );

    expect(screen.getByText('Individuals')).toBeTruthy();
    expect(screen.getByText('Teams')).toBeTruthy();
    expect(screen.getByText('Departments')).toBeTruthy();
    expect(screen.getByText('Project groups')).toBeTruthy();
  });

  it('renders the legacy text field when recipientsMode is omitted', async () => {
    const { HbcKudosComposerForm } = await import('@hbc/ui-kit/homepage');

    const draft = {
      recipientNames: 'Riley Brooks',
      headline: '',
      excerpt: '',
      details: '',
    };

    const { container } = render(
      <HbcKudosComposerForm draft={draft} onDraftChange={() => {}} />,
    );

    const input = container.querySelector('#hbc-kudos-recipients') as HTMLInputElement | null;
    expect(input).not.toBeNull();
    expect(input?.value).toBe('Riley Brooks');
    // Bucket labels should be absent in text mode.
    expect(screen.queryByText('Individuals')).toBeNull();
  });
});

