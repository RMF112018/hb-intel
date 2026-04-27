import { useMemo, useState } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonManagedContent } from '../../types/foleon-management.types.js';
import {
  buildContentInboxBuckets,
  type ContentInboxBucket,
  type ContentInboxBucketId,
} from './contentInboxViewModel.js';
import { readerLaneForContent, readerLaneLabel } from './manageMutationUtils.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export interface ContentInboxProps {
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<import('../../types/foleon-management.types.js').FoleonPlacement>;
  readonly selectedId: string | null;
  readonly focusBucketId: ContentInboxBucketId | null;
  readonly onSelectRecord: (id: string) => void;
  readonly onClearFocusBucket: () => void;
}

export function ContentInbox(props: ContentInboxProps): React.ReactNode {
  const buckets = useMemo(
    () => buildContentInboxBuckets({ content: props.content, placements: props.placements }),
    [props.content, props.placements],
  );
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();

  const visibleBuckets = props.focusBucketId
    ? buckets.filter((bucket) => bucket.id === props.focusBucketId)
    : buckets;

  const totalRecords = props.content.length;

  return (
    <section
      className={shell.contentInbox}
      aria-label="Content inbox"
    >
      <header className={shell.contentInboxHeader}>
        <div>
          <p className={f.guidanceKicker}>Content inbox</p>
          <h3 className={f.sectionTitle}>
            {totalRecords === 0 ? 'No content yet' : `${totalRecords} record${totalRecords === 1 ? '' : 's'}`}
          </h3>
          <p className={f.metaMuted}>
            Search any record below or focus a bucket. Selecting a row opens the workflow panel.
          </p>
        </div>
        <div className={shell.contentInboxToolbar}>
          <label className={shell.contentInboxSearchLabel}>
            <span className={shell.contentInboxSearchLabelText}>Search</span>
            <input
              type="search"
              className={shell.contentInboxSearchInput}
              placeholder="Title, region, or doc ID"
              value={query}
              onChange={(event): void => setQuery(event.target.value)}
              aria-label="Search content inbox"
            />
          </label>
          {props.focusBucketId ? (
            <HbcButton variant="secondary" onClick={props.onClearFocusBucket}>
              Show all buckets
            </HbcButton>
          ) : null}
        </div>
      </header>
      <div className={shell.contentInboxBuckets}>
        {visibleBuckets.map((bucket) => (
          <ContentInboxBucketSection
            key={bucket.id}
            bucket={bucket}
            needle={needle}
            selectedId={props.selectedId}
            onSelectRecord={props.onSelectRecord}
          />
        ))}
      </div>
    </section>
  );
}

function ContentInboxBucketSection(props: {
  readonly bucket: ContentInboxBucket;
  readonly needle: string;
  readonly selectedId: string | null;
  readonly onSelectRecord: (id: string) => void;
}): React.ReactNode {
  const filteredItems = props.needle
    ? props.bucket.items.filter((record) => matchesQuery(record, props.needle))
    : props.bucket.items;

  return (
    <section
      className={shell.contentInboxBucket}
      data-bucket-id={props.bucket.id}
      aria-label={`${props.bucket.label} bucket`}
    >
      <header className={shell.contentInboxBucketHeader}>
        <div>
          <h4 className={shell.contentInboxBucketTitle}>
            {props.bucket.label}
            <span className={shell.contentInboxBucketCount} aria-label={`${filteredItems.length} ${props.bucket.label} items`}>
              {filteredItems.length}
            </span>
          </h4>
          <p className={shell.contentInboxBucketDescription}>{props.bucket.description}</p>
        </div>
      </header>
      {filteredItems.length === 0 ? (
        <p className={shell.contentInboxBucketEmpty}>
          {props.bucket.items.length === 0
            ? 'No records in this bucket.'
            : 'No matching records for the current search.'}
        </p>
      ) : (
        <ul className={shell.contentInboxList} role="list">
          {filteredItems.map((record) => (
            <ContentInboxRow
              key={record.id}
              record={record}
              selected={record.id === props.selectedId}
              onSelect={(): void => props.onSelectRecord(record.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function ContentInboxRow(props: {
  readonly record: FoleonManagedContent;
  readonly selected: boolean;
  readonly onSelect: () => void;
}): React.ReactNode {
  const lane = readerLaneForContent(props.record);
  const laneLabel = lane ? readerLaneLabel(lane) : 'Unmapped';

  return (
    <li className={shell.contentInboxItem}>
      <button
        type="button"
        className={shell.contentInboxRow}
        aria-pressed={props.selected}
        data-selected={props.selected ? 'true' : 'false'}
        onClick={props.onSelect}
      >
        <span className={shell.contentInboxRowTitle}>{props.record.title}</span>
        <span className={shell.contentInboxRowMeta}>
          <span className={shell.contentInboxRowLane}>{laneLabel}</span>
          <span className={shell.contentInboxRowStatus}>{props.record.publishStatus}</span>
          <span
            className={shell.contentInboxRowValidation}
            data-validation-status={props.record.validationStatus}
          >
            {props.record.validationStatus}
          </span>
          {props.record.lastEditorialUpdate ? (
            <span className={shell.contentInboxRowDate}>
              Last editorial update {formatTimestamp(props.record.lastEditorialUpdate)}
            </span>
          ) : null}
        </span>
      </button>
    </li>
  );
}

function matchesQuery(record: FoleonManagedContent, needle: string): boolean {
  return [
    record.title,
    record.summary,
    record.region,
    record.sector,
    String(record.foleonDocId),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(needle);
}

function formatTimestamp(iso: string): string {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return iso;
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(parsed);
  } catch {
    return iso;
  }
}
