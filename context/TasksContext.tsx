import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '@/types/taskTypes';

// Simple UUID generator (works across platforms)
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const STORAGE_KEY = 'tasksState';

async function loadTasksFromStorage(): Promise<TasksState | null> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Error loading tasks:', e);
    return null;
  }
}

async function saveTasksToStorage(state: TasksState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

// ---- State & Actions ----
interface TasksState {
  openTasks: Task[];
  completedTasks: Task[];
}

type TasksAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { task: Task; id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'LOAD_STATE'; payload: TasksState };

// ✅ Now use UUIDs in initial state
const initialState: TasksState = {
  openTasks: [
    {
      id: generateUUID(),
      title: 'Do the dishes',
      status: 'unclaimed',
      priority: 'high',
      dueDate: 'Today 6pm',
      isDueToday: true,
    },
    {
      id: generateUUID(),
      title: 'Walk the dog',
      status: 'claimed',
      priority: 'medium',
      assignedTo: 'Lisa',
      dueDate: 'Daily 7am',
    },
  ],
  completedTasks: [
    {
      id: generateUUID(),
      title: 'Math homework check',
      status: 'completed',
      priority: 'low',
      assignedTo: 'Mom',
      dueDate: 'Fri 8am',
      isCompleted: true,
    },
  ],
};

function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, openTasks: [...state.openTasks, action.payload] };

    case 'UPDATE_TASK': {
      const { task, id } = action.payload;

      // Remove from both lists first (prevents duplicates)
      const openSans = state.openTasks.filter((t) => t.id !== id);
      const doneSans = state.completedTasks.filter((t) => t.id !== id);

      if (task.status === 'completed') {
        return {
          ...state,
          openTasks: openSans,
          completedTasks: [...doneSans, { ...task, isCompleted: true }],
        };
      } else {
        return {
          ...state,
          openTasks: [...openSans, { ...task, isCompleted: false }],
          completedTasks: doneSans,
        };
      }
    }

    case 'DELETE_TASK': {
      const { id } = action.payload;
      return {
        ...state,
        openTasks: state.openTasks.filter((t) => t.id !== id),
        completedTasks: state.completedTasks.filter((t) => t.id !== id),
      };
    }

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

// ---- Context ----
interface TasksContextType {
  state: TasksState;
  dispatch: React.Dispatch<TasksAction>;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task, id: string) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    (async () => {
      const saved = await loadTasksFromStorage();
      if (saved) dispatch({ type: 'LOAD_STATE', payload: saved });
      setIsLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (isLoaded) saveTasksToStorage(state);
  }, [state, isLoaded]);

  const addTask = (task: Omit<Task, 'id'>) => {
    dispatch({ type: 'ADD_TASK', payload: { ...task, id: generateUUID() } as Task });
  };

  const updateTask = (task: Task, id: string) => {
    dispatch({ type: 'UPDATE_TASK', payload: { task, id } });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { id } });
  };

  const getTaskById = (id: string) =>
    state.openTasks.find((t) => t.id === id) || state.completedTasks.find((t) => t.id === id);

  const value: TasksContextType = {
    state,
    dispatch,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within a TasksProvider');
  return ctx;
}
