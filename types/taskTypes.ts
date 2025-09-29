export type TaskStatus = 'unclaimed' | 'claimed' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  isOverdue?: boolean;
  isDueToday?: boolean;
  isCompleted?: boolean;
}

export interface SelectedTask extends Task {
  index: number;
  isCompleted: boolean;
}
