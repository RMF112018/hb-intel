import * as React from 'react';

export interface BottomPlaceholderProps {
  /** Whether this placeholder region is available in the current page */
  available: boolean;
}

/**
 * Bottom placeholder content for the shell extension.
 *
 * Renders into SharePoint's Bottom placeholder region. Contains the
 * footer rail and support band.
 *
 * Gracefully renders nothing when the placeholder is unavailable.
 */
export function BottomPlaceholder({ available }: BottomPlaceholderProps): React.JSX.Element | null {
  if (!available) {
    return null;
  }

  return (
    <div
      data-hbc-shell-extension="bottom-placeholder"
      role="contentinfo"
      aria-label="HB Intel footer rail"
    >
      <div data-hbc-shell-extension="footer-rail">
        {/* Footer rail content — Phase 04-03 will implement */}
      </div>
      <div data-hbc-shell-extension="support-band">
        {/* Support band content — Phase 04-03 will implement */}
      </div>
    </div>
  );
}
