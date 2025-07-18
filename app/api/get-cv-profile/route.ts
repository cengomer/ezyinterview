import { NextRequest, NextResponse } from "next/server";
import { getCVProfile } from "../../../utils/saveCVProfile";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { User } from "firebase/auth";

// Define interfaces for better type safety
interface DecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  phone_number?: string;
}

export const runtime = "nodejs";

// Prevent pre-rendering of this route
export const dynamic = "force-dynamic";

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
    let decodedToken: DecodedToken;
    
    try {
      decodedToken = await getAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    // Create a User object with all required properties
    const user: User = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
      emailVerified: decodedToken.email_verified ?? false,
      displayName: decodedToken.name ?? null,
      photoURL: decodedToken.picture ?? null,
      phoneNumber: decodedToken.phone_number ?? null,
      providerId: 'firebase',
      isAnonymous: false,
      metadata: {
        creationTime: '',
        lastSignInTime: ''
      },
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => { throw new Error('Not implemented'); },
      getIdToken: async () => token,
      getIdTokenResult: async () => ({ 
        claims: {}, 
        token: '', 
        authTime: '', 
        issuedAtTime: '', 
        expirationTime: '', 
        signInProvider: null,
        signInSecondFactor: null
      }),
      reload: async () => {},
      toJSON: () => ({ uid: decodedToken.uid })
    };

    const cvProfile = await getCVProfile(user);
    
    if (!cvProfile) {
      return NextResponse.json({ 
        success: false, 
        error: "No CV profile found. Please upload your CV in the Profile section first." 
      }, { status: 404 });
    }

    const response = {
      success: true,
      cvProfile: {
        summary: cvProfile.summary,
        fileName: cvProfile.fileName,
        updatedAt: cvProfile.updatedAt,
        extractedText: cvProfile.extractedText,
        fileSize: cvProfile.fileSize
      }
    };

    return NextResponse.json(response);

  } catch (err: unknown) {
    console.error("Get CV profile API error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ 
      success: false, 
      error: "Something went wrong - please refresh and try again." 
    }, { status: 500 });
  }
} 