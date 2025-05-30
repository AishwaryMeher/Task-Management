import mongoose, { Schema, Document } from 'mongoose';
import { ITeamMember } from './TeamMember';
import { IProject } from './Project';

export type TaskStatus = 'to-do' | 'in-progress' | 'done' | 'cancelled';

export interface ITask extends Document {
  title: string;
  description: string;
  deadline: Date;
  project: IProject['_id'];
  assignedMembers: ITeamMember['_id'][];
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    deadline: {
      type: Date,
      required: [true, 'Task deadline is required'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    assignedMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TeamMember',
        required: [true, 'Assigned members are required'],
      },
    ],
    status: {
      type: String,
      enum: ['to-do', 'in-progress', 'done', 'cancelled'],
      default: 'to-do',
      required: [true, 'Task status is required'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>('Task', taskSchema);