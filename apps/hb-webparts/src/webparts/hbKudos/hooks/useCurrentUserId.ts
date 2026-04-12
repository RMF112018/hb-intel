/**
 * useCurrentUserId — SharePoint current-user id resolution.
 *
 * Tiny hook extracted from HbKudos.tsx so the public runtime does not
 * carry this effect directly. Used by archive visibility predicates
 * (isAssociatedVisible) to gate no-longer-public items for the
 * submitter / recipient view.
 */
import * as React from 'react';
import { resolveCurrentUserId } from '../../../homepage/data/spContext.js';

export function useCurrentUserId(): number | undefined {
  const [userId, setUserId] = React.useState<number | undefined>();
  React.useEffect(() => {
    resolveCurrentUserId().then(setUserId).catch(() => {});
  }, []);
  return userId;
}
