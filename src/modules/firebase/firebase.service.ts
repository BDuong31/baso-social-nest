// File: src/firebase/firebase.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { join } from 'path'; 

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (!admin.apps.length) {
      const serviceAccountPath = join(process.cwd(), 'config', 'serviceAccountKey.json');

        admin.initializeApp({
            // credential.cert sẽ tự động đọc và phân tích cú pháp file JSON
            credential: admin.credential.cert(serviceAccountPath),
        });
        console.log('Firebase Admin SDK Initialized.');
    }
  }

  get messaging() {
    return admin.messaging();
  }
}


