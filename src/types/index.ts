export interface TeamMember {
  _id?: string;
  name: string;
  email: string;
  designation: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id?: string;
  name: string;
  description: string;
  teamMembers: string[] | TeamMember[];
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'to-do' | 'in-progress' | 'done' | 'cancelled';

export interface Task {
  _id?: string;
  title: string;
  description: string;
  deadline: string;
  project: string | Project;
  assignedMembers: string[] | TeamMember[];
  status: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface FilterParams {
  page?: number;
  limit?: number;
  project?: string;
  member?: string;
  status?: TaskStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
}