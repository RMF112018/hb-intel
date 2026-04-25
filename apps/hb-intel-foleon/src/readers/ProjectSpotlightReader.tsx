import type { IFoleonRuntimeContract } from '../runtime/foleonRuntimeContract.js';
import type { FoleonContentRecord } from '../types/foleon-content.types.js';
import type { FoleonGateReason } from '../types/foleon-runtime.types.js';
import type { FoleonPageContext } from '../types/foleon-event.types.js';
import { FOLEON_READER_CONFIGS } from './readerConfigs.js';
import { FoleonReaderModule } from './FoleonReaderModule.js';

interface ProjectSpotlightReaderProps {
  readonly contract: IFoleonRuntimeContract;
  readonly onOpenArchive: () => void;
  readonly onReaderOpen: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onReaderClose: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onEmbedError: (record: FoleonContentRecord, gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
  readonly onGateBlocked: (gateResult: FoleonGateReason, pageContext: FoleonPageContext) => void;
}

export function ProjectSpotlightReader(props: ProjectSpotlightReaderProps): React.ReactNode {
  return (
    <FoleonReaderModule
      contract={props.contract}
      config={FOLEON_READER_CONFIGS.projectSpotlight}
      tone="spotlight"
      pageContext="Project Spotlight"
      onOpenArchive={props.onOpenArchive}
      onReaderOpen={props.onReaderOpen}
      onReaderClose={props.onReaderClose}
      onEmbedError={props.onEmbedError}
      onGateBlocked={props.onGateBlocked}
    />
  );
}
