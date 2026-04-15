/**
 * TeamPanel — visual team management surface for the Article
 * Publisher. Workstream-d step-03.
 *
 * Owns the chip-stack presentation, quick featured-state toggle,
 * keyboard reorder (Alt+ArrowUp / Alt+ArrowDown while focused on a
 * chip), remove, and edit-composer launch. All row mutations route
 * through the pure helpers in `teamInvariants.ts` so the invariants
 * (mutually-exclusive featured, 1-indexed SortOrder) hold across
 * every author action and the composer save path.
 */

import * as React from 'react';
import { HbcEmptyState } from '@hbc/ui-kit/homepage';
import {
  ChevronDown,
  ChevronUp,
  Star,
  StarFilled,
} from '@hbc/ui-kit';
import type { PeopleSearchFn, PersonPhotoFn } from '@hbc/ui-kit';
import type { PublisherTeamMemberRow } from '../../../data/publisherAdapter/index.js';
import { TeamMemberComposer } from './TeamMemberComposer.js';
import {
  applyFeaturedInvariant,
  moveRow,
  restampSortOrder,
} from './teamInvariants.js';
import { TeammateAvatar } from './TeammateAvatar.js';
import { EditorialChip, PublisherButton } from '../sharedChrome/index.js';
import styles from './teamPanel.module.css';

export interface TeamPanelProps {
  readonly articleId: string;
  readonly rows: PublisherTeamMemberRow[];
  readonly onChange: (next: PublisherTeamMemberRow[]) => void;
  readonly searchPeople?: PeopleSearchFn;
  readonly fetchPersonPhoto?: PersonPhotoFn;
}

export function TeamPanel({
  articleId,
  rows,
  onChange,
  searchPeople,
  fetchPersonPhoto,
}: TeamPanelProps): React.JSX.Element {
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | undefined>();

  const editingRow = React.useMemo(
    () => rows.find((r) => r.TeamMemberId === editingId),
    [rows, editingId],
  );

  const openAdd = () => {
    setEditingId(undefined);
    setComposerOpen(true);
  };
  const openEdit = (id: string) => {
    setEditingId(id);
    setComposerOpen(true);
  };
  const close = () => {
    setComposerOpen(false);
    setEditingId(undefined);
  };

  const handleSave = (saved: PublisherTeamMemberRow) => {
    const exists = rows.some((r) => r.TeamMemberId === saved.TeamMemberId);
    const merged = exists
      ? rows.map((r) => (r.TeamMemberId === saved.TeamMemberId ? saved : r))
      : [...rows, saved];
    // If this save flags the row as featured, enforce the
    // mutually-exclusive invariant across the whole list.
    const featured =
      saved.IsFeaturedMember === true ? saved.TeamMemberId : undefined;
    const withFeatured = featured
      ? applyFeaturedInvariant(merged, featured)
      : merged;
    onChange(restampSortOrder(withFeatured));
    close();
  };

  const removeAt = (idx: number) => {
    const filtered = rows.filter((_, i) => i !== idx);
    onChange(restampSortOrder(filtered));
  };
  const move = (idx: number, dir: -1 | 1) => {
    if (idx + dir < 0 || idx + dir >= rows.length) return;
    onChange(moveRow(rows, idx, dir));
  };
  const toggleFeatured = (id: string) => {
    const currentlyFeatured = rows.find((r) => r.IsFeaturedMember === true);
    const next =
      currentlyFeatured?.TeamMemberId === id
        ? applyFeaturedInvariant(rows, undefined)
        : applyFeaturedInvariant(rows, id);
    onChange(next);
  };

  const chipKeyHandler = (idx: number) => (e: React.KeyboardEvent) => {
    if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      move(idx, -1);
    } else if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      move(idx, 1);
    }
  };

  const featuredIndex = rows.findIndex((r) => r.IsFeaturedMember === true);
  const featuredRow = featuredIndex >= 0 ? rows[featuredIndex] : undefined;
  const rosterEntries = rows
    .map((row, index) => ({ row, index }))
    .filter(({ index }) => index !== featuredIndex);

  const renderChip = (r: PublisherTeamMemberRow, i: number, isFeatured: boolean) => {
    const displayName = r.DisplayName || r.PersonPrincipal || `Member ${i + 1}`;
    return (
      <li
        key={r.TeamMemberId}
        className={`${styles.chip} ${isFeatured ? styles.chipFeatured : ''}`}
      >
        <div className={styles.chipMain}>
          <TeammateAvatar row={r} fetchPersonPhoto={fetchPersonPhoto} />
          <button
            type="button"
            className={styles.chipBody}
            onClick={() => openEdit(r.TeamMemberId)}
            onKeyDown={chipKeyHandler(i)}
            aria-label={`Edit ${displayName}${isFeatured ? ' — featured' : ''}`}
          >
            <span className={styles.chipName}>
              {displayName}
              {isFeatured && (
                <EditorialChip variant="featured" size="sm">
                  Featured
                </EditorialChip>
              )}
            </span>
            {r.Title && <span className={styles.chipTitle}>{r.Title}</span>}
            {r.Department && (
              <span className={styles.chipMeta}>{r.Department}</span>
            )}
            {r.BioSnippet && <span className={styles.chipBio}>{r.BioSnippet}</span>}
          </button>
          <PublisherButton
            iconOnly
            pressed={isFeatured}
            aria-label={
              isFeatured
                ? `Unfeature ${displayName}`
                : `Feature ${displayName} on the article card`
            }
            title={isFeatured ? 'Unfeature' : 'Feature teammate'}
            onClick={() => toggleFeatured(r.TeamMemberId)}
          >
            {isFeatured ? <StarFilled size="sm" /> : <Star size="sm" />}
          </PublisherButton>
        </div>
        <div className={styles.chipActions}>
          <PublisherButton
            iconOnly
            size="sm"
            aria-label={`Move ${displayName} up`}
            title="Move up (Alt+Up)"
            onClick={() => move(i, -1)}
            disabled={i === 0}
          >
            <ChevronUp size="sm" />
          </PublisherButton>
          <PublisherButton
            iconOnly
            size="sm"
            aria-label={`Move ${displayName} down`}
            title="Move down (Alt+Down)"
            onClick={() => move(i, 1)}
            disabled={i === rows.length - 1}
          >
            <ChevronDown size="sm" />
          </PublisherButton>
          <PublisherButton size="sm" onClick={() => openEdit(r.TeamMemberId)}>
            Edit
          </PublisherButton>
          <PublisherButton
            size="sm"
            variant="danger"
            aria-label={`Remove ${displayName}`}
            onClick={() => removeAt(i)}
          >
            Remove
          </PublisherButton>
        </div>
      </li>
    );
  };

  return (
    <div className={styles.panel}>
      {rows.length === 0 ? (
        <HbcEmptyState
          title="No teammates yet"
          description="Pull colleagues from the directory to spotlight them on the published article."
        />
      ) : (
        <>
          {featuredRow && (
            <div className={styles.rosterGroup} aria-label="Article card lead">
              <p className={styles.rosterHeading}>Article card lead</p>
              <ol className={styles.chipStack}>
                {renderChip(featuredRow, featuredIndex, true)}
              </ol>
            </div>
          )}
          {rosterEntries.length > 0 && (
            <div
              className={styles.rosterGroup}
              aria-label="Article teammates — use Alt+Up or Alt+Down to reorder"
            >
              <p className={styles.rosterHeading}>
                {featuredRow ? 'Roster' : 'Team'}
              </p>
              <ol className={styles.chipStack}>
                {rosterEntries.map(({ row, index }) =>
                  renderChip(row, index, false),
                )}
              </ol>
            </div>
          )}
        </>
      )}
      <PublisherButton variant="primary" onClick={openAdd}>
        + Add teammate
      </PublisherButton>

      <TeamMemberComposer
        open={composerOpen}
        articleId={articleId}
        editingRow={editingRow}
        nextSortOrder={rows.length + 1}
        searchPeople={searchPeople}
        fetchPersonPhoto={fetchPersonPhoto}
        onSave={handleSave}
        onRequestClose={close}
      />
    </div>
  );
}
