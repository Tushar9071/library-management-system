import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { PrismaService } from '../../db/prisma/prisma.service';

@Injectable()
export class FirebaseService {
  private app: admin.app.App;

  constructor(private prisma: PrismaService) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      let credential;

      // Check if service account key is provided as environment variable
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
          const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
          );
          credential = admin.credential.cert(serviceAccount);
        } catch (error) {
          console.error('Error parsing Firebase service account key:', error);
          credential = admin.credential.applicationDefault();
        }
      } else {
        // Use default application credentials (Firebase CLI login or GOOGLE_APPLICATION_CREDENTIALS)
        credential = admin.credential.applicationDefault();
      }

      this.app = admin.initializeApp({
        credential,
        projectId:
          process.env.FIREBASE_PROJECT_ID || 'library-management-syste-58861',
      });
    } else {
      this.app = admin.app();
    }
  }

  async verifyIdToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      console.error('Firebase token verification error:', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async getUserIdFromToken(idToken: string): Promise<number | null> {
    try {
      const decodedToken = await this.verifyIdToken(idToken);

      // Look up user by email from Firebase token
      const user = await this.prisma.users.findUnique({
        where: { email: decodedToken.email },
      });

      return user?.id || null;
    } catch (error) {
      console.error('Error getting user ID from Firebase token:', error);
      return null;
    }
  }
}
