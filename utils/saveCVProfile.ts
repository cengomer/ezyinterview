// my-app/utils/saveCVProfile.ts
import { db } from "../app/firebase/firebaseClient";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export interface CVProfile {
  extractedText: string;
  summary: string;
  fileName: string;
  fileSize: number;
  updatedAt: any; // Firestore timestamp
}

export async function saveCVProfile({
  user,
  extractedText,
  summary,
  fileName,
  fileSize,
}: {
  user: User;
  extractedText: string;
  summary: string;
  fileName: string;
  fileSize: number;
}) {
  if (!user) throw new Error("User not authenticated");
  
  const cvProfile: CVProfile = {
    extractedText,
    summary,
    fileName,
    fileSize,
    updatedAt: serverTimestamp(),
  };
  
  console.log("[saveCVProfile] Attempting to save CV profile for user:", user.uid);
  
  try {
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, { cvProfile }, { merge: true });
    console.log("[saveCVProfile] CV profile saved successfully");
  } catch (err) {
    console.error("[saveCVProfile] Error saving CV profile:", err);
    throw err;
  }
}

export async function getCVProfile(user: User): Promise<CVProfile | null> {
  if (!user) throw new Error("User not authenticated");
  
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().cvProfile) {
      console.log("[getCVProfile] CV profile found for user:", user.uid);
      return userDoc.data().cvProfile as CVProfile;
    } else {
      console.log("[getCVProfile] No CV profile found for user:", user.uid);
      return null;
    }
  } catch (err) {
    console.error("[getCVProfile] Error fetching CV profile:", err);
    throw err;
  }
} 