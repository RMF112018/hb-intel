/**
 * HbcCalendarGrid — Month calendar grid for Daily Log
 * PH4.13 §13.5 | Blueprint §1d
 *
 * Standalone calendar layout (not ToolLandingLayout). Shows month header with
 * prev/next navigation, 7-column CSS Grid (Sun–Sat), day cells with status dots,
 * weather icons, crew count badges. Today gets an orange ring highlight.
 */
import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_ACCENT_ORANGE,
  HBC_STATUS_COLORS,
  HBC_SURFACE_LIGHT,
} from '../theme/tokens.js';
import type { CalendarDayData, HbcCalendarGridProps } from './types.js';

const STATUS_DOT_COLORS: Record<string, string> = {
  draft: HBC_STATUS_COLORS.draft,
  submitted: HBC_STATUS_COLORS.info,
  approved: HBC_STATUS_COLORS.success,
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '4px',
    paddingBottom: '4px',
  },
  headerTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: `1px solid ${HBC_SURFACE_LIGHT['border-default']}`,
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '1rem',
    color: HBC_SURFACE_LIGHT['text-primary'],
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '1px',
    backgroundColor: HBC_SURFACE_LIGHT['border-default'],
    borderRadius: '8px',
    overflow: 'hidden',
  },
  weekdayHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '8px',
    paddingBottom: '8px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-2'],
    fontSize: '0.75rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-muted'],
    textTransform: 'uppercase',
  },
  dayCell: {
    minHeight: '44px',
    minWidth: '44px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    paddingTop: '6px',
    paddingBottom: '6px',
    paddingLeft: '4px',
    paddingRight: '4px',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    cursor: 'pointer',
    transitionProperty: 'background-color',
    transitionDuration: '150ms',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    },
  },
  dayCellEmpty: {
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    cursor: 'default',
    ':hover': {
      backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    },
  },
  dayCellToday: {
    boxShadow: `inset 0 0 0 2px ${HBC_ACCENT_ORANGE}`,
  },
  dayNumber: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  weatherIcon: {
    fontSize: '0.75rem',
    lineHeight: 1,
  },
  crewBadge: {
    fontSize: '0.625rem',
    fontWeight: 600,
    color: HBC_SURFACE_LIGHT['text-muted'],
    lineHeight: 1,
  },
  badgeRow: {
    display: 'flex',
    gap: '2px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});

function getTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function HbcCalendarGrid({
  year,
  month,
  days,
  onDayClick,
  onMonthChange,
  className,
}: HbcCalendarGridProps): React.JSX.Element {
  const styles = useStyles();
  const todayISO = getTodayISO();

  // Build lookup map from days array
  const dayMap = React.useMemo(() => {
    const map = new Map<string, CalendarDayData>();
    for (const day of days) {
      map.set(day.date, day);
    }
    return map;
  }, [days]);

  // Calendar math
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells: Array<{ day: number | null; dateISO: string | null }> = [];
  // Leading empty cells
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ day: null, dateISO: null });
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, dateISO });
  }

  return (
    <div
      data-hbc-ui="calendar-grid"
      className={mergeClasses(styles.root, className)}
    >
      {/* Month header */}
      <div className={styles.header}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onMonthChange?.(-1)}
          aria-label="Previous month"
        >
          &#8249;
        </button>
        <span className={styles.headerTitle}>
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => onMonthChange?.(1)}
          aria-label="Next month"
        >
          &#8250;
        </button>
      </div>

      {/* Calendar grid */}
      <div className={styles.grid} role="grid" aria-label={`${MONTH_NAMES[month]} ${year}`}>
        {/* Weekday headers */}
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className={styles.weekdayHeader} role="columnheader">
            {label}
          </div>
        ))}

        {/* Day cells */}
        {calendarCells.map((cell, index) => {
          if (cell.day === null) {
            return (
              <div
                key={`empty-${index}`}
                className={mergeClasses(styles.dayCell, styles.dayCellEmpty)}
                role="gridcell"
              />
            );
          }

          const dayData = cell.dateISO ? dayMap.get(cell.dateISO) : undefined;
          const isToday = cell.dateISO === todayISO;

          return (
            <div
              key={cell.dateISO}
              className={mergeClasses(
                styles.dayCell,
                isToday ? styles.dayCellToday : undefined,
              )}
              role="gridcell"
              aria-label={`${MONTH_NAMES[month]} ${cell.day}${isToday ? ', Today' : ''}`}
              tabIndex={0}
              onClick={() => cell.dateISO && onDayClick?.(cell.dateISO)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && cell.dateISO) {
                  e.preventDefault();
                  onDayClick?.(cell.dateISO);
                }
              }}
            >
              <span className={styles.dayNumber}>{cell.day}</span>
              {dayData?.status && (
                <div
                  className={styles.statusDot}
                  style={{ backgroundColor: STATUS_DOT_COLORS[dayData.status] }}
                  aria-label={dayData.status}
                />
              )}
              <div className={styles.badgeRow}>
                {dayData?.weatherIcon && (
                  <span className={styles.weatherIcon}>{dayData.weatherIcon}</span>
                )}
                {dayData?.crewCount !== undefined && (
                  <span className={styles.crewBadge}>{dayData.crewCount}c</span>
                )}
                {dayData?.badges?.map((badge, i) => (
                  <span key={i}>{badge}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { CalendarDayData, HbcCalendarGridProps } from './types.js';
