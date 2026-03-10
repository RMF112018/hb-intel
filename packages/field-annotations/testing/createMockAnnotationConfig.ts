import type { IFieldAnnotationConfig } from '../src/types/IFieldAnnotation';

/**
 * Creates a mock IFieldAnnotationConfig with sensible defaults (D-10).
 * Override any field as needed for specific test scenarios.
 */
export function createMockAnnotationConfig(
  overrides?: Partial<IFieldAnnotationConfig>
): IFieldAnnotationConfig {
  return {
    recordType: 'bd-scorecard',
    blocksBicOnOpenAnnotations: true,
    allowAssignment: false,
    requireResolutionNote: true,
    visibleToViewers: true,
    versionAware: false,
    ...overrides,
  };
}
