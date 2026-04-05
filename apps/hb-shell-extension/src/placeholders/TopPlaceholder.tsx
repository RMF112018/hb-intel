import * as React from 'react';

export interface TopPlaceholderProps {
  /** Whether this placeholder region is available in the current page */
  available: boolean;
}

/**
 * Top placeholder content for the shell extension.
 *
 * Renders into SharePoint's Top placeholder region. Contains the
 * top ribbon utilities and alert/notification band.
 *
 * Gracefully renders nothing when the placeholder is unavailable.
 */
export function TopPlaceholder({ available }: TopPlaceholderProps): React.JSX.Element | null {
  if (!available) {
    return null;
  }

  return (
    <div
      data-hbc-shell-extension="top-placeholder"
      role="banner"
      aria-label="HB Intel top ribbon"
    >
      <div data-hbc-shell-extension="top-ribbon">
        {/* Top ribbon content — Phase 04-02 will implement */}
      </div>
      <div data-hbc-shell-extension="alert-band" role="status" aria-live="polite">
        {/* Alert/notification band — Phase 04-02 will implement */}
      </div>
    </div>
  );
}
