// my-app/utils/saveHistory.ts
import { db } from "../app/firebase/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export async function saveHistory({
  user,
  jobDescription,
  cvName,
  results,
  title,
}: {
  user: User;
  jobDescription: string;
  cvName?: string;
  results: any;
  title?: string;
}) {
  if (!user) throw new Error("User not authenticated");
  const docData = {
    userId: user.uid,
    createdAt: serverTimestamp(),
    jobDescription,
    cvName,
    results,
    ...(title ? { title } : {}),
  };
  console.log("[saveHistory] Attempting to save:", docData);
  try {
    const docRef = await addDoc(collection(db, "histories"), docData);
    console.log("[saveHistory] Saved successfully with ID:", docRef.id);
  } catch (err) {
    console.error("[saveHistory] Error saving history:", err);
    throw err;
  }
}
