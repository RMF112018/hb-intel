import type { IMyWorkSourceAdapter, IMyWorkRuntimeContext, IMyWorkQuery, IMyWorkItem, MyWorkSource } from '../src/types/index.js';
import { createMockMyWorkItem } from './createMockMyWorkItem.js';

export interface MockSourceAdapterOverrides {
  source?: MyWorkSource;
  isEnabled?: (context: IMyWorkRuntimeContext) => boolean;
  load?: (query: IMyWorkQuery, context: IMyWorkRuntimeContext) => Promise<IMyWorkItem[]>;
}

/** Factory for mock `IMyWorkSourceAdapter` instances */
export function createMockSourceAdapter(overrides?: MockSourceAdapterOverrides): IMyWorkSourceAdapter {
  const source = overrides?.source ?? 'bic-next-move';
  return {
    source,
    isEnabled: overrides?.isEnabled ?? (() => true),
    load: overrides?.load ?? (() => Promise.resolve([createMockMyWorkItem({ sourceMeta: [{ source, sourceItemId: 'src-001', sourceUpdatedAtIso: '2026-01-15T10:00:00.000Z' }] })])),
  };
}
