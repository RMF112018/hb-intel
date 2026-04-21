import * as React from 'react';
import type { HbHomepageProps } from './hbHomepageContract.js';
import { HbHomepageEntryStack } from './HbHomepageEntryStack.js';
import { storeSiteUrl } from '../../homepage/data/spContext.js';

export function HbHomepage(props: HbHomepageProps): React.JSX.Element {
  React.useEffect(() => {
    storeSiteUrl(props.siteUrl);
  }, [props.siteUrl]);

  return <HbHomepageEntryStack {...props} />;
}
