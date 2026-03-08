/**
 * Root React component for the standalone HBC Document Manager webpart.
 *
 * Gap 3 fix: uses useCurrentUser() from @hbc/auth (not useAuth).
 *   - email is used as ownerUpn (email IS the UPN in Microsoft Entra ID)
 *   - lastName is derived from displayName
 *
 * @see docs/architecture/plans/shared-features/SF01-T07-SPFx-Integration.md §4
 * @decision D-09 — standalone webpart surface
 */
import React, { lazy, Suspense, type FC } from 'react';
import type { IDocumentContextConfig, DocumentContextType } from '@hbc/sharepoint-docs';
import { useCurrentUser } from '@hbc/auth';

const HbcDocumentAttachment = lazy(() =>
  import('@hbc/sharepoint-docs').then((m) => ({ default: m.HbcDocumentAttachment })),
);
const HbcDocumentList = lazy(() =>
  import('@hbc/sharepoint-docs').then((m) => ({ default: m.HbcDocumentList })),
);

export interface HbcDocumentManagerRootProps {
  contextId: string;
  contextType: DocumentContextType;
  contextLabel: string;
  allowUpload: boolean;
}

export const HbcDocumentManagerRoot: FC<HbcDocumentManagerRootProps> = ({
  contextId,
  contextType,
  contextLabel,
  allowUpload,
}) => {
  const currentUser = useCurrentUser();

  const ownerUpn = currentUser?.email ?? '';
  const ownerLastName = currentUser?.displayName?.trim().split(/\s+/).pop() ?? '';

  const contextConfig: IDocumentContextConfig = {
    contextId,
    contextType,
    contextLabel,
    siteUrl: null,
    ownerUpn,
    ownerLastName,
  };

  return (
    <div className="hbc-document-manager-webpart">
      <Suspense
        fallback={
          <div className="hbc-skeleton" aria-busy="true">
            Loading documents&hellip;
          </div>
        }
      >
        {allowUpload ? (
          <HbcDocumentAttachment contextConfig={contextConfig} />
        ) : (
          <HbcDocumentList contextId={contextId} contextType={contextType} />
        )}
      </Suspense>
    </div>
  );
};
