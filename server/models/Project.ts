import mongoose, { Schema, Document } from 'mongoose';
import { ITeamMember } from './TeamMember';

export interface IProject extends Document {
  name: string;
  description: string;
  teamMembers: ITeamMember['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TeamMember',
        required: [true, 'Team members are required'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>('Project', projectSchema);