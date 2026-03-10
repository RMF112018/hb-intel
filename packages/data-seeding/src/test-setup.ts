import { vi } from 'vitest';

// Mock SheetJS to avoid JSDOM binary parsing issues in unit tests.
// Integration and E2E tests use real file fixtures.
vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
    decode_range: vi.fn(),
  },
}));

// Mock @hbc/sharepoint-docs to isolate data-seeding unit tests
// from SharePoint dependency
vi.mock('@hbc/sharepoint-docs', () => ({
  DocumentApi: {
    uploadToSystemContext: vi.fn().mockResolvedValue({
      documentId: 'doc-seed-001',
      sharepointUrl: 'https://sp.example.com/system/seed-file.xlsx',
    }),
  },
}));
