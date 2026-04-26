import type { FoleonReaderLayoutProps } from '../FoleonReaderLayoutRegistry.js';
import { FoleonReaderCompatibilityLayout } from './FoleonReaderCompatibilityLayout.js';

// ---------------------------------------------------------------------------
// Company Pulse reader layout — Phase-04 Wave-01 Prompt-02 wrapper.
// Delegates to the internal compatibility shell. Prompt 04 will replace
// the body of this component with the lane-specific composition.
// ---------------------------------------------------------------------------

export function CompanyPulseReaderLayout(props: FoleonReaderLayoutProps): React.ReactNode {
  return (
    <div
      data-foleon-reader-layout="company-pulse"
      data-foleon-reader-lane="companyPulse"
      data-foleon-reader-state={props.viewModel.state}
    >
      <FoleonReaderCompatibilityLayout
        viewModel={props.viewModel}
        iframeSurface={props.iframeSurface}
      />
    </div>
  );
}
