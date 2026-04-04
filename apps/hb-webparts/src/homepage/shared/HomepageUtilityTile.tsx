import * as React from 'react';
import { HbcCard } from '@hbc/ui-kit/homepage';
import type { HomepageCtaLink } from '../models/contentModels.js';

export interface HomepageUtilityTileProps {
  title: string;
  description: string;
  cta: HomepageCtaLink;
}

export function HomepageUtilityTile({ title, description, cta }: HomepageUtilityTileProps): React.JSX.Element {
  return (
    <HbcCard header={<h3>{title}</h3>}>
      <p>{description}</p>
      <a href={cta.href}>{cta.label}</a>
    </HbcCard>
  );
}
