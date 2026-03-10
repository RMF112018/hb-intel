declare module '@hbc/ui-kit' {
  import type { ComponentType, ReactNode } from 'react';

  export interface HbcButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    icon?: ReactNode;
    iconPosition?: 'before' | 'after';
    children?: ReactNode;
  }

  export const HbcButton: ComponentType<HbcButtonProps>;

  export interface HbcStatusBadgeProps {
    variant: 'onTrack' | 'atRisk' | 'critical' | 'error' | 'info' | 'neutral';
    label: string;
    size?: 'small' | 'medium';
  }

  export const HbcStatusBadge: ComponentType<HbcStatusBadgeProps>;

  export interface HbcTabPanel {
    tabId: string;
    content: ReactNode;
  }

  export interface HbcTabsProps {
    className?: string;
    tabs: ReadonlyArray<{ id: string; label: string }>;
    activeTabId: string;
    onTabChange: (tabId: string) => void;
    panels: HbcTabPanel[];
    isFieldMode?: boolean;
  }

  export const HbcTabs: ComponentType<HbcTabsProps>;
}
