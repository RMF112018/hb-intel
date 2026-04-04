import * as React from 'react';
import { HbcCard } from '@hbc/ui-kit/homepage';
import type { HomepageCuratedListItem } from '../models/contentModels.js';

export interface HomepageEditorialCardProps {
  item: HomepageCuratedListItem;
}

export function HomepageEditorialCard({ item }: HomepageEditorialCardProps): React.JSX.Element {
  return (
    <HbcCard header={<h3>{item.title}</h3>}>
      <p>{item.summary ?? ''}</p>
      {item.cta ? <a href={item.cta.href}>{item.cta.label}</a> : null}
    </HbcCard>
  );
}
