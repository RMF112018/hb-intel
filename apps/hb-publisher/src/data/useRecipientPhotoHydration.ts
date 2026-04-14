/**
 * Graph-backed person-photo hook used by the Publisher teammate composer.
 *
 * Factored down from the hb-webparts hbKudos recipient-photo hook — only
 * the generic `useGraphPersonPhotoFn` is needed here; the kudos-specific
 * recipient hydrator is not in use in the Publisher surface.
 */
import * as React from 'react';
import { createGraphPersonPhotoFn } from '@hbc/ui-kit/homepage';

export function useGraphPersonPhotoFn(
  getGraphToken?: () => Promise<string>,
): ReturnType<typeof createGraphPersonPhotoFn> | undefined {
  return React.useMemo(
    () => (getGraphToken ? createGraphPersonPhotoFn(getGraphToken) : undefined),
    [getGraphToken],
  );
}
