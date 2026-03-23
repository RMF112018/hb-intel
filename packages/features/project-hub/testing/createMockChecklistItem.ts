import type { IForecastChecklistItem } from '../src/financial/types/index.js';

export const createMockChecklistItem = (
  overrides?: Partial<IForecastChecklistItem>,
): IForecastChecklistItem => {
  const base: IForecastChecklistItem = {
    checklistId: 'chk-001',
    forecastVersionId: 'ver-001',
    itemId: 'doc_procore_budget',
    group: 'RequiredDocuments',
    label: 'Procore Budget export attached',
    completed: false,
    completedBy: null,
    completedAt: null,
    notes: null,
    required: true,
  };

  return { ...base, ...overrides };
};
