import axios from 'axios';
import { TeamMember, Project, Task, FilterParams, PaginatedResponse } from '../types';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Team Members API
export const getTeamMembers = async (page = 1, limit = 10): Promise<PaginatedResponse<TeamMember>> => {
  const response = await api.get(`/teams?page=${page}&limit=${limit}`);
  return response.data;
};

export const getTeamMember = async (id: string): Promise<TeamMember> => {
  const response = await api.get(`/teams/${id}`);
  return response.data;
};

export const createTeamMember = async (teamMember: Omit<TeamMember, '_id'>): Promise<TeamMember> => {
  const response = await api.post('/teams', teamMember);
  return response.data;
};

export const updateTeamMember = async (id: string, teamMember: Partial<TeamMember>): Promise<TeamMember> => {
  const response = await api.put(`/teams/${id}`, teamMember);
  return response.data;
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  await api.delete(`/teams/${id}`);
};

// Projects API
export const getProjectByName = async (name: string) => {
  const response = await axios.get(`/projects?name=${encodeURIComponent(name)}`);
  return response.data?.length ? response.data[0] : null;
};

export const getProjects = async (page = 1, limit = 10): Promise<PaginatedResponse<Project>> => {
  const response = await api.get(`/projects?page=${page}&limit=${limit}`);
  return response.data;
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (project: Omit<Project, '_id'>): Promise<Project> => {
  const response = await api.post('/projects', project);
  return response.data;
};

export const updateProject = async (id: string, project: Partial<Project>): Promise<Project> => {
  const response = await api.put(`/projects/${id}`, project);
  return response.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await api.delete(`/projects/${id}`);
};

// Tasks API
export const getTasks = async (filters: FilterParams = {}): Promise<PaginatedResponse<Task>> => {
  const queryParams = new URLSearchParams();

  // Add all filters to query params
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const response = await api.get(`/tasks?${queryParams.toString()}`);
  return response.data;
};

export const getTask = async (id: string): Promise<Task> => {
  const response = await api.get(`/tasks/${id}`);
  return response.data;
};

export const createTask = async (task: Omit<Task, '_id'>): Promise<Task> => {
  const response = await api.post('/tasks', task);
  return response.data;
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};