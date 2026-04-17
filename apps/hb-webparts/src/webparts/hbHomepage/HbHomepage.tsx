import * as React from 'react';
import type { HbHomepageProps } from './hbHomepageContract.js';
import { HbHomepageShell } from './HbHomepageShell.js';

export function HbHomepage(props: HbHomepageProps): React.JSX.Element {
  return <HbHomepageShell {...props} />;
}
