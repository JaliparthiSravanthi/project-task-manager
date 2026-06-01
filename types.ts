export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  userId: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  otpRequestedEmail: string | null;
  simulatedOtp: string | null; // For beautiful screen simulation
}

export interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  activeProjectId: string | null;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}
