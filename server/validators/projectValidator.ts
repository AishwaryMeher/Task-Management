import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Project description is required'),
  teamMembers: z.array(objectIdSchema).min(1, 'At least one team member is required'),
});

export const updateProjectSchema = projectSchema.partial();

export type ProjectInput = z.infer<typeof projectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;