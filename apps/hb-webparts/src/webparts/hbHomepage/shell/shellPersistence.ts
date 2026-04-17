import { z } from 'zod';
import { getPresetOrDefault } from './presetLibrary.js';
import { parseShellLayout } from './shellValidation.js';
import type { OccupantId, ShellLayoutState } from './shellTypes.js';

/**
 * Serializable persistence shape for shell layout state.
 * This is what a future control panel would read/write.
 * Protected decisions cannot be overridden through this payload.
 */
export const PersistedShellStateSchema = z.object({
  version: z.literal(1),
  presetId: z.string(),
  occupantVisibility: z
    .record(z.enum(['visible', 'hidden']))
    .optional(),
  bandOverrides: z
    .array(
      z.object({
        bandId: z.string(),
        slots: z
          .array(
            z.object({
              slotId: z.string(),
              occupantId: z.string().optional(),
              role: z.string().optional(),
              columnSpan: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
  compactPreferences: z
    .record(z.enum(['compact', 'standard']))
    .optional(),
});

export type PersistedShellState = z.infer<typeof PersistedShellStateSchema>;

export function createDefaultPersistedState(): PersistedShellState {
  return {
    version: 1,
    presetId: 'default-v1',
  };
}

export function serializeShellState(layoutState: ShellLayoutState): PersistedShellState {
  return {
    version: 1,
    presetId: layoutState.preset.id,
  };
}

export function hydratePersistedState(raw: unknown): ShellLayoutState {
  if (raw === null || raw === undefined) {
    return parseShellLayout(undefined);
  }

  const result = PersistedShellStateSchema.safeParse(raw);
  if (!result.success) {
    console.warn(
      '[hb-homepage:shell] Persisted shell state failed validation. Using default.',
      result.error.message,
    );
    return parseShellLayout(undefined);
  }

  const persisted = result.data;
  const _preset = getPresetOrDefault(persisted.presetId);

  return parseShellLayout({
    presetId: persisted.presetId,
    bandOverrides: persisted.bandOverrides,
  });
}

export function applyOccupantVisibility(
  layoutState: ShellLayoutState,
  visibility: Record<string, 'visible' | 'hidden'> | undefined,
): ShellLayoutState {
  if (!visibility) return layoutState;

  const hiddenOccupants = new Set(
    Object.entries(visibility)
      .filter(([, v]) => v === 'hidden')
      .map(([id]) => id),
  );

  if (hiddenOccupants.size === 0) return layoutState;

  const bands = layoutState.preset.bands.map((band) => ({
    ...band,
    slots: band.slots.map((slot) =>
      slot.occupantId && hiddenOccupants.has(slot.occupantId)
        ? { ...slot, occupantId: null as OccupantId | null }
        : slot,
    ),
  }));

  return {
    ...layoutState,
    preset: { ...layoutState.preset, bands },
  };
}
