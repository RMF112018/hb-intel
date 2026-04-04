import * as React from 'react';
import { HbcCard, HbcStatusBadge } from '@hbc/ui-kit/homepage';
import type { HomepageSpotlightItem } from '../models/contentModels.js';

export interface HomepageSpotlightCardProps {
  item: HomepageSpotlightItem;
}

export function HomepageSpotlightCard({ item }: HomepageSpotlightCardProps): React.JSX.Element {
  return (
    <HbcCard header={<h3>{item.title}</h3>}>
      {item.statusLabel ? <HbcStatusBadge label={item.statusLabel} variant="info" /> : null}
      <p>{item.summary}</p>
      {item.cta ? <a href={item.cta.href}>{item.cta.label}</a> : null}
    </HbcCard>
  );
}
