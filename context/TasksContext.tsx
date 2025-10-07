// context/TasksContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { Task, DecoratedTask, decorateTask } from "@/types/taskTypes";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

// ---- State & Actions ----
interface TasksState {
  openTasks: DecoratedTask[];
  completedTasks: DecoratedTask[];
}

type TasksAction =
  | { type: "ADD_TASK"; payload: DecoratedTask }
  | { type: "UPDATE_TASK"; payload: { task: Task; id: string } }
  | { type: "DELETE_TASK"; payload: { id: string } }
  | { type: "LOAD_STATE"; payload: TasksState };

const initialState: TasksState = { openTasks: [], completedTasks: [] };

function tasksReducer(state: TasksState, action: TasksAction): TasksState {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        openTasks: [...state.openTasks, action.payload],
      };
    case "UPDATE_TASK": {
      const { task, id } = action.payload;
      const updated = decorateTask({ ...task, id });

      const openSans = state.openTasks.filter((t) => t.id !== id);
      const doneSans = state.completedTasks.filter((t) => t.id !== id);

      if (updated.isCompleted) {
        return {
          ...state,
          completedTasks: [updated, ...doneSans],
          openTasks: openSans,
        };
      } else {
        return {
          ...state,
          openTasks: [updated, ...openSans],
          completedTasks: doneSans,
        };
      }
    }
    case "DELETE_TASK": {
      const { id } = action.payload;
      return {
        ...state,
        openTasks: state.openTasks.filter((t) => t.id !== id),
        completedTasks: state.completedTasks.filter((t) => t.id !== id),
      };
    }
    case "LOAD_STATE":
      return action.payload;
    default:
      return state;
  }
}

// ---- Family Member Type ----
export type FamilyRole = "mom" | "dad" | "kid";

interface FamilyMember {
  id: string; // Firestore doc id
  uid?: string; // Firebase Auth uid (optional, for mapping current user)
  name: string;
  color: string;
  role: FamilyRole;
}

// ---- Context Type ----
interface TasksContextType {
  state: TasksState;
  familyMembers: Record<string, FamilyMember>;
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (task: Task, id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => DecoratedTask | undefined;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<
    Record<string, FamilyMember>
  >({});
  const { user } = useAuth();

  // 1) Get user's familyId from their profile
  useEffect(() => {
    const fetchFamilyId = async () => {
      if (!user) {
        setFamilyId(null);
        return;
      }
      const profileRef = doc(db, "users", user.uid, "profile", "main");
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        setFamilyId(profileSnap.data().familyId || null);
      } else {
        setFamilyId(null);
      }
    };
    fetchFamilyId();
  }, [user]);

  // 2) Subscribe to tasks in this family
  useEffect(() => {
    if (!familyId) return;

    const unsub = onSnapshot(
      collection(db, "families", familyId, "tasks"),
      (snap) => {
        const tasks: Task[] = [];
        snap.forEach((docSnap) =>
          tasks.push({ id: docSnap.id, ...docSnap.data() } as Task)
        );

        const decorated = tasks.map(decorateTask);
        const openTasks = decorated.filter((t) => !t.isCompleted);
        const completedTasks = decorated.filter((t) => t.isCompleted);

        dispatch({
          type: "LOAD_STATE",
          payload: { openTasks, completedTasks },
        });
      }
    );

    return () => unsub();
  }, [familyId]);

  // 3) Subscribe to family members
  useEffect(() => {
    if (!familyId) return;

    const unsub = onSnapshot(
      collection(db, "families", familyId, "members"),
      (snap) => {
        const members: Record<string, FamilyMember> = {};
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          members[docSnap.id] = {
            id: docSnap.id,
            uid: data.uid,
            name: data.displayName || "Unknown",
            color: data.color || "#E5E7EB",
            role: (data.role as FamilyRole) || "kid",
          };
        });
        setFamilyMembers(members);
      }
    );

    return () => unsub();
  }, [familyId]);

  // 4) CRUD methods
  const addTask = async (task: Omit<Task, "id">) => {
    if (!familyId || !user) return;
    await addDoc(collection(db, "families", familyId, "tasks"), {
      ...task,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateTask = async (task: Task, id: string) => {
    if (!familyId) return;
    await setDoc(
      doc(db, "families", familyId, "tasks", id),
      {
        ...task,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const deleteTask = async (id: string) => {
    if (!familyId) return;
    await deleteDoc(doc(db, "families", familyId, "tasks", id));
  };

  const getTaskById = (id: string) =>
    state.openTasks.find((t) => t.id === id) ||
    state.completedTasks.find((t) => t.id === id);

  return (
    <TasksContext.Provider
      value={{
        state,
        familyMembers,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within a TasksProvider");
  return ctx;
}
