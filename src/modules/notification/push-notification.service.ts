import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Message } from 'firebase-admin/messaging';

@Injectable()
export class PushNotificationService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async send(fcmToken: string, title: string, body: string, data?: { [key: string]: string }) {
    if (!fcmToken) { 
      console.error('FCM token is required to send a push notification.');
      return;
    }

    const message: Message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
      android: {
        priority: 'high',
        notification: { sound: 'default', channelId: 'default_channel_id' },
      },
    };

    try {
      const response = await this.firebaseService.messaging.send(message);
      console.log('Push notification sent successfully:', response);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}