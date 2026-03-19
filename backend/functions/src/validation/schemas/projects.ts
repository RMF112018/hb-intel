import { z } from 'zod';
import { PaginationQuerySchema } from './shared.js';

/**
 * P1-C2 Task 5: Project validation schemas.
 * Derived from `IProjectFormData` (packages/models/src/project/IProjectFormData.ts).
 */
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  number: z.string().min(1),
  status: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const ListProjectsQuerySchema = PaginationQuerySchema;
