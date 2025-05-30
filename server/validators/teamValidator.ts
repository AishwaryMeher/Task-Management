import { z } from 'zod';

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  designation: z.string().min(1, 'Designation is required'),
});

export const updateTeamMemberSchema = teamMemberSchema.partial();

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;