// context/EventsContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  ReactNode,
} from "react";
import { db, auth } from "@/firebaseConfig";
import {
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Event, EventCreate, EventUpdate } from "@/types/eventTypes";

// ---- Decorated Type & Helper ----
export interface DecoratedEvent extends Event {
  isOngoing: boolean;
  isUpcoming: boolean;
  isPast: boolean;
}

function decorateEvent(event: Event): DecoratedEvent {
  const now = new Date();
  const start = event.startTime.toDate();
  const end = event.endTime.toDate();

  return {
    ...event,
    isOngoing: start <= now && end >= now,
    isUpcoming: start > now,
    isPast: end < now,
  };
}

// ---- State & Actions ----
interface EventsState {
  events: DecoratedEvent[];
  familyId: string | null;
}

type EventsAction =
  | { type: "LOAD_EVENTS"; payload: DecoratedEvent[] }
  | { type: "SET_FAMILY"; payload: string | null };

interface EventsContextType {
  state: EventsState;
  addEvent: (event: EventCreate) => Promise<void>;
  updateEvent: (event: EventUpdate, id: string) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => DecoratedEvent | undefined;
}

// ---- Reducer ----
const initialState: EventsState = { events: [], familyId: null };

function eventsReducer(state: EventsState, action: EventsAction): EventsState {
  switch (action.type) {
    case "LOAD_EVENTS":
      return { ...state, events: action.payload };
    case "SET_FAMILY":
      return { ...state, familyId: action.payload };
    default:
      return state;
  }
}

// ---- Context ----
const EventsContext = createContext<EventsContextType | undefined>(undefined);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(eventsReducer, initialState);
  const { user } = useAuth();

  // 🔥 Listen to familyId from user profile
  useEffect(() => {
    if (!user) {
      dispatch({ type: "SET_FAMILY", payload: null });
      return;
    }

    const profileRef = doc(db, "users", user.uid, "profile", "main");
    const unsub = onSnapshot(profileRef, (snap) => {
      if (snap.exists()) {
        const familyId = snap.data().familyId || null;
        dispatch({ type: "SET_FAMILY", payload: familyId });
      } else {
        dispatch({ type: "SET_FAMILY", payload: null });
      }
    });

    return () => unsub();
  }, [user]);

  // 🔥 Subscribe to family events
  useEffect(() => {
    if (!state.familyId) return;

    const ref = collection(db, "families", state.familyId, "events");
    const unsub = onSnapshot(ref, (snap) => {
      const events: Event[] = [];
      snap.forEach((docSnap) =>
        events.push({ id: docSnap.id, ...docSnap.data() } as Event)
      );

      const decorated = events
        .map(decorateEvent)
        .sort(
          (a, b) =>
            a.startTime.toDate().getTime() - b.startTime.toDate().getTime()
        );

      dispatch({ type: "LOAD_EVENTS", payload: decorated });
    });

    return () => unsub();
  }, [state.familyId]);

  // ---- CRUD ----
  const addEvent = async (event: EventCreate) => {
    if (!state.familyId) throw new Error("No family selected");
    const ref = collection(db, "families", state.familyId, "events");
    await addDoc(ref, {
      ...event,
      familyId: state.familyId,
      createdBy: auth.currentUser?.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const updateEvent = async (event: EventUpdate, id: string) => {
    if (!state.familyId) throw new Error("No family selected");
    await setDoc(
      doc(db, "families", state.familyId, "events", id),
      { ...event, updatedAt: serverTimestamp() },
      { merge: true }
    );
  };

  const deleteEvent = async (id: string) => {
    if (!state.familyId) throw new Error("No family selected");
    await deleteDoc(doc(db, "families", state.familyId, "events", id));
  };

  const getEventById = (id: string) =>
    state.events.find((e) => e.id === id);

  return (
    <EventsContext.Provider
      value={{ state, addEvent, updateEvent, deleteEvent, getEventById }}
    >
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within an EventsProvider");
  return ctx;
}
