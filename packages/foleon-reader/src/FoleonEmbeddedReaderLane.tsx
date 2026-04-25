import type { FoleonPageContext } from './types/foleon-event.types.js';
import type { FoleonContentRecord } from './types/foleon-content.types.js';
import type { FoleonGateReason } from './types/foleon-runtime.types.js';
import type { IFoleonRuntimeContract } from './runtime/embeddedRuntimeContract.js';
import { CompanyPulseReader } from './readers/CompanyPulseReader.js';
import { ProjectSpotlightReader } from './readers/ProjectSpotlightReader.js';
import type { FoleonEmbeddedReaderStatus } from './readers/FoleonReaderModule.js';

export type FoleonEmbeddedReaderLaneKey = 'projectSpotlight' | 'companyPulse';

export interface FoleonEmbeddedReaderLaneProps {
  readonly lane: FoleonEmbeddedReaderLaneKey;
  readonly contract: IFoleonRuntimeContract;
  readonly onOpenArchive: () => void;
  readonly onReaderOpen: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onReaderClose: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onEmbedError: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onGateBlocked: (gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onStatusChange?: (status: FoleonEmbeddedReaderStatus) => void;
}

export function FoleonEmbeddedReaderLane(props: FoleonEmbeddedReaderLaneProps): React.ReactNode {
  if (props.lane === 'projectSpotlight') {
    return <ProjectSpotlightReader {...props} />;
  }
  return <CompanyPulseReader {...props} />;
}
