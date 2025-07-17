import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const adminDb = getFirestore();

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
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.jobDescription || !data.cvContent || !data.results) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Add the history entry using admin SDK
    const docData = {
      userId: decodedToken.uid,
      jobDescription: data.jobDescription,
      cvContent: data.cvContent,
      results: data.results,
      title: data.title || "",
      createdAt: new Date(),
    };

    console.log("Saving history document:", docData);
    
    const docRef = await adminDb.collection('histories').add(docData);
    console.log("History document saved with ID:", docRef.id);

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error("Error saving history:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to save history" 
    }, { status: 500 });
  }
} 