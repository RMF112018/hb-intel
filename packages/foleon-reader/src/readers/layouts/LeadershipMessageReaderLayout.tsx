import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import { FoleonReaderCompatibilityLayout } from './FoleonReaderCompatibilityLayout.js';

// ---------------------------------------------------------------------------
// Leadership Message reader layout — Phase-04 Wave-01 Prompt-02 wrapper.
// Delegates to the internal compatibility shell. Prompt 05 will replace
// the body of this component with the lane-specific composition.
// ---------------------------------------------------------------------------

export function LeadershipMessageReaderLayout(props: FoleonReaderLayoutProps): React.ReactNode {
  return (
    <div
      data-foleon-reader-layout="leadership-message"
      data-foleon-reader-lane="leadershipMessage"
      data-foleon-reader-state={props.viewModel.state}
    >
      <FoleonReaderCompatibilityLayout
        viewModel={props.viewModel}
        iframeSurface={props.iframeSurface}
      />
    </div>
  );
}
