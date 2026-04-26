import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import { FoleonReaderCompatibilityLayout } from './FoleonReaderCompatibilityLayout.js';

// ---------------------------------------------------------------------------
// Project Spotlight reader layout — Phase-04 Wave-01 Prompt-02 wrapper.
// Delegates to the internal compatibility shell. Prompt 03 will replace
// the body of this component with the lane-specific composition.
// ---------------------------------------------------------------------------

export function ProjectSpotlightReaderLayout(props: FoleonReaderLayoutProps): React.ReactNode {
  return (
    <div
      data-foleon-reader-layout="project-spotlight"
      data-foleon-reader-lane="projectSpotlight"
      data-foleon-reader-state={props.viewModel.state}
    >
      <FoleonReaderCompatibilityLayout
        viewModel={props.viewModel}
        iframeSurface={props.iframeSurface}
      />
    </div>
  );
}
