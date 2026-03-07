import type { ReactNode } from 'react';

/**
 * D-PH6-12 notification state variants for cross-app provisioning banners.
 * Traceability: docs/architecture/plans/PH6.12-CrossApp-Notifications.md §6.12.1
 */
export type ProvisioningNotificationVariant = 'started' | 'completed' | 'failed';

/**
 * D-PH6-12 presentational props for the shared provisioning notification banner.
 */
export interface IProvisioningNotificationBannerProps {
  variant: ProvisioningNotificationVariant;
  message: string;
  onDismiss: () => void;
  siteUrl?: string;
}

const VARIANT_STYLES: Record<ProvisioningNotificationVariant, string> = {
  // D-PH6-12 visual contract: started = informational blue.
  started: 'bg-blue-50 border-blue-200 text-blue-900',
  // D-PH6-12 visual contract: completed = success green.
  completed: 'bg-green-50 border-green-200 text-green-900',
  // D-PH6-12 visual contract: failed = alert red.
  failed: 'bg-red-50 border-red-200 text-red-900',
};

const VARIANT_ICONS: Record<ProvisioningNotificationVariant, string> = {
  started: '🏗️',
  completed: '🎉',
  failed: '⚠️',
};

/**
 * D-PH6-12 reusable cross-app provisioning notification banner.
 * This component is intentionally headless from business logic; host apps decide when to show it.
 */
export function ProvisioningNotificationBanner({
  variant,
  message,
  onDismiss,
  siteUrl,
}: IProvisioningNotificationBannerProps): ReactNode {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border rounded-lg ${VARIANT_STYLES[variant]}`}>
      <span className="text-xl" aria-hidden>
        {VARIANT_ICONS[variant]}
      </span>
      <p className="flex-1 text-sm">{message}</p>
      {siteUrl && variant === 'completed' ? (
        <a href={siteUrl} target="_blank" rel="noreferrer" className="text-sm underline font-medium">
          Open Site →
        </a>
      ) : null}
      <button type="button" onClick={onDismiss} className="text-sm opacity-60 hover:opacity-100">
        ✕
      </button>
    </div>
  );
}
