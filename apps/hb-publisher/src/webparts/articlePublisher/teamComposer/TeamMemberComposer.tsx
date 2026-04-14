/**
 * TeamMemberComposer — right-side flyout for adding or editing an
 * article teammate. Workstream-d step-02.
 *
 * Reuses the governed composer-flyout chrome from
 * `@hbc/ui-kit/homepage` (`HbcKudosComposerFlyout`) and the governed
 * directory picker (`HbcPeoplePicker`). The composer owns no
 * persistence — it only emits a `PublisherTeamMemberRow` to the
 * Publisher's in-memory `teamDraft` through `onSave`, which the
 * existing save path writes via `teamMembers.replaceAllForArticle`.
 *
 * Hydration rules live in `hydrateTeamMember.ts`; this file is UI.
 */

import * as React from 'react';
import { HbcPeoplePicker } from '@hbc/ui-kit';
import type { PeopleSearchFn, PersonEntry, PersonPhotoFn } from '@hbc/ui-kit';
import { HbcKudosComposerFlyout } from '@hbc/ui-kit/homepage';
import type { PublisherTeamMemberRow } from '../../../data/publisherAdapter/index.js';
import {
  createTeamMemberFromPerson,
  editorialsFromRow,
  mergeTeamMemberWithPerson,
  personEntryFromRow,
  type TeamMemberEditorials,
} from './hydrateTeamMember.js';
import styles from './teamComposer.module.css';

export interface TeamMemberComposerProps {
  readonly open: boolean;
  readonly articleId: string;
  /** Existing row when editing; undefined when adding. */
  readonly editingRow?: PublisherTeamMemberRow;
  /** Next `SortOrder` to assign when adding. */
  readonly nextSortOrder: number;
  readonly searchPeople?: PeopleSearchFn;
  readonly fetchPersonPhoto?: PersonPhotoFn;
  readonly onSave: (row: PublisherTeamMemberRow) => void;
  readonly onRequestClose: () => void;
}

const ROLE_CAPTION_MAX = 80;
const BIO_CAPTION_MAX = 140;

export function TeamMemberComposer({
  open,
  articleId,
  editingRow,
  nextSortOrder,
  searchPeople,
  fetchPersonPhoto,
  onSave,
  onRequestClose,
}: TeamMemberComposerProps): React.JSX.Element {
  const isEdit = !!editingRow;
  const seedPerson = React.useMemo<PersonEntry | undefined>(
    () => (editingRow ? personEntryFromRow(editingRow) : undefined),
    [editingRow],
  );
  const seedEditorials = React.useMemo<TeamMemberEditorials>(
    () => (editingRow ? editorialsFromRow(editingRow, seedPerson) : {}),
    [editingRow, seedPerson],
  );

  const [person, setPerson] = React.useState<PersonEntry | undefined>(seedPerson);
  const [roleCaption, setRoleCaption] = React.useState(seedEditorials.roleCaption ?? '');
  const [bioCaption, setBioCaption] = React.useState(seedEditorials.bioCaption ?? '');
  const [featured, setFeatured] = React.useState(seedEditorials.featured === true);

  // Re-seed when the flyout is re-opened on a different row.
  React.useEffect(() => {
    if (!open) return;
    setPerson(seedPerson);
    setRoleCaption(seedEditorials.roleCaption ?? '');
    setBioCaption(seedEditorials.bioCaption ?? '');
    setFeatured(seedEditorials.featured === true);
  }, [open, seedPerson, seedEditorials]);

  const handlePickerChange = React.useCallback((people: PersonEntry[]) => {
    setPerson(people[0]);
  }, []);

  const canSave = !!person;

  const handleSave = React.useCallback(() => {
    if (!person) return;
    const editorials: TeamMemberEditorials = {
      roleCaption,
      bioCaption,
      featured,
    };
    const next =
      isEdit && editingRow
        ? mergeTeamMemberWithPerson({ existing: editingRow, person, editorials })
        : createTeamMemberFromPerson({
            articleId,
            teamMemberId: `tm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            person,
            editorials,
            sortOrder: nextSortOrder,
          });
    onSave(next);
  }, [
    articleId,
    bioCaption,
    editingRow,
    featured,
    isEdit,
    nextSortOrder,
    onSave,
    person,
    roleCaption,
  ]);

  const directoryTitle = person?.jobTitle?.trim();
  const directoryDepartment = person?.department?.trim();

  return (
    <HbcKudosComposerFlyout
      open={open}
      onClose={onRequestClose}
      title={isEdit ? 'Edit teammate' : 'Add teammate'}
      subtitle="Pull from the directory — the article card uses this person's real profile."
      primaryAction={{
        label: isEdit ? 'Save teammate' : 'Add teammate',
        onClick: handleSave,
        disabled: !canSave,
      }}
      secondaryAction={{ label: 'Cancel', onClick: onRequestClose }}
    >
      <div className={styles.body} aria-label="Teammate composer">
        <HbcPeoplePicker
          label="Teammate"
          value={person ? [person] : []}
          onChange={handlePickerChange}
          searchPeople={searchPeople}
          fetchPersonPhoto={fetchPersonPhoto}
          mode="single"
          placeholder="Search the directory by name or email"
          required
        />

        {person && (
          <>
            <div className={styles.directoryReadout}>
              <span className={styles.directoryReadoutLabel}>Directory profile</span>
              <span className={styles.directoryReadoutValue}>
                {directoryTitle || 'No job title on file'}
                {directoryDepartment ? ` · ${directoryDepartment}` : ''}
              </span>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabelRow}>
                <span className={styles.fieldLabel}>Role caption</span>
                <span
                  className={`${styles.fieldCount} ${
                    roleCaption.length > ROLE_CAPTION_MAX ? styles.fieldCountOver : ''
                  }`}
                  aria-live="polite"
                >
                  {roleCaption.length} / {ROLE_CAPTION_MAX}
                </span>
              </span>
              <span className={styles.fieldHelper}>
                Optional. Leave blank to track the directory title
                {directoryTitle ? ` (“${directoryTitle}”)` : ''}. Use this to frame the
                teammate's role on this article specifically.
              </span>
              <input
                className={styles.input}
                value={roleCaption}
                placeholder={
                  directoryTitle
                    ? `Override "${directoryTitle}" for this article`
                    : 'e.g. Owner rep on the West Palm pull-in'
                }
                maxLength={ROLE_CAPTION_MAX + 20}
                onChange={(e) => setRoleCaption(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabelRow}>
                <span className={styles.fieldLabel}>Bio caption</span>
                <span
                  className={`${styles.fieldCount} ${
                    bioCaption.length > BIO_CAPTION_MAX ? styles.fieldCountOver : ''
                  }`}
                  aria-live="polite"
                >
                  {bioCaption.length} / {BIO_CAPTION_MAX}
                </span>
              </span>
              <span className={styles.fieldHelper}>
                Optional. A single editorial line rendered under the name.
              </span>
              <textarea
                className={styles.textarea}
                value={bioCaption}
                placeholder="e.g. 20 years on the South Florida coast."
                maxLength={BIO_CAPTION_MAX + 40}
                onChange={(e) => setBioCaption(e.target.value)}
              />
            </label>

            <label className={styles.toggleRow}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span>Feature this teammate on the article card</span>
            </label>
          </>
        )}
      </div>
    </HbcKudosComposerFlyout>
  );
}
