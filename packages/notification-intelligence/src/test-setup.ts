import { vi } from 'vitest';

// Mock @hbc/complexity to isolate notification-intelligence unit tests
// from complexity context dependency
vi.mock('@hbc/complexity', () => ({
  useComplexity: vi.fn().mockReturnValue({ tier: 'standard' }),
  ComplexityProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock fetch for NotificationApi and PreferencesApi calls
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({}),
});
