import * as React from 'react';
import type { HbHomepageProps } from './hbHomepageContract.js';
import { HbHomepageEntryStack } from './HbHomepageEntryStack.js';

export function HbHomepage(props: HbHomepageProps): React.JSX.Element {
  return <HbHomepageEntryStack {...props} />;
}
