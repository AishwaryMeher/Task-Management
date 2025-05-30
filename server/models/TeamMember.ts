import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
  name: string;
  email: string;
  designation: string;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);