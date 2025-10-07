// types/eventTypes.ts
import type { Timestamp } from 'firebase/firestore';

export type EventType =
  | 'Practice'
  | 'Appointment'
  | 'Pickup'
  | 'Meeting'
  | 'Celebration'
  | 'Other';

export interface Event {
  id: string;
  familyId?: string; // 👈 optional, will be set in EventsContext
  createdBy: string;

  title: string;
  description?: string;
  location?: string;
  type?: EventType;

  // Firestore-native types
  startTime: Timestamp;
  endTime: Timestamp;

  recurrence?: string;      // e.g. "weekly", "daily"
  assignedTo: string[];     // userIds (empty = all invited)
  source?: string;          // "google", "outlook", "manual"
  color?: string;

  createdAt?: Timestamp;
  updatedAt?: Timestamp;    // ✅ add this for consistency
}

export type EventCreate = Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;
export type EventUpdate = Partial<Event>;
