// my-app/utils/getAuthToken.ts
import { User } from "firebase/auth";

export async function getAuthToken(user: User): Promise<string> {
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error("Failed to get auth token:", error);
    throw new Error("Authentication failed");
  }
} 