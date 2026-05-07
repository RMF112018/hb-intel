/**
 * Wave 15A B5 / Prompt 02 — Project Readiness detail-section renderer.
 *
 * Pure presentational switch. Returns `null` when the active selection
 * is the command overview, or a Fragment of `PccDashboardCard` direct
 * children for the chosen detail group otherwise. The Fragment shape
 * preserves the bento direct-child invariant because every leaf
 * component already returns a Fragment of cards (or a single card)
 * with no wrapping element.
 *
 * Hook acquisition stays in `PccProjectReadinessSurface`'s
 * `ReadModelContent`; this renderer consumes the resulting view-model
 * states only. That keeps Wave decision #8 (unconditional read-model
 * hooks) intact even when the user has chosen `'command'` and no
 * detail component is rendered.
 */

import { Fragment, type FC, type ReactNode } from 'react';
import { PccPermitInspectionControlCenterRegions } from './PccPermitInspectionControlCenterRegions';
import type { PccPermitInspectionControlCenterViewModel } from './permitInspectionControlCenterViewModel';
import { PccResponsibilityMatrixRegions } from '../responsibilityMatrix/PccResponsibilityMatrixRegions';
import type { IPccResponsibilityMatrixViewModel } from '../responsibilityMatrix/responsibilityMatrixViewModel';
import { PccConstraintsLogRegions } from '../constraintsLog/PccConstraintsLogRegions';
import type { IPccConstraintsLogViewModel } from '../constraintsLog/constraintsLogViewModel';
import { PccBuyoutLogRegions } from '../buyoutLog/PccBuyoutLogRegions';
import type { IPccBuyoutLogViewModel } from '../buyoutLog/buyoutLogViewModel';
import { PccProjectReadinessProcoreSourceConfidenceCard } from './PccProjectReadinessProcoreSourceConfidenceCard';
import type { IPccProcoreSurfaceViewModel } from '../../viewModels/procoreSurfaceAdapter';
import { PccProjectReadinessUnifiedLifecycleSection } from './PccProjectReadinessUnifiedLifecycleSection';
import type { IUseUnifiedLifecycleReadModelState } from '../unifiedLifecycle/index.js';
import type { PccProjectReadinessSectionId } from './projectReadinessSectionTypes';

export interface IPccProjectReadinessDetailSectionRendererProps {
  readonly selectedSection: PccProjectReadinessSectionId;
  // Wave 15A B5 / Prompt 04 — render-prop slot avoids the circular
  // import that previously had the renderer reach back into the
  // surface for `LifecycleReadinessRegions`. The surface constructs
  // the lifecycle ReactElement and forwards it as `lifecycleSlot`.
  readonly lifecycleSlot: ReactNode;
  readonly permitInspectionViewModel: PccPermitInspectionControlCenterViewModel;
  readonly responsibilityMatrixViewModel: IPccResponsibilityMatrixViewModel;
  readonly constraintsLogViewModel: IPccConstraintsLogViewModel;
  readonly buyoutLogViewModel: IPccBuyoutLogViewModel;
  readonly procoreViewModel: IPccProcoreSurfaceViewModel | undefined;
  readonly unifiedLifecycleState: IUseUnifiedLifecycleReadModelState;
}

export const PccProjectReadinessDetailSectionRenderer: FC<
  IPccProjectReadinessDetailSectionRendererProps
> = ({
  selectedSection,
  lifecycleSlot,
  permitInspectionViewModel,
  responsibilityMatrixViewModel,
  constraintsLogViewModel,
  buyoutLogViewModel,
  procoreViewModel,
  unifiedLifecycleState,
}) => {
  switch (selectedSection) {
    case 'command':
      return null;
    case 'lifecycle-readiness':
      return <Fragment>{lifecycleSlot}</Fragment>;
    case 'permits-inspections':
      return (
        <Fragment>
          <PccPermitInspectionControlCenterRegions viewModel={permitInspectionViewModel} />
        </Fragment>
      );
    case 'responsibility-matrix':
      return (
        <Fragment>
          <PccResponsibilityMatrixRegions viewModel={responsibilityMatrixViewModel} />
        </Fragment>
      );
    case 'constraints':
      return (
        <Fragment>
          <PccConstraintsLogRegions viewModel={constraintsLogViewModel} />
        </Fragment>
      );
    case 'buyout':
      return (
        <Fragment>
          <PccBuyoutLogRegions viewModel={buyoutLogViewModel} />
        </Fragment>
      );
    case 'procore-source-confidence':
      return (
        <Fragment>
          <PccProjectReadinessProcoreSourceConfidenceCard viewModel={procoreViewModel} />
        </Fragment>
      );
    case 'unified-lifecycle':
      return (
        <Fragment>
          <PccProjectReadinessUnifiedLifecycleSection state={unifiedLifecycleState} />
        </Fragment>
      );
  }
};

export default PccProjectReadinessDetailSectionRenderer;
