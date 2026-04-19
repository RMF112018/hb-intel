import { z } from 'zod';

const OCCUPANT_IDS = [
  'company-pulse',
  'leadership-message',
  'project-portfolio-spotlight',
  'people-culture-public',
  'hb-kudos',
  'safety-field-excellence',
] as const;

const SLOT_ROLES = ['primary', 'secondary', 'compact'] as const;
const COLUMN_SPANS = ['full', 'major', 'minor'] as const;
const BAND_SEMANTIC_ROLES = [
  'communications-newsroom',
  'communications-editorial',
  'operational-spotlight',
  'people-culture',
  'recognition',
] as const;
const SHELL_BAND_RECIPES = [
  'feature-pair',
  'balanced-two-up',
  'asymmetric-two-up',
  'feature-utility-strip',
  'stacked-full',
  'stacked-secondary-strip',
  'single-column-fallback',
] as const;

export const OccupantIdSchema = z.enum(OCCUPANT_IDS);
export const SlotRoleSchema = z.enum(SLOT_ROLES);
export const ColumnSpanSchema = z.enum(COLUMN_SPANS);
export const BandSemanticRoleSchema = z.enum(BAND_SEMANTIC_ROLES);
export const ShellBandRecipeSchema = z.enum(SHELL_BAND_RECIPES);

export const ShellSlotSchema = z.object({
  id: z.string().min(1),
  occupantId: OccupantIdSchema.nullable(),
  role: SlotRoleSchema,
  columnSpan: ColumnSpanSchema,
});

export const ShellBandSchema = z.object({
  id: z.string().min(1),
  semanticRole: BandSemanticRoleSchema,
  recipe: ShellBandRecipeSchema,
  slots: z.array(ShellSlotSchema).min(1),
  maxDominantOccupants: z.number().int().min(1),
});

export const ShellPresetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  bands: z.array(ShellBandSchema).min(1),
});

export const ShellLayoutInputSchema = z.object({
  presetId: z.string().optional(),
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
});

export const ModuleConfigSlicesSchema = z.object({
  companyPulse: z.record(z.unknown()).optional(),
  leadershipMessage: z.record(z.unknown()).optional(),
  projectPortfolioSpotlight: z.record(z.unknown()).optional(),
  peopleCulturePublic: z.record(z.unknown()).optional(),
  hbKudos: z.record(z.unknown()).optional(),
  safetyFieldExcellence: z.record(z.unknown()).optional(),
  activeAudience: z.string().optional(),
});
