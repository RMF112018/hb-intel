let rowCounter = 0;

export function createMockSeedRow(
  overrides: Record<string, string> = {}
): Record<string, string> {
  rowCounter++;
  return {
    Name: `Test Company ${rowCounter}`,
    Email: `contact${rowCounter}@example.com`,
    Value: String(rowCounter * 10000),
    ...overrides,
  };
}
