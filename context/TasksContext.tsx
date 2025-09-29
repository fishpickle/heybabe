import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskStatus, TaskPriority } from '@/types/taskTypes';

// Simple UUID generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// AsyncStorage key
const STORAGE_KEY = 'tasksState';

// Load tasks from AsyncStorage
async function loadTasksFromStorage(): Promise<TasksState | null> {
  try {
    const savedTasks = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedTasks) {
      return JSON.parse(savedTasks);
    }
  } catch (error) {
    console.error('Error loading tasks from storage:', error);
  }
  return null;
}

// Save tasks to AsyncStorage
async function saveTasksToStorage(state: TasksState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
  }
}

// State interface
interface TasksState {
  openTasks: Task[];
  completedTasks: Task[];
}

// Action types
type TasksAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { task: Task; id: string } }
  | { type: 'DELETE_TASK'; payload: { id: string } }
  | { type: 'MARK_COMPLETED'; payload: { task: Task; id: string } }
  | { type: 'LOAD_STATE'; payload: TasksState };

// Initial state
const initialState: TasksState = {
  openTasks: [
    { id: '1', title: 'Do the dishes', status: 'unclaimed', priority: 'high', dueDate: 'Today 6pm', isDueToday: true },
    { id: '2', title: 'Walk the dog', status: 'claimed', priority: 'medium', assignedTo: 'Lisa', dueDate: 'Daily 7am' },
  ],
  completedTasks: [
    { id: '3', title: 'Math homework check', status: 'completed', priority: 'low', assignedTo: 'Mom', dueDate: 'Fri 8am', isCompleted: true },
  ],
};

// Reducer function
function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case 'ADD_TASK': {
      return {
        ...state,
        openTasks: [...state.openTasks, action.payload],
      };
    }

    case 'UPDATE_TASK': {
      const { task, id } = action.payload;
      // Check if task is in openTasks
      const openIndex = state.openTasks.findIndex(t => t.id === id);
      if (openIndex !== -1) {
        const updatedOpen = [...state.openTasks];
        updatedOpen[openIndex] = task;
        return {
          ...state,
          openTasks: updatedOpen,
        };
      }
      // Check if task is in completedTasks
      const completedIndex = state.completedTasks.findIndex(t => t.id === id);
      if (completedIndex !== -1) {
        const updatedCompleted = [...state.completedTasks];
        updatedCompleted[completedIndex] = task;
        return {
          ...state,
          completedTasks: updatedCompleted,
        };
      }
      return state;
    }

    case 'DELETE_TASK': {
      const { id } = action.payload;
      return {
        ...state,
        openTasks: state.openTasks.filter(task => task.id !== id),
        completedTasks: state.completedTasks.filter(task => task.id !== id),
      };
    }

    case 'MARK_COMPLETED': {
      const { task, id } = action.payload;
      const completedTask: Task = {
        ...task,
        status: 'completed',
        isCompleted: true,
      };
      return {
        ...state,
        openTasks: state.openTasks.filter(t => t.id !== id),
        completedTasks: [...state.completedTasks, completedTask],
      };
    }

    case 'LOAD_STATE': {
      return action.payload;
    }

    default:
      return state;
  }
}

// Context interface
interface TasksContextType {
  state: TasksState;
  dispatch: React.Dispatch<TasksAction>;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task, id: string) => void;
  deleteTask: (id: string) => void;
  markCompleted: (task: Task, id: string) => void;
  getTaskById: (id: string) => Task | undefined;
}

// Create context
const TasksContext = createContext<TasksContextType | undefined>(undefined);

// Provider component
interface TasksProviderProps {
  children: ReactNode;
}

export function TasksProvider({ children }: TasksProviderProps) {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load tasks from AsyncStorage on app startup
  useEffect(() => {
    const loadTasks = async () => {
      const savedState = await loadTasksFromStorage();
      if (savedState) {
        // Dispatch a special action to set the loaded state
        dispatch({ type: 'LOAD_STATE', payload: savedState });
      }
      setIsLoaded(true);
    };
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever state changes
  useEffect(() => {
    if (isLoaded) {
      saveTasksToStorage(state);
    }
  }, [state, isLoaded]);

  // Action creators
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: generateUUID(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (task: Task, id: string) => {
    dispatch({ type: 'UPDATE_TASK', payload: { task, id } });
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: { id } });
  };

  const markCompleted = (task: Task, id: string) => {
    dispatch({ type: 'MARK_COMPLETED', payload: { task, id } });
  };

  const getTaskById = (id: string): Task | undefined => {
    return state.openTasks.find(task => task.id === id) || 
           state.completedTasks.find(task => task.id === id);
  };

  const value: TasksContextType = {
    state,
    dispatch,
    addTask,
    updateTask,
    deleteTask,
    markCompleted,
    getTaskById,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
}

// Custom hook
export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}
