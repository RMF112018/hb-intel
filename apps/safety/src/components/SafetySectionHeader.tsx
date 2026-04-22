import type { ReactNode } from 'react';
import { HbcTypography } from '@hbc/ui-kit';

export interface SafetySectionHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function SafetySectionHeader({
  title,
  description,
  actions,
}: SafetySectionHeaderProps): ReactNode {
  return (
    <div className="safety-section__header">
      <div>
        <HbcTypography intent="heading3">{title}</HbcTypography>
        {description && <HbcTypography intent="bodySmall">{description}</HbcTypography>}
      </div>
      {actions && <div className="safety-section__header-actions">{actions}</div>}
    </div>
  );
}
