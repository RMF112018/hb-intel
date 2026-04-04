import * as React from 'react';
import { HbcCard } from '@hbc/ui-kit/homepage';
import type { HomepagePersonRecognition } from '../models/contentModels.js';

export interface HomepagePersonRecognitionCardProps {
  item: HomepagePersonRecognition;
}

export function HomepagePersonRecognitionCard({ item }: HomepagePersonRecognitionCardProps): React.JSX.Element {
  return (
    <HbcCard header={<h3>{item.personName}</h3>}>
      <p>{item.recognitionText}</p>
    </HbcCard>
  );
}
