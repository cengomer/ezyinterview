import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../firebase/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase-admin/auth";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const data = await req.json();
    
    // Add the history entry
    const historyRef = collection(db, "histories");
    await addDoc(historyRef, {
      userId: decodedToken.uid,
      jobDescription: data.jobDescription,
      cvContent: data.cvContent,
      results: data.results,
      title: data.title,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving history:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to save history" 
    }, { status: 500 });
  }
} 