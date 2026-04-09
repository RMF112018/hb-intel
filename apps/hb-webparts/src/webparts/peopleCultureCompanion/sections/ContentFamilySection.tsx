/**
 * Content-family workspace for the People & Culture HR operating
 * companion. Phase-14 pc/ Prompt-03.
 *
 * One instance per content family (announcement /
 * celebrationMilestone / cultureProgramEvent). Provides:
 *
 *   - eight lifecycle-state filters as required by the Decision-Lock
 *     Appendix (Draft, Needs Approval, Scheduled, Live, Expiring
 *     Soon, Expired, Archived, Suppressed)
 *   - the default editorial list view
 *   - an optional calendar mode for scheduled/live planning
 *   - selection opens the shared quick-edit drawer
 *   - a "Full editor" per-row button opens the richer modal
 */

import * as React from 'react';
import type {
  PeopleCultureContentFamily,
  PeopleCultureItem,
  PeopleCultureLifecycleState,
} from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import { PEOPLE_CULTURE_LIFECYCLE_STATES } from '../../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  BADGE_STYLE,
  CALENDAR_CELL_STYLE,
  CALENDAR_DAY_LABEL_STYLE,
  CALENDAR_GRID_STYLE,
  CALENDAR_ITEM_STYLE,
  CHIP_BUTTON_ACTIVE_STYLE,
  CHIP_BUTTON_STYLE,
  EMPTY_STATE_STYLE,
  LIST_BODY_STYLE,
  LIST_META_ROW_STYLE,
  LIST_ROW_STYLE,
  LIST_ROW_TEXT_STYLE,
  LIST_STYLE,
  LIST_TITLE_STYLE,
  PANEL_STYLE,
  PINNED_BADGE_STYLE,
  SECONDARY_BUTTON_STYLE,
  SECTION_HINT_STYLE,
  SECTION_TITLE_STYLE,
  TOOLBAR_STYLE,
} from '../companionStyles.js';

const FAMILY_HEADING: Record<PeopleCultureContentFamily, string> = {
  announcement: 'Announcements',
  celebrationMilestone: 'Celebrations / Milestones',
  cultureProgramEvent: 'Culture Programs / Events',
};

const LIFECYCLE_LABEL: Record<PeopleCultureLifecycleState, string> = {
  draft: 'Draft',
  needsApproval: 'Needs Approval',
  scheduled: 'Scheduled',
  live: 'Live',
  expiringSoon: 'Expiring Soon',
  expired: 'Expired',
  archived: 'Archived',
  suppressed: 'Suppressed',
};

export type ContentFamilyView = 'list' | 'calendar';

export interface ContentFamilySectionProps {
  family: PeopleCultureContentFamily;
  items: PeopleCultureItem[];
  onSelect: (id: string) => void;
  onOpenFullEditor: (id: string) => void;
}

function parseMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : undefined;
}

function CalendarView({
  items,
  onSelect,
}: {
  items: PeopleCultureItem[];
  onSelect: (id: string) => void;
}): React.JSX.Element {
  // Lightweight 14-day rolling calendar grid. Each day cell lists the
  // items whose scheduledStart or publishedAt falls on that day.
  const today = React.useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const days = React.useMemo(() => {
    const arr: Array<{ label: string; dayMs: number }> = [];
    for (let offset = 0; offset < 14; offset += 1) {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      arr.push({
        label: d.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        dayMs: d.getTime(),
      });
    }
    return arr;
  }, [today]);

  const itemsByDay = React.useMemo(() => {
    const map = new Map<number, PeopleCultureItem[]>();
    for (const item of items) {
      const ms =
        parseMs(item.scheduledStart) ?? parseMs(item.publishedAt);
      if (ms === undefined) continue;
      const dayStart = new Date(ms);
      dayStart.setHours(0, 0, 0, 0);
      const key = dayStart.getTime();
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items]);

  return (
    <div
      data-hbc-companion-view="calendar"
      style={CALENDAR_GRID_STYLE}
      role="grid"
      aria-label="Scheduled and live items over the next 14 days"
    >
      {days.map(({ label, dayMs }) => {
        const cellItems = itemsByDay.get(dayMs) ?? [];
        return (
          <div key={dayMs} style={CALENDAR_CELL_STYLE} role="gridcell">
            <div style={CALENDAR_DAY_LABEL_STYLE}>{label}</div>
            {cellItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                style={{ ...CALENDAR_ITEM_STYLE, textAlign: 'left', border: 'none' }}
                data-hbc-companion-calendar-item={item.id}
                title={item.title}
              >
                {item.title}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function ContentFamilySection({
  family,
  items,
  onSelect,
  onOpenFullEditor,
}: ContentFamilySectionProps): React.JSX.Element {
  const [lifecycleFilter, setLifecycleFilter] = React.useState<PeopleCultureLifecycleState>('live');
  const [view, setView] = React.useState<ContentFamilyView>('list');

  const filtered = React.useMemo(
    () => items.filter((item) => item.lifecycleState === lifecycleFilter),
    [items, lifecycleFilter],
  );

  // Counts per lifecycle state for the chip labels.
  const counts = React.useMemo(() => {
    const base: Record<PeopleCultureLifecycleState, number> = {
      draft: 0,
      needsApproval: 0,
      scheduled: 0,
      live: 0,
      expiringSoon: 0,
      expired: 0,
      archived: 0,
      suppressed: 0,
    };
    for (const item of items) base[item.lifecycleState] += 1;
    return base;
  }, [items]);

  return (
    <div
      role="tabpanel"
      aria-label={`${FAMILY_HEADING[family]} workspace`}
      data-hbc-companion-section="content-family"
      data-hbc-companion-family={family}
      data-hbc-companion-lifecycle-filter={lifecycleFilter}
      data-hbc-companion-view={view}
      style={PANEL_STYLE}
    >
      <div>
        <h3 style={SECTION_TITLE_STYLE}>{FAMILY_HEADING[family]}</h3>
        <p style={SECTION_HINT_STYLE}>
          Default editorial list view with lifecycle filters and an optional
          calendar mode for scheduled / live planning.
        </p>
      </div>

      <div
        style={TOOLBAR_STYLE}
        role="group"
        aria-label="Lifecycle filters"
      >
        {PEOPLE_CULTURE_LIFECYCLE_STATES.map((state) => (
          <button
            key={state}
            type="button"
            aria-pressed={lifecycleFilter === state}
            data-hbc-companion-lifecycle-chip={state}
            onClick={() => setLifecycleFilter(state)}
            style={
              lifecycleFilter === state ? CHIP_BUTTON_ACTIVE_STYLE : CHIP_BUTTON_STYLE
            }
          >
            {LIFECYCLE_LABEL[state]} ({counts[state]})
          </button>
        ))}
      </div>

      <div style={TOOLBAR_STYLE}>
        <button
          type="button"
          style={view === 'list' ? CHIP_BUTTON_ACTIVE_STYLE : CHIP_BUTTON_STYLE}
          onClick={() => setView('list')}
          data-hbc-companion-view-toggle="list"
        >
          List
        </button>
        <button
          type="button"
          style={view === 'calendar' ? CHIP_BUTTON_ACTIVE_STYLE : CHIP_BUTTON_STYLE}
          onClick={() => setView('calendar')}
          data-hbc-companion-view-toggle="calendar"
        >
          Calendar
        </button>
      </div>

      {view === 'calendar' ? (
        <CalendarView
          items={items.filter(
            (i) => i.lifecycleState === 'scheduled' || i.lifecycleState === 'live' || i.lifecycleState === 'expiringSoon',
          )}
          onSelect={onSelect}
        />
      ) : filtered.length === 0 ? (
        <div style={EMPTY_STATE_STYLE} role="status">
          No {LIFECYCLE_LABEL[lifecycleFilter].toLowerCase()} items in this family.
        </div>
      ) : (
        <ul style={LIST_STYLE} data-hbc-companion-view="list">
          {filtered.map((item) => (
            <li
              key={item.id}
              style={LIST_ROW_STYLE}
              data-hbc-companion-item-id={item.id}
              data-hbc-companion-item-lifecycle={item.lifecycleState}
            >
              <div
                style={LIST_ROW_TEXT_STYLE}
                onClick={() => onSelect(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(item.id);
                  }
                }}
              >
                <p style={LIST_TITLE_STYLE}>{item.title}</p>
                <p style={LIST_BODY_STYLE}>{item.body}</p>
                <div style={LIST_META_ROW_STYLE}>
                  <span style={BADGE_STYLE}>{item.homepage.tier}</span>
                  {item.homepage.isPinned ? (
                    <span style={PINNED_BADGE_STYLE}>Pinned</span>
                  ) : null}
                  {item.approvalTrigger !== 'standard' ? (
                    <span style={BADGE_STYLE}>{item.approvalTrigger}</span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                style={SECONDARY_BUTTON_STYLE}
                onClick={() => onOpenFullEditor(item.id)}
                data-hbc-companion-action="open-full-editor"
                data-hbc-companion-action-target={item.id}
              >
                Full editor
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
