import type { IFoleonRuntimeContract } from '../runtime/embeddedRuntimeContract.js';
import type { FoleonContentRecord } from '../types/foleon-content.types.js';
import type { FoleonGateReason } from '../types/foleon-runtime.types.js';
import type { FoleonPageContext } from '../types/foleon-event.types.js';
import { FOLEON_READER_CONFIGS } from './readerConfigs.js';
import { FoleonReaderModule } from './FoleonReaderModule.js';
import type { FoleonEmbeddedReaderStatus } from './FoleonReaderModule.js';

export interface CompanyPulseReaderProps {
  readonly contract: IFoleonRuntimeContract;
  readonly onOpenArchive: () => void;
  readonly onReaderOpen: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onReaderClose: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onEmbedError: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onGateBlocked: (gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onStatusChange?: (status: FoleonEmbeddedReaderStatus) => void;
}

export function CompanyPulseReader(props: CompanyPulseReaderProps): React.ReactNode {
  return (
    <FoleonReaderModule
      contract={props.contract}
      config={FOLEON_READER_CONFIGS.companyPulse}
      tone="pulse"
      pageContext="Company Pulse"
      onOpenArchive={props.onOpenArchive}
      onReaderOpen={props.onReaderOpen}
      onReaderClose={props.onReaderClose}
      onEmbedError={props.onEmbedError}
      onGateBlocked={props.onGateBlocked}
      onStatusChange={props.onStatusChange}
    />
  );
}
