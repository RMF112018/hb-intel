/**
 * Preview surface behavioral proofs.
 *
 * Wave 02 Prompt-02 asks that preview carry trust through structure
 * and behavior, not only through explanatory prose. These tests lock
 * the behaviors that the preview uses to say the truth about itself
 * (saved-draft vs unsaved-edits state, blocking vs warning findings,
 * clean state), and the intrinsic-fidelity invariant that team order
 * in preview matches the authoritative publish-compositor selector.
 */
import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ArticlePreview } from './ArticlePreview.js';
import { selectVisibleTeamMembers } from '../../../data/publisherAdapter/teamViewerAdapter.js';
import type {
  PublisherArticleRow,
  PublisherMediaRow,
  PublisherTeamMemberRow,
} from '../../../data/publisherAdapter/index.js';
import type { PreviewOutcome } from '../../../data/publisherAdapter/preview/previewBuilder.js';

afterEach(cleanup);

function baseArticle(
  overrides: Partial<PublisherArticleRow> = {},
): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'Preview baseline',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'preview-baseline',
    TemplateKey: 'ps-inprogress-monthly-v1',
    WorkflowState: 'draft',
    Subhead: '',
    SummaryExcerpt: '',
    BodyRichText: '<p>Opening line.</p>',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-01T00:00:00Z',
    HeroPrimaryImage: '',
    HeroPrimaryImageAltText: '',
    ...overrides,
  } as PublisherArticleRow;
}

function baseTeamMember(
  overrides: Partial<PublisherTeamMemberRow> = {},
): PublisherTeamMemberRow {
  return {
    TeamMemberId: 'tm-1',
    ArticleId: 'art-1',
    DisplayName: 'Alex Example',
    PersonPrincipal: 'alex@example.com',
    Title: 'Engineer',
    Role: '',
    Department: 'Engineering',
    SortOrder: 1,
    IsFeaturedMember: false,
    ...overrides,
  } as PublisherTeamMemberRow;
}

function okPreview(options: {
  readonly article?: Partial<PublisherArticleRow>;
  readonly teamMembers?: readonly PublisherTeamMemberRow[];
  readonly media?: readonly PublisherMediaRow[];
  readonly errors?: readonly {
    message: string;
    field?: string;
    actionHint?: string;
  }[];
  readonly warnings?: readonly {
    message: string;
    field?: string;
    actionHint?: string;
  }[];
} = {}): PreviewOutcome {
  return {
    ok: true,
    resolution: {
      article: baseArticle(options.article),
      teamMembers: options.teamMembers ?? [],
      media: options.media ?? [],
    },
    composedPage: { controls: [] },
    structuralErrors: [],
    validation: {
      ok: (options.errors?.length ?? 0) === 0,
      errors: (options.errors ?? []).map((e) => ({
        category: 'content-invariant',
        severity: 'error',
        ...e,
      })),
      warnings: (options.warnings ?? []).map((w) => ({
        category: 'content-invariant',
        severity: 'warning',
        ...w,
      })),
      summaryByCategory: {},
    },
    decision: { action: 'updateInPlace' },
    drift: {
      shellVersionDrift: false,
      templateKeyDrift: false,
      templateVersionDrift: false,
    },
  } as unknown as PreviewOutcome;
}

describe('ArticlePreview — saved-draft truth model (isDirty behavior)', () => {
  it('renders the staleness banner when isDirty is true', () => {
    render(
      <ArticlePreview
        outcome={okPreview()}
        loading={false}
        isDirty
        onSaveAndRefresh={vi.fn()}
      />,
    );
    expect(
      screen.getByLabelText(/Preview is behind unsaved edits/i),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Save and refresh preview/i }),
    ).toBeTruthy();
  });

  it('does not render the staleness banner when isDirty is false', () => {
    render(<ArticlePreview outcome={okPreview()} loading={false} isDirty={false} />);
    expect(
      screen.queryByLabelText(/Preview is behind unsaved edits/i),
    ).toBeNull();
  });

  it('invokes onSaveAndRefresh when the save-and-refresh button is clicked', () => {
    const onSaveAndRefresh = vi.fn();
    render(
      <ArticlePreview
        outcome={okPreview()}
        loading={false}
        isDirty
        onSaveAndRefresh={onSaveAndRefresh}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Save and refresh preview/i }),
    );
    expect(onSaveAndRefresh).toHaveBeenCalledTimes(1);
  });

  it('disables the save-and-refresh button when saveAndRefreshDisabled is true', () => {
    render(
      <ArticlePreview
        outcome={okPreview()}
        loading={false}
        isDirty
        onSaveAndRefresh={vi.fn()}
        saveAndRefreshDisabled
      />,
    );
    const button = screen.getByRole('button', {
      name: /Save and refresh preview/i,
    }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('renders the staleness banner even when the outcome has not yet been built', () => {
    render(
      <ArticlePreview
        outcome={undefined}
        loading={false}
        isDirty
        onSaveAndRefresh={vi.fn()}
      />,
    );
    expect(
      screen.getByLabelText(/Preview is behind unsaved edits/i),
    ).toBeTruthy();
    expect(screen.getByText(/Preview not yet built/i)).toBeTruthy();
  });
});

describe('ArticlePreview — trust bridge findings behavior', () => {
  it('renders the clean-state status when there are no errors or warnings', () => {
    render(<ArticlePreview outcome={okPreview()} loading={false} />);
    expect(
      screen.getByText(
        /Preview reflects the last saved draft — no blocking issues and no warnings/i,
      ),
    ).toBeTruthy();
    expect(
      screen.queryByLabelText(/Preview blocking issues/i),
    ).toBeNull();
    expect(screen.queryByLabelText(/Preview warnings/i)).toBeNull();
  });

  it('renders the blocking trust bridge with the correct error count', () => {
    render(
      <ArticlePreview
        outcome={okPreview({
          errors: [
            { message: 'Title is required', field: 'Title' },
            { message: 'Hero image missing', field: 'HeroPrimaryImage' },
          ],
        })}
        loading={false}
      />,
    );
    expect(
      screen.getByLabelText(/Preview blocking issues/i),
    ).toBeTruthy();
    expect(
      screen.getByText(/2 blocking issues to fix before publish/i),
    ).toBeTruthy();
  });

  it('renders the warning trust bridge when there are only warnings', () => {
    render(
      <ArticlePreview
        outcome={okPreview({
          warnings: [
            { message: 'Summary excerpt is short', field: 'SummaryExcerpt' },
          ],
        })}
        loading={false}
      />,
    );
    expect(screen.getByLabelText(/Preview warnings/i)).toBeTruthy();
    expect(
      screen.getByText(/1 warning to review before publish/i),
    ).toBeTruthy();
  });

  it('links findings to their owning authoring section via findingAnchor', () => {
    render(
      <ArticlePreview
        outcome={okPreview({
          errors: [
            {
              message: 'Hero image missing',
              field: 'HeroPrimaryImage',
            },
          ],
        })}
        loading={false}
      />,
    );
    const link = screen.getByRole('link', { name: /Go to Hero/i });
    expect(link.getAttribute('href')).toBe('#section-hero');
  });

  it('summarises overflow findings back to the readiness rail rather than duplicating them inline', () => {
    const errors = Array.from({ length: 5 }, (_, i) => ({
      message: `error ${i + 1}`,
      field: 'Title',
    }));
    render(
      <ArticlePreview
        outcome={okPreview({ errors })}
        loading={false}
      />,
    );
    // Inline limit is 3; the two remaining findings become the overflow pointer.
    expect(
      screen.getByText(/\+ 2 more in the Readiness rail/i),
    ).toBeTruthy();
  });
});

describe('ArticlePreview — body-content faithfulness', () => {
  it('renders the empty-body placeholder when BodyRichText is empty', () => {
    render(
      <ArticlePreview
        outcome={okPreview({ article: { BodyRichText: '' } })}
        loading={false}
      />,
    );
    expect(screen.getByText(/No body content yet/i)).toBeTruthy();
  });

  it('renders the BodyRichText HTML verbatim (schema-locked via editor)', () => {
    render(
      <ArticlePreview
        outcome={okPreview({
          article: {
            BodyRichText: '<h2>Beat</h2><p>Line with <strong>weight</strong>.</p>',
          },
        })}
        loading={false}
      />,
    );
    const heading = document.querySelector('h2');
    expect(heading?.textContent).toBe('Beat');
    expect(document.querySelector('strong')?.textContent).toBe('weight');
  });
});

describe('ArticlePreview — team-order intrinsic fidelity', () => {
  it('renders team members in the same order as selectVisibleTeamMembers (the publish-compositor sort)', () => {
    const rows: PublisherTeamMemberRow[] = [
      baseTeamMember({ TeamMemberId: 'c', DisplayName: 'Charlie Zulu', SortOrder: 3 }),
      baseTeamMember({ TeamMemberId: 'a', DisplayName: 'Alex Alpha', SortOrder: 1 }),
      baseTeamMember({ TeamMemberId: 'b', DisplayName: 'Bravo Beta', SortOrder: 2 }),
    ];
    const expectedOrder = selectVisibleTeamMembers(rows).map((r) => r.DisplayName);

    render(
      <ArticlePreview
        outcome={okPreview({
          article: { TeamViewerTitle: 'The Team at Riverside' },
          teamMembers: rows,
        })}
        loading={false}
      />,
    );
    const section = screen.getByLabelText(/Team preview/i);
    const renderedNames = Array.from(section.querySelectorAll('li'))
      .map((li) => li.textContent)
      .filter((s): s is string => !!s);

    // Every expected team member appears in the rendered list at a
    // position that matches the authoritative selector's order.
    const relativePositions = expectedOrder.map((name) =>
      renderedNames.findIndex((rendered) => rendered.includes(name)),
    );
    expect(relativePositions.every((pos) => pos >= 0)).toBe(true);
    expect(relativePositions).toEqual([...relativePositions].sort((a, b) => a - b));
  });

  it('lifts a featured teammate into the featured slot while still ordering the remaining team by the shared selector', () => {
    const rows: PublisherTeamMemberRow[] = [
      baseTeamMember({ TeamMemberId: 'a', DisplayName: 'Alex Alpha', SortOrder: 1 }),
      baseTeamMember({
        TeamMemberId: 'f',
        DisplayName: 'Featured Person',
        SortOrder: 2,
        IsFeaturedMember: true,
      }),
      baseTeamMember({ TeamMemberId: 'c', DisplayName: 'Charlie Zulu', SortOrder: 3 }),
    ];

    render(
      <ArticlePreview
        outcome={okPreview({ teamMembers: rows })}
        loading={false}
      />,
    );
    const section = screen.getByLabelText(/Team preview/i);
    // Featured teammate renders outside the list; remaining teammates render as <li>.
    expect(section.textContent).toContain('Featured Person');
    const listItemNames = Array.from(section.querySelectorAll('li'))
      .map((li) => li.textContent ?? '');
    expect(listItemNames.some((t) => t.includes('Featured Person'))).toBe(false);
    expect(listItemNames.some((t) => t.includes('Alex Alpha'))).toBe(true);
    expect(listItemNames.some((t) => t.includes('Charlie Zulu'))).toBe(true);
  });
});

describe('ArticlePreview — empty / unavailable outcomes', () => {
  it('renders the "not yet built" empty state when outcome is undefined and not loading', () => {
    render(<ArticlePreview outcome={undefined} loading={false} />);
    expect(screen.getByText(/Preview not yet built/i)).toBeTruthy();
  });

  it('renders the "unavailable" empty state when outcome reports a failure', () => {
    const failed: PreviewOutcome = {
      ok: false,
      reason: 'templateResolutionFailed',
      message: 'no matching template',
    };
    render(<ArticlePreview outcome={failed} loading={false} />);
    expect(screen.getByText(/Preview unavailable/i)).toBeTruthy();
  });
});
