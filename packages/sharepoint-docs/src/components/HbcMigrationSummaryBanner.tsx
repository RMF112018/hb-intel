import React from 'react';
import type { IMigrationResult } from '../types/index.js';

interface HbcMigrationSummaryBannerProps {
  result: IMigrationResult;
  onViewConflicts?: () => void;
  onDismiss?: () => void;
}

export const HbcMigrationSummaryBanner: React.FC<HbcMigrationSummaryBannerProps> = ({
  result, onViewConflicts, onDismiss,
}) => {
  const bannerType =
    result.status === 'completed' ? 'success' :
    result.status === 'conflict-pending' ? 'warning' : 'error';

  return (
    <div
      className={`hbc-migration-banner hbc-migration-banner--${bannerType}`}
      role="status"
      aria-live="polite"
    >
      <div className="hbc-migration-banner__summary">
        {result.status === 'completed' && (
          <>✓ {result.migratedCount} document{result.migratedCount !== 1 ? 's' : ''} moved to the project site.</>
        )}
        {result.status === 'conflict-pending' && (
          <>{result.migratedCount} documents moved. {result.conflictCount} conflict{result.conflictCount !== 1 ? 's' : ''} need your attention.</>
        )}
        {result.status === 'partial' && (
          <>{result.migratedCount} moved, {result.failedCount} failed. The team has been notified.</>
        )}
      </div>
      <div className="hbc-migration-banner__actions">
        {result.conflictCount > 0 && onViewConflicts && (
          <button type="button" className="hbc-btn hbc-btn--primary hbc-btn--small" onClick={onViewConflicts}>
            Resolve {result.conflictCount} conflict{result.conflictCount !== 1 ? 's' : ''}
          </button>
        )}
        {onDismiss && (
          <button type="button" className="hbc-btn hbc-btn--ghost hbc-btn--small" onClick={onDismiss} aria-label="Dismiss notification">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
