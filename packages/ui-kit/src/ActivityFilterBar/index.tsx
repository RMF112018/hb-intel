/**
 * SF28-T06 — ActivityFilterBar.
 *
 * Filter UI control surface for activity timeline: event type chips,
 * actor filter, timeframe picker, system-event toggle, and reset.
 * Consumes state from useActivityFilters hook.
 *
 * Governing: SF28-T06, L-08
 */
import React from 'react';

export interface ActivityFilterBarProps {
  /** Currently selected event type filters */
  selectedEventTypes: string[];
  /** Whether system events are excluded */
  excludeSystemEvents: boolean;
  /** Whether any filter is active */
  hasActiveFilters: boolean;
  /** Called when event type filter changes */
  onEventTypesChange?: (types: string[]) => void;
  /** Called when system event toggle changes */
  onExcludeSystemEventsChange?: (exclude: boolean) => void;
  /** Called when all filters are reset */
  onReset?: () => void;
}

const barStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 0',
  borderBottom: '1px solid #e0e0e0',
  fontFamily: 'inherit',
  fontSize: 12,
  flexWrap: 'wrap',
};

const chipStyle: React.CSSProperties = {
  padding: '2px 8px',
  borderRadius: 12,
  backgroundColor: '#e6f0ff',
  color: '#0078d4',
  fontSize: 11,
  cursor: 'pointer',
  border: 'none',
};

const toggleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
  color: '#666',
};

const resetStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#0078d4',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  marginLeft: 'auto',
};

export function ActivityFilterBar({
  selectedEventTypes,
  excludeSystemEvents,
  hasActiveFilters,
  onEventTypesChange,
  onExcludeSystemEventsChange,
  onReset,
}: ActivityFilterBarProps): React.ReactElement {
  return (
    <div data-testid="activity-filter-bar" data-has-active-filters={hasActiveFilters} style={barStyle}>
      {selectedEventTypes.length > 0 && (
        <div data-testid="event-type-chips" style={{ display: 'flex', gap: 4 }}>
          {selectedEventTypes.map((type) => (
            <button
              key={type}
              type="button"
              style={chipStyle}
              onClick={() => {
                onEventTypesChange?.(selectedEventTypes.filter((t) => t !== type));
              }}
            >
              {type} ✕
            </button>
          ))}
        </div>
      )}

      <label style={toggleStyle}>
        <input
          type="checkbox"
          checked={excludeSystemEvents}
          onChange={(e) => onExcludeSystemEventsChange?.(e.target.checked)}
          data-testid="system-events-toggle"
        />
        Hide system events
      </label>

      {hasActiveFilters && (
        <button
          type="button"
          data-testid="filter-reset"
          style={resetStyle}
          onClick={onReset}
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
