import type { ComponentType, ReactNode } from 'react';
import type { FoleonReaderLayoutKey, FoleonReaderViewModel } from './FoleonReaderViewModel.js';
import { ProjectSpotlightReaderLayout } from './layouts/ProjectSpotlightReaderLayout.js';
import { CompanyPulseReaderLayout } from './layouts/CompanyPulseReaderLayout.js';
import { LeadershipMessageReaderLayout } from './layouts/LeadershipMessageReaderLayout.js';

// ---------------------------------------------------------------------------
// Foleon reader — lane layout registry
// ---------------------------------------------------------------------------
// Phase-04 Wave-01 Prompt-02 architecture seam.
//
// The registry maps each `FoleonReaderLayoutKey` to a unique lane layout
// component. Lane wrappers emit stable `data-foleon-reader-layout` markers
// so tests and downstream consumers can prove lane-specific routing.
//
// In this prompt every lane layout delegates to a shared internal
// compatibility shell to keep visuals stable. Later prompts (03 / 04 / 05)
// will replace each lane component independently without touching the
// registry contract.
// ---------------------------------------------------------------------------

export interface FoleonReaderLayoutProps {
  readonly viewModel: FoleonReaderViewModel;
  /**
   * Pre-rendered Foleon iframe element. Provided by the orchestrator only
   * when the iframe should be mounted (desktop ready, or mobile-ready
   * after activation). `null` whenever the iframe must not be mounted —
   * the layout uses `viewModel.iframe?.visible` and `viewModel.mobileGate`
   * to decide what to render in the iframe slot.
   */
  readonly iframeSurface: ReactNode | null;
}

export type FoleonReaderLayoutComponent = ComponentType<FoleonReaderLayoutProps>;

export const FOLEON_READER_LAYOUTS: Readonly<Record<FoleonReaderLayoutKey, FoleonReaderLayoutComponent>> = {
  projectSpotlight: ProjectSpotlightReaderLayout,
  companyPulse: CompanyPulseReaderLayout,
  leadershipMessage: LeadershipMessageReaderLayout,
};

export function getFoleonReaderLayout(key: FoleonReaderLayoutKey): FoleonReaderLayoutComponent {
  return FOLEON_READER_LAYOUTS[key];
}
