import { Fragment, type FC } from 'react';
import { PccDocumentsHeaderCard } from './PccDocumentsHeaderCard';
import { PccMicrosoftFileSourceCard } from './PccMicrosoftFileSourceCard';
import { PccExternalDocSystemCard } from './PccExternalDocSystemCard';
import { sourceIdsInLane } from './shared';

/**
 * Wave 2 / Prompt 06 — Documents (Document Control Center) surface.
 *
 * Two-lane preview model:
 *   1. Microsoft Files Lane — SharePoint Drive + OneDrive with disabled,
 *      preview-only file-management action chips. No Graph/PnP imports.
 *   2. External Document Systems Lane — Procore Files + Document Crunch +
 *      Adobe Sign with launch / visibility cues. No SDKs, no API calls,
 *      no `<a href>` launch behavior.
 *
 * Returns a fragment so every card stays a direct DOM child of
 * `[data-pcc-bento-grid]`.
 */
export const PccDocumentsSurface: FC = () => (
  <Fragment>
    <PccDocumentsHeaderCard />
    {sourceIdsInLane('microsoft-files').map((id) => (
      <PccMicrosoftFileSourceCard key={id} sourceId={id} />
    ))}
    {sourceIdsInLane('external-document-systems').map((id) => (
      <PccExternalDocSystemCard key={id} sourceId={id} />
    ))}
  </Fragment>
);

export default PccDocumentsSurface;
