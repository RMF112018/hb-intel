import { DEFAULT_PRESET } from './defaultPreset.js';
import { getPresetOrDefault, validatePresetCanonicalSemantics } from './presetLibrary.js';
import { OCCUPANT_REGISTRY, areOccupantsPairableInBand } from './occupantRegistry.js';
import { getBandRecipeRule } from './bandRecipes.js';
import { SHELL_PROTECTED_DECISIONS } from './protectedDecisions.js';
import { isProminenceAllowed } from './slotComfortResolver.js';
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
        'error',
        'OCCUPANT_ROLE_MISMATCH',
        `Occupant "${slot.occupantId}" does not support role "${slot.role}" in slot "${slot.id}". Clearing occupant for governed fallback.`,
      ),
    );
    return { ...slot, occupantId: null };
  }

  return slot;
}

function validateBandConstraints(
  band: ShellBand,
  diagnostics: ShellDiagnostic[],
): ShellBand {
  const recipeRule = getBandRecipeRule(band.recipe);
  const validatedSlots = band.slots.map((slot) =>
    validateSlotOccupantEligibility(slot, diagnostics),
  );

  const activeOccupants = validatedSlots
    .filter((s) => s.occupantId !== null)
    .map((s) => s.occupantId!);

  const activeSlots = validatedSlots.filter((s) => s.occupantId !== null);

  if (!recipeRule.allowedSemanticRoles.includes(band.semanticRole)) {
    diagnostics.push(
      diagnostic(
        'error',
        'RECIPE_SEMANTIC_ROLE_INCOMPATIBLE',
        `Band "${band.id}" uses recipe "${band.recipe}" which does not allow semanticRole "${band.semanticRole}".`,
      ),
    );
  }

  if (band.recipe === 'stacked-full' && band.orientation !== undefined) {
    diagnostics.push(
      diagnostic(
        'info',
        'ORIENTATION_IGNORED_FOR_STACKED_BAND',
        `Band "${band.id}" declares orientation "${band.orientation}" but uses recipe "stacked-full"; orientation is ignored for single-column bands.`,
      ),
    );
  }

  if (
    activeSlots.length < recipeRule.minActiveSlots ||
    activeSlots.length > recipeRule.maxActiveSlots
  ) {
    diagnostics.push(
      diagnostic(
        'error',
        'RECIPE_ACTIVE_SLOT_COUNT_INVALID',
        `Band "${band.id}" recipe "${band.recipe}" requires ${recipeRule.minActiveSlots}-${recipeRule.maxActiveSlots} active slots; found ${activeSlots.length}.`,
      ),
    );
  }

  for (const slot of activeSlots) {
    if (!recipeRule.allowedSlotRoles.includes(slot.role)) {
      diagnostics.push(
        diagnostic(
          'error',
          'RECIPE_SLOT_ROLE_INCOMPATIBLE',
          `Band "${band.id}" recipe "${band.recipe}" does not allow slot role "${slot.role}" for slot "${slot.id}".`,
        ),
      );
    }
  }

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
  const validatedBands = preset.bands.map((band, bandIndex) => {
    const validated = validateBandConstraints(band, diagnostics);
    const isEntryBand = bandIndex === 0;

    for (const slot of validated.slots) {
      if (!slot.occupantId) continue;
      const occupant = OCCUPANT_REGISTRY.get(slot.occupantId);
      if (!occupant) continue;

      if (!isProminenceAllowed(occupant.prominenceCeiling, slot.role, isEntryBand)) {
        diagnostics.push(
          diagnostic(
            'warning',
            'PROMINENCE_CEILING_EXCEEDED',
            `Occupant "${slot.occupantId}" (ceiling: ${occupant.prominenceCeiling}) placed as ${slot.role} in ${isEntryBand ? 'entry ' : ''}band "${band.id}" exceeds its prominence ceiling.`,
          ),
        );
      }

      if (
        occupant.allowedBandSemantics.length > 0 &&
        !occupant.allowedBandSemantics.includes(validated.semanticRole)
      ) {
        diagnostics.push(
          diagnostic(
            'error',
            'OCCUPANT_BAND_INCOMPATIBLE',
            `Occupant "${slot.occupantId}" is not permitted in band "${band.id}" (semanticRole: ${validated.semanticRole}). Allowed: ${occupant.allowedBandSemantics.join(', ')}.`,
          ),
        );
      }
    }

    return validated;
  });

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

  const canonicalDiagnostics = validatePresetCanonicalSemantics({
    ...preset,
    bands: validatedBands,
  });
  for (const d of canonicalDiagnostics) {
    diagnostics.push(diagnostic(d.severity, d.code, d.message));
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
        const originalOccupantId = slot.occupantId;
        const clearing = slotOverride.occupantId === '';
        const replacing =
          !clearing &&
          isValidOccupantId(slotOverride.occupantId) &&
          slotOverride.occupantId !== originalOccupantId;

        if (originalOccupantId && (clearing || replacing)) {
          const current = OCCUPANT_REGISTRY.get(originalOccupantId);
          if (current) {
            if (clearing && !current.visibilityEligibility.hideableByMaintainer) {
              diagnostics.push(
                diagnostic(
                  'error',
                  'VISIBILITY_NOT_ELIGIBLE',
                  `Occupant "${originalOccupantId}" in slot "${slot.id}" is not hideable by maintainers. Override ignored.`,
                ),
              );
              return slot;
            }
            if (clearing && !current.visibilityEligibility.removable) {
              diagnostics.push(
                diagnostic(
                  'error',
                  'VISIBILITY_NOT_ELIGIBLE',
                  `Occupant "${originalOccupantId}" in slot "${slot.id}" is not removable. Override ignored.`,
                ),
              );
              return slot;
            }
            if (replacing && current.reorderDomain === 'locked') {
              diagnostics.push(
                diagnostic(
                  'error',
                  'REORDER_DOMAIN_VIOLATION',
                  `Occupant "${originalOccupantId}" is locked and cannot be replaced via override in slot "${slot.id}".`,
                ),
              );
              return slot;
            }
          }
        }

        if (clearing) {
          updated = { ...updated, occupantId: null };
        } else if (isValidOccupantId(slotOverride.occupantId)) {
          const incoming = OCCUPANT_REGISTRY.get(slotOverride.occupantId as OccupantId);
          if (
            incoming &&
            incoming.allowedBandSemantics.length > 0 &&
            !incoming.allowedBandSemantics.includes(band.semanticRole)
          ) {
            diagnostics.push(
              diagnostic(
                'error',
                'OCCUPANT_BAND_INCOMPATIBLE',
                `Override cannot place "${slotOverride.occupantId}" into band "${band.id}" (semanticRole: ${band.semanticRole}). Allowed: ${incoming.allowedBandSemantics.join(', ')}.`,
              ),
            );
            return slot;
          }
          if (
            incoming &&
            incoming.reorderDomain === 'within-band' &&
            originalOccupantId !== slotOverride.occupantId
          ) {
            // within-band reorder is allowed only if the occupant is already
            // present in this band in some other slot. Otherwise reject.
            const alreadyInBand = band.slots.some(
              (s) => s.occupantId === slotOverride.occupantId,
            );
            if (!alreadyInBand) {
              diagnostics.push(
                diagnostic(
                  'error',
                  'REORDER_DOMAIN_VIOLATION',
                  `Occupant "${slotOverride.occupantId}" may only be reordered within its current band.`,
                ),
              );
              return slot;
            }
          }
          updated = { ...updated, occupantId: slotOverride.occupantId as OccupantId };
        } else {
          diagnostics.push(
            diagnostic(
              'error',
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
        } else {
          diagnostics.push(
            diagnostic(
              'error',
              'INVALID_OVERRIDE_ROLE',
              `Override role "${slotOverride.role}" for slot "${slot.id}" is not a valid SlotRole. Ignored.`,
            ),
          );
        }
      }

      if (slotOverride.columnSpan !== undefined) {
        const validSpans = ['full', 'major', 'minor'] as const;
        if (validSpans.includes(slotOverride.columnSpan as (typeof validSpans)[number])) {
          updated = { ...updated, columnSpan: slotOverride.columnSpan as ShellSlot['columnSpan'] };
        } else {
          diagnostics.push(
            diagnostic(
              'error',
              'INVALID_OVERRIDE_COLUMN_SPAN',
              `Override columnSpan "${slotOverride.columnSpan}" for slot "${slot.id}" is not a valid ColumnSpan. Ignored.`,
            ),
          );
        }
      }

      return updated;
    });

    return { ...band, slots };
  });

  const knownBandIds = new Set(preset.bands.map((band) => band.id));
  for (const override of input.bandOverrides) {
    if (!knownBandIds.has(override.bandId)) {
      diagnostics.push(
        diagnostic(
          'error',
          'UNKNOWN_BAND_OVERRIDE',
          `Band override references unknown band "${override.bandId}". Override ignored.`,
        ),
      );
      continue;
    }
    if (!override.slots?.length) continue;
    const band = preset.bands.find((candidate) => candidate.id === override.bandId)!;
    const knownSlotIds = new Set(band.slots.map((slot) => slot.id));
    for (const slotOverride of override.slots) {
      if (!knownSlotIds.has(slotOverride.slotId)) {
        diagnostics.push(
          diagnostic(
            'error',
            'UNKNOWN_SLOT_OVERRIDE',
            `Band override for "${override.bandId}" references unknown slot "${slotOverride.slotId}". Override ignored.`,
          ),
        );
      }
    }
  }

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
        'error',
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
    safetyFieldExcellence: config.safetyFieldExcellence as Record<string, unknown> | undefined,
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

export interface PreviewValidationResult {
  readonly valid: boolean;
  readonly errors: readonly ShellDiagnostic[];
  readonly warnings: readonly ShellDiagnostic[];
  readonly info: readonly ShellDiagnostic[];
  readonly summary: string;
}

export function previewShellLayout(input: unknown): PreviewValidationResult {
  const layoutState = parseShellLayout(input);
  const errors = layoutState.diagnostics.filter((d) => d.severity === 'error');
  const warnings = layoutState.diagnostics.filter((d) => d.severity === 'warning');
  const info = layoutState.diagnostics.filter((d) => d.severity === 'info');

  const valid = errors.length === 0;

  let summary: string;
  if (!valid) {
    summary = `Invalid: ${errors.length} error(s) — ${errors.map((e) => e.code).join(', ')}`;
  } else if (warnings.length > 0) {
    summary = `Valid with ${warnings.length} warning(s) — ${warnings.map((w) => w.code).join(', ')}`;
  } else {
    summary = `Valid: preset "${layoutState.preset.id}" with ${layoutState.preset.bands.length} bands`;
  }

  return { valid, errors, warnings, info, summary };
}

export function previewBandOverride(
  presetId: string | undefined,
  bandId: string,
  slotChanges: ReadonlyArray<{ slotId: string; occupantId?: string; role?: string; columnSpan?: string }>,
): PreviewValidationResult {
  return previewShellLayout({
    presetId,
    bandOverrides: [{ bandId, slots: slotChanges }],
  });
}
