import { NextRequest, NextResponse } from "next/server";
import { getCVProfile } from "../../../utils/saveCVProfile";
import { auth } from "../../firebase/firebaseClient";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";

export const runtime = "nodejs";

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

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch (error) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    const cvProfile = await getCVProfile(user as any);
    
    if (!cvProfile) {
      return NextResponse.json({ 
        success: false, 
        error: "No CV profile found. Please upload your CV in the Profile section first." 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      cvProfile: {
        summary: cvProfile.summary,
        fileName: cvProfile.fileName,
        updatedAt: cvProfile.updatedAt,
      }
    });

  } catch (err: any) {
    console.error("Get CV profile API error:", err);
    return NextResponse.json({ 
      success: false, 
      error: "Something went wrong - please refresh and try again." 
    }, { status: 500 });
  }
} 