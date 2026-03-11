import { createElement } from 'react';
import type { ReactElement, FC } from 'react';
import {
  Search,
  StatusDraftIcon,
  Filter,
  HardHat,
  StatusAttentionIcon,
  StatusInfoIcon,
} from '@hbc/ui-kit/icons';
import type { EmptyStateClassification } from '../types/ISmartEmptyState.js';

export interface HbcEmptyStateIllustrationProps {
  classification: EmptyStateClassification;
  illustrationKey?: string;
  size?: 'sm' | 'md' | 'lg';
}

type IconComponent = FC<{ size?: 'sm' | 'md' | 'lg' }>;

const CLASSIFICATION_ICON_MAP: Record<EmptyStateClassification, IconComponent> = {
  'first-use': Search as IconComponent,
  'truly-empty': StatusDraftIcon as IconComponent,
  'filter-empty': Filter as IconComponent,
  'permission-empty': HardHat as IconComponent,
  'loading-failed': StatusAttentionIcon as IconComponent,
};

const ICON_KEY_MAP: Record<string, IconComponent> = {
  search: Search as IconComponent,
  draft: StatusDraftIcon as IconComponent,
  filter: Filter as IconComponent,
  hardhat: HardHat as IconComponent,
  attention: StatusAttentionIcon as IconComponent,
  info: StatusInfoIcon as IconComponent,
};

const FALLBACK_ICON: IconComponent = StatusInfoIcon as IconComponent;

export function HbcEmptyStateIllustration({
  classification,
  illustrationKey,
  size = 'md',
}: HbcEmptyStateIllustrationProps): ReactElement {
  let Icon: IconComponent;

  if (illustrationKey) {
    Icon = ICON_KEY_MAP[illustrationKey] ?? FALLBACK_ICON;
  } else {
    Icon = CLASSIFICATION_ICON_MAP[classification];
  }

  return (
    <span
      className="hbc-empty-state__illustration"
      data-classification={classification}
      data-size={size}
      aria-hidden="true"
    >
      {createElement(Icon, { size })}
    </span>
  );
}
