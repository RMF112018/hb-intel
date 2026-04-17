import { DEFAULT_PRESET } from './defaultPreset.js';
import { getPresetOrDefault } from './presetLibrary.js';
import { OCCUPANT_REGISTRY, areOccupantsPairableInBand } from './occupantRegistry.js';
import { SHELL_PROTECTED_DECISIONS } from './protectedDecisions.js';
import { ModuleConfigSlicesSchema, ShellLayoutInputSchema, ShellPresetSchema } from './shellSchema.js';
import type {
  ModuleConfigSlices,
  OccupantId,
  ShellBand,
  ShellDiagnostic,
  ShellLayoutInput,
  ShellLayoutState,
  ShellPreset,
  ShellSlot,
} from './shellTypes.js';

function diagnostic(
  severity: ShellDiagnostic['severity'],
  code: string,
  message: string,
): ShellDiagnostic {
  return { severity, code, message };
}

function isValidOccupantId(id: string): id is OccupantId {
  return OCCUPANT_REGISTRY.has(id as OccupantId);
}

function validateSlotOccupantEligibility(
  slot: ShellSlot,
  diagnostics: ShellDiagnostic[],
): ShellSlot {
  if (!slot.occupantId) return slot;

  const occupant = OCCUPANT_REGISTRY.get(slot.occupantId);
  if (!occupant) {
    diagnostics.push(
      diagnostic('error', 'UNKNOWN_OCCUPANT', `Unknown occupant "${slot.occupantId}" in slot "${slot.id}".`),
    );
    return { ...slot, occupantId: null };
  }

  if (!occupant.allowedSlotRoles.includes(slot.role)) {
    diagnostics.push(
      diagnostic(
        'warning',
        'OCCUPANT_ROLE_MISMATCH',
        `Occupant "${slot.occupantId}" does not support role "${slot.role}" in slot "${slot.id}". Demoting to primary.`,
      ),
    );
    return { ...slot, role: 'primary' };
  }

  return slot;
}

function validateBandConstraints(
  band: ShellBand,
  diagnostics: ShellDiagnostic[],
): ShellBand {
  const validatedSlots = band.slots.map((slot) =>
    validateSlotOccupantEligibility(slot, diagnostics),
  );

  const activeOccupants = validatedSlots
    .filter((s) => s.occupantId !== null)
    .map((s) => s.occupantId!);

  const primaryCount = validatedSlots.filter(
    (s) => s.occupantId !== null && s.role === 'primary',
  ).length;

  if (primaryCount > band.maxDominantOccupants) {
    diagnostics.push(
      diagnostic(
        'warning',
        'EXCESS_DOMINANT',
        `Band "${band.id}" has ${primaryCount} primary occupants but allows max ${band.maxDominantOccupants}. Excess demoted to secondary.`,
      ),
    );

    let demoted = 0;
    const adjustedSlots = validatedSlots.map((slot) => {
      if (
        slot.role === 'primary' &&
        slot.occupantId !== null &&
        demoted < primaryCount - band.maxDominantOccupants
      ) {
        demoted++;
        return { ...slot, role: 'secondary' as const };
      }
      return slot;
    });

    return { ...band, slots: adjustedSlots };
  }

  for (let i = 0; i < activeOccupants.length; i++) {
    for (let j = i + 1; j < activeOccupants.length; j++) {
      if (!areOccupantsPairableInBand(activeOccupants[i], activeOccupants[j])) {
        diagnostics.push(
          diagnostic(
            'error',
            'PROHIBITED_PAIRING',
            `Occupants "${activeOccupants[i]}" and "${activeOccupants[j]}" cannot share band "${band.id}".`,
          ),
        );
      }
    }
  }

  return { ...band, slots: validatedSlots };
}

function validatePreset(
  preset: ShellPreset,
  diagnostics: ShellDiagnostic[],
): ShellPreset {
  const validatedBands = preset.bands.map((band) =>
    validateBandConstraints(band, diagnostics),
  );

  const protectedRoles = SHELL_PROTECTED_DECISIONS.protectedBandSemantics;
  for (const role of protectedRoles) {
    if (!validatedBands.some((b) => b.semanticRole === role)) {
      diagnostics.push(
        diagnostic(
          'warning',
          'MISSING_PROTECTED_BAND',
          `Protected band semantic "${role}" is missing from preset "${preset.id}".`,
        ),
      );
    }
  }

  return { ...preset, bands: validatedBands };
}

function applyOverrides(
  preset: ShellPreset,
  input: ShellLayoutInput,
  diagnostics: ShellDiagnostic[],
): ShellPreset {
  if (!input.bandOverrides?.length) return preset;

  const bands = preset.bands.map((band) => {
    const override = input.bandOverrides!.find((o) => o.bandId === band.id);
    if (!override?.slots?.length) return band;

    const slots = band.slots.map((slot) => {
      const slotOverride = override.slots!.find((o) => o.slotId === slot.id);
      if (!slotOverride) return slot;

      let updated = { ...slot };

      if (slotOverride.occupantId !== undefined) {
        if (slotOverride.occupantId === '') {
          updated = { ...updated, occupantId: null };
        } else if (isValidOccupantId(slotOverride.occupantId)) {
          updated = { ...updated, occupantId: slotOverride.occupantId as OccupantId };
        } else {
          diagnostics.push(
            diagnostic(
              'warning',
              'INVALID_OVERRIDE_OCCUPANT',
              `Override occupant "${slotOverride.occupantId}" is not a known occupant. Ignored.`,
            ),
          );
        }
      }

      if (slotOverride.role !== undefined) {
        const validRoles = ['primary', 'secondary', 'compact'] as const;
        if (validRoles.includes(slotOverride.role as (typeof validRoles)[number])) {
          updated = { ...updated, role: slotOverride.role as ShellSlot['role'] };
        }
      }

      if (slotOverride.columnSpan !== undefined) {
        const validSpans = ['full', 'major', 'minor'] as const;
        if (validSpans.includes(slotOverride.columnSpan as (typeof validSpans)[number])) {
          updated = { ...updated, columnSpan: slotOverride.columnSpan as ShellSlot['columnSpan'] };
        }
      }

      return updated;
    });

    return { ...band, slots };
  });

  return { ...preset, bands };
}

export function parseShellLayout(input: unknown): ShellLayoutState {
  const diagnostics: ShellDiagnostic[] = [];

  if (input === undefined || input === null) {
    return {
      preset: DEFAULT_PRESET,
      diagnostics: [diagnostic('info', 'NO_INPUT', 'No shell layout input provided. Using default preset.')],
      normalizedFromDefault: true,
    };
  }

  const layoutResult = ShellLayoutInputSchema.safeParse(input);
  if (!layoutResult.success) {
    diagnostics.push(
      diagnostic(
        'error',
        'INVALID_LAYOUT_INPUT',
        `Shell layout input failed schema validation: ${layoutResult.error.message}`,
      ),
    );
    return { preset: DEFAULT_PRESET, diagnostics, normalizedFromDefault: true };
  }

  const layoutInput = layoutResult.data;

  const basePreset = getPresetOrDefault(layoutInput.presetId);
  if (layoutInput.presetId && basePreset.id !== layoutInput.presetId) {
    diagnostics.push(
      diagnostic(
        'warning',
        'UNKNOWN_PRESET',
        `Preset "${layoutInput.presetId}" is not recognized. Falling back to "${basePreset.id}".`,
      ),
    );
  }

  const withOverrides = applyOverrides(basePreset, layoutInput, diagnostics);
  const validated = validatePreset(withOverrides, diagnostics);

  return {
    preset: validated,
    diagnostics,
    normalizedFromDefault: basePreset.id === DEFAULT_PRESET.id && !layoutInput.bandOverrides?.length,
  };
}

export function extractModuleConfigSlices(config: Record<string, unknown> | undefined): ModuleConfigSlices {
  if (!config) return {};

  const result = ModuleConfigSlicesSchema.safeParse(config);
  if (result.success) return result.data;

  return {
    companyPulse: config.companyPulse as Record<string, unknown> | undefined,
    leadershipMessage: config.leadershipMessage as Record<string, unknown> | undefined,
    projectPortfolioSpotlight: config.projectPortfolioSpotlight as Record<string, unknown> | undefined,
    peopleCulturePublic: config.peopleCulturePublic as Record<string, unknown> | undefined,
    hbKudos: config.hbKudos as Record<string, unknown> | undefined,
    activeAudience: typeof config.activeAudience === 'string' ? config.activeAudience : undefined,
  };
}

export function validatePresetStructure(preset: unknown): ShellLayoutState {
  const diagnostics: ShellDiagnostic[] = [];

  const result = ShellPresetSchema.safeParse(preset);
  if (!result.success) {
    diagnostics.push(
      diagnostic(
        'error',
        'INVALID_PRESET_STRUCTURE',
        `Preset failed structural validation: ${result.error.message}`,
      ),
    );
    return { preset: DEFAULT_PRESET, diagnostics, normalizedFromDefault: true };
  }

  const validated = validatePreset(result.data as ShellPreset, diagnostics);
  return { preset: validated, diagnostics, normalizedFromDefault: false };
}
