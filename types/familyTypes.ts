// types/familyTypes.ts
export type FamilyRole = "mom" | "dad" | "kid";

export interface FamilyMember {
  id: string;       // Firestore doc id under families/{familyId}/members
  uid?: string;     // Firebase Auth UID (optional, for mapping current user)
  name: string;
  color: string;
  role: FamilyRole;
}
