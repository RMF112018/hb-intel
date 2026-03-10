import type { ISeedConfig } from '../src/types';

export function createMockSeedConfig<
  TSource extends Record<string, string> = Record<string, string>,
  TDest extends Record<string, unknown> = Record<string, unknown>
>(overrides: Partial<ISeedConfig<TSource, TDest>> = {}): ISeedConfig<TSource, TDest> {
  return {
    name: 'Test Import',
    recordType: 'test-record',
    acceptedFormats: ['xlsx', 'csv'],
    autoMapHeaders: true,
    allowPartialImport: true,
    batchSize: 10,
    fieldMappings: [
      {
        sourceColumn: 'Name',
        destinationField: 'name' as keyof TDest,
        label: 'Name',
        required: true,
      },
      {
        sourceColumn: 'Email',
        destinationField: 'email' as keyof TDest,
        label: 'Email Address',
        required: false,
        validate: (val) => {
          if (!val) return null;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
            ? null
            : 'Invalid email format';
        },
      },
      {
        sourceColumn: 'Value',
        destinationField: 'value' as keyof TDest,
        label: 'Numeric Value',
        required: false,
        transform: (val) => parseFloat(val) || null,
      },
    ],
    onRecordImported: undefined,
    onImportComplete: undefined,
    ...overrides,
  };
}
