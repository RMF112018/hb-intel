import type { AlertCategory } from './AlertCategory.js';
import type { AlertSeverity } from './AlertSeverity.js';

/**
 * Represents an alert surfaced by the Admin Intelligence monitoring layer.
 *
 * @design D-02, D-03, SF17-T02
 */
export interface IAdminAlert {
  readonly alertId: string;
  readonly category: AlertCategory;
  readonly severity: AlertSeverity;
  readonly title: string;
  readonly description: string;
  readonly affectedEntityType: 'record' | 'user' | 'site' | 'job' | 'system';
  readonly affectedEntityId: string;
  readonly occurredAt: string;
  readonly acknowledgedAt?: string;
  readonly acknowledgedBy?: string;
  readonly resolvedAt?: string;
  readonly ctaLabel?: string;
  readonly ctaHref?: string;
}
