import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: 'Invalid ID format' }
);

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().min(1, 'Task description is required'),
  deadline: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Invalid date format' }
  ),
  project: objectIdSchema,
  assignedMembers: z.array(objectIdSchema).min(1, 'At least one assigned member is required'),
  status: z.enum(['to-do', 'in-progress', 'done', 'cancelled']),
});

export const updateTaskSchema = taskSchema.partial();

export const taskFilterSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
  project: objectIdSchema.optional(),
  member: objectIdSchema.optional(),
  status: z.enum(['to-do', 'in-progress', 'done', 'cancelled']).optional(),
  search: z.string().optional(),
  startDate: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: 'Invalid start date format' }
  ),
  endDate: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: 'Invalid end date format' }
  ),
});

export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;