// types/taskTypes.ts
export type TaskStatus = 'unclaimed' | 'claimed' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;      // family member uid
  dueDate?: number | null;  // epoch ms
  createdAt?: number;       // epoch ms
  updatedAt?: number;       // epoch ms
}

// ---- Derived Task ----
// Used in UI (not stored in Firestore)
export interface DecoratedTask extends Task {
  isCompleted: boolean;
  isOverdue: boolean;
  isDueToday: boolean;
}

// ---- Helpers ----
export function decorateTask(task: Task): DecoratedTask {
  const now = Date.now();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(startOfToday);
  endOfToday.setHours(23, 59, 59, 999);

  const isCompleted = task.status === 'completed';
  const isOverdue =
    task.dueDate !== null && task.dueDate !== undefined
      ? task.dueDate < now && !isCompleted
      : false;
  const isDueToday =
    task.dueDate !== null && task.dueDate !== undefined
      ? task.dueDate >= startOfToday.getTime() && task.dueDate <= endOfToday.getTime()
      : false;

  return { ...task, isCompleted, isOverdue, isDueToday };
}
