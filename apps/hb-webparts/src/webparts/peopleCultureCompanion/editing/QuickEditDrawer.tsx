/**
 * Quick-edit drawer for the People & Culture HR operating companion.
 * Phase-14 pc/ Prompt-03.
 *
 * Right-side drawer for fast operational edits. Scoped to the
 * common-case fields (title, body, schedule window, homepage tier,
 * audience scope). Deeper authoring flows to the `FullEditor` modal.
 *
 * The drawer is intentionally local state + `onSubmit(patch)` callback
 * — it never mutates the parent item directly so the companion's
 * reducer stays the single source of truth.
 */

import * as React from 'react';
import type {
  PeopleCultureHomepageTier,
  PeopleCultureItem,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  COMPANION_COLORS,
  DANGER_BUTTON_STYLE,
  DRAWER_BODY_STYLE,
  DRAWER_FOOTER_STYLE,
  DRAWER_HEADER_STYLE,
  DRAWER_OVERLAY_STYLE,
  DRAWER_STYLE,
  FIELD_GROUP_STYLE,
  FIELD_LABEL_STYLE,
  INPUT_STYLE,
  PRIMARY_BUTTON_STYLE,
  SECONDARY_BUTTON_STYLE,
  SELECT_STYLE,
  TEXTAREA_STYLE,
} from '../companionStyles.js';

export interface QuickEditDrawerProps {
  item: PeopleCultureItem;
  onClose: () => void;
  onOpenFullEditor: () => void;
  onSubmit: (patch: Partial<PeopleCultureItem>) => void;
  onSuppress: () => void;
  onArchive: () => void;
}

function toDateInput(value: string | undefined): string {
  if (!value) return '';
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return '';
  return new Date(ms).toISOString().slice(0, 10);
}

function fromDateInput(value: string): string | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms).toISOString();
}

export function QuickEditDrawer({
  item,
  onClose,
  onOpenFullEditor,
  onSubmit,
  onSuppress,
  onArchive,
}: QuickEditDrawerProps): React.JSX.Element {
  const [title, setTitle] = React.useState(item.title);
  const [body, setBody] = React.useState(item.body);
  const [scheduledStart, setScheduledStart] = React.useState(
    toDateInput(item.scheduledStart),
  );
  const [expiresAt, setExpiresAt] = React.useState(toDateInput(item.expiresAt));
  const [tier, setTier] = React.useState<PeopleCultureHomepageTier>(item.homepage.tier);
  const [audienceKind, setAudienceKind] = React.useState<'companyWide' | 'targeted'>(
    item.audience.kind,
  );
  const [audienceValue, setAudienceValue] = React.useState(() =>
    item.audience.kind === 'targeted'
      ? item.audience.tags.map((t) => `${t.dimension}:${t.value}`).join(', ')
      : '',
  );

  const handleSave = (): void => {
    const audience =
      audienceKind === 'companyWide'
        ? ({ kind: 'companyWide' } as const)
        : ({
            kind: 'targeted' as const,
            tags: audienceValue
              .split(',')
              .map((entry) => entry.trim())
              .filter(Boolean)
              .map((entry) => {
                const [dim, ...rest] = entry.split(':');
                return {
                  dimension: (dim?.trim() as
                    | 'office'
                    | 'department'
                    | 'region'
                    | 'roleFamily'
                    | 'projectTeam') ?? 'office',
                  value: rest.join(':').trim() || entry,
                };
              }),
          } as const);

    const patch: Partial<PeopleCultureItem> = {
      title: title.trim() || item.title,
      body: body.trim() || item.body,
      scheduledStart: fromDateInput(scheduledStart),
      expiresAt: fromDateInput(expiresAt),
      homepage: {
        ...item.homepage,
        tier,
        overrideSource: tier === item.homepage.tier ? item.homepage.overrideSource : 'hrOverride',
      },
      audience,
    };
    onSubmit(patch);
  };

  return (
    <div
      role="dialog"
      aria-label="Quick edit"
      data-hbc-companion-drawer="quick-edit"
      data-hbc-companion-drawer-item={item.id}
      style={DRAWER_OVERLAY_STYLE}
      onClick={onClose}
    >
      <aside
        style={DRAWER_STYLE}
        onClick={(event) => event.stopPropagation()}
      >
        <header style={DRAWER_HEADER_STYLE}>
          <strong>Quick edit</strong>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              cursor: 'pointer',
              color: COMPANION_COLORS.inkMuted,
            }}
          >
            ×
          </button>
        </header>
        <div style={DRAWER_BODY_STYLE}>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="quick-title" style={FIELD_LABEL_STYLE}>
              Title
            </label>
            <input
              id="quick-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              style={INPUT_STYLE}
              data-hbc-companion-quick-edit-field="title"
            />
          </div>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="quick-body" style={FIELD_LABEL_STYLE}>
              Body
            </label>
            <textarea
              id="quick-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              style={TEXTAREA_STYLE}
              data-hbc-companion-quick-edit-field="body"
            />
          </div>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="quick-scheduled-start" style={FIELD_LABEL_STYLE}>
              Scheduled start
            </label>
            <input
              id="quick-scheduled-start"
              type="date"
              value={scheduledStart}
              onChange={(event) => setScheduledStart(event.target.value)}
              style={INPUT_STYLE}
              data-hbc-companion-quick-edit-field="scheduledStart"
            />
          </div>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="quick-expires-at" style={FIELD_LABEL_STYLE}>
              Expires at
            </label>
            <input
              id="quick-expires-at"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              style={INPUT_STYLE}
              data-hbc-companion-quick-edit-field="expiresAt"
            />
          </div>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="quick-tier" style={FIELD_LABEL_STYLE}>
              Homepage tier
            </label>
            <select
              id="quick-tier"
              value={tier}
              onChange={(event) =>
                setTier(event.target.value as PeopleCultureHomepageTier)
              }
              style={SELECT_STYLE}
              data-hbc-companion-quick-edit-field="tier"
            >
              <option value="featured">Featured</option>
              <option value="supporting">Supporting</option>
              <option value="excluded">Excluded</option>
            </select>
          </div>
          <div style={FIELD_GROUP_STYLE}>
            <label htmlFor="quick-audience" style={FIELD_LABEL_STYLE}>
              Audience scope
            </label>
            <select
              id="quick-audience"
              value={audienceKind}
              onChange={(event) =>
                setAudienceKind(event.target.value as 'companyWide' | 'targeted')
              }
              style={SELECT_STYLE}
              data-hbc-companion-quick-edit-field="audienceKind"
            >
              <option value="companyWide">Company-wide</option>
              <option value="targeted">Targeted</option>
            </select>
          </div>
          {audienceKind === 'targeted' ? (
            <div style={FIELD_GROUP_STYLE}>
              <label htmlFor="quick-audience-tags" style={FIELD_LABEL_STYLE}>
                Audience tags (dimension:value, comma-separated)
              </label>
              <input
                id="quick-audience-tags"
                type="text"
                value={audienceValue}
                onChange={(event) => setAudienceValue(event.target.value)}
                placeholder="office:Coral Springs, department:SAFETY"
                style={INPUT_STYLE}
                data-hbc-companion-quick-edit-field="audienceValue"
              />
            </div>
          ) : null}
        </div>
        <footer style={DRAWER_FOOTER_STYLE}>
          <button
            type="button"
            style={DANGER_BUTTON_STYLE}
            onClick={onSuppress}
            data-hbc-companion-action="quick-suppress"
          >
            Suppress
          </button>
          <button
            type="button"
            style={DANGER_BUTTON_STYLE}
            onClick={onArchive}
            data-hbc-companion-action="quick-archive"
          >
            Archive
          </button>
          <button
            type="button"
            style={SECONDARY_BUTTON_STYLE}
            onClick={onOpenFullEditor}
            data-hbc-companion-action="open-full-editor-from-drawer"
          >
            Open full editor
          </button>
          <button
            type="button"
            style={PRIMARY_BUTTON_STYLE}
            onClick={handleSave}
            data-hbc-companion-action="quick-save"
          >
            Save
          </button>
        </footer>
      </aside>
    </div>
  );
}
