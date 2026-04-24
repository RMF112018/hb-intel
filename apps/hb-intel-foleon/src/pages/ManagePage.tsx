import type { IFoleonRuntimeContract } from '../runtime/foleonRuntimeContract.js';
import { ManageOrchestrator } from './manage/ManageOrchestrator.js';

interface ManagePageProps {
  readonly contract: IFoleonRuntimeContract;
  readonly onBack: () => void;
}

/** Thin entry — orchestration, styling, and workflows live under `./manage/`. */
export function ManagePage(props: ManagePageProps): React.ReactNode {
  return <ManageOrchestrator contract={props.contract} onBack={props.onBack} />;
}
