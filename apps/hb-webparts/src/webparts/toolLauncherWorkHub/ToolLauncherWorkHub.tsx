import * as React from 'react';
import { HbcCard, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizeToolLauncherWorkHubConfig } from '../../homepage/helpers/utilityConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { HomepageRailShell } from '../../homepage/shared/HomepageRailShell.js';
import { HomepageUtilityDenseGroup } from '../../homepage/shared/HomepageUtilityDenseGroup.js';
import type { ToolLauncherWorkHubConfig } from '../../homepage/webparts/utilityContracts.js';

export interface ToolLauncherWorkHubProps {
  config?: Partial<ToolLauncherWorkHubConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

const ICON_MAP: Record<string, string> = {
  finance: 'FIN',
  field: 'FLD',
  hr: 'HR',
  safety: 'SFT',
  default: 'APP',
};

function resolveIconToken(iconKey: string | undefined): string {
  if (!iconKey) {
    return ICON_MAP.default;
  }
  return ICON_MAP[iconKey.toLowerCase()] ?? ICON_MAP.default;
}

export function ToolLauncherWorkHub({ config, activeAudience, isLoading = false }: ToolLauncherWorkHubProps): React.JSX.Element {
  if (isLoading) {
    return <HomepageLoadingState label="Loading tool launchers" />;
  }

  const normalized = normalizeToolLauncherWorkHubConfig(config, activeAudience);
  if (normalized.groups.length === 0) {
    const hasConfiguredInput = Boolean(config?.groups?.length);
    const message = resolveAuthoringMessage('toolLauncherWorkHub', hasConfiguredInput ? 'invalid' : 'noData');
    return (
      <HomepageEmptyState
        title={message.title}
        description={message.description}
      />
    );
  }

  return (
    <HbcCard header={<h2 style={{ margin: 0 }}>{normalized.heading}</h2>}>
      <HomepageRailShell label="tool-launcher-work-hub">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {normalized.groups.map((group) => (
            <HomepageUtilityDenseGroup key={group.id} title={group.title}>
              {group.items.map((item) => (
                <div key={item.id}>
                  <a href={item.href}>
                    <span aria-hidden="true" style={{ marginRight: 8 }}>{resolveIconToken(item.iconKey)}</span>
                    <span>{item.title}</span>
                  </a>
                  {item.badge ? <HbcStatusBadge label={item.badge.label} variant={item.badge.variant ?? 'neutral'} /> : null}
                  {item.description ? <p style={{ margin: '4px 0 0' }}>{item.description}</p> : null}
                </div>
              ))}
            </HomepageUtilityDenseGroup>
          ))}
        </div>
      </HomepageRailShell>
    </HbcCard>
  );
}
