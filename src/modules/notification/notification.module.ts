import { Module } from '@nestjs/common';
import { ShareModule } from 'src/share/module';
import { NotificationRepository } from './notificatio.repositoty';
import { NotificationController, NotificationMessageController } from './notification.controller';
import { NOTI_REPOSITORY, NOTI_SERVICE } from './notification.di-token';
import { NotificationService } from './notification.service';
import { FirebaseModule } from '../firebase/firebase.module'; // Import FirebaseModule
import { PushNotificationService } from './push-notification.service';
import { UserPrismaRepository } from '../user/user-prisma.repo';
import { USER_REPOSITORY } from 'src/modules/user/user.di-token';
import { UserModule } from '../user/user.module';

// Khai báo các dependencies
const dependencies = [
  { provide: NOTI_SERVICE, useClass: NotificationService },
  { provide: NOTI_REPOSITORY, useClass: NotificationRepository},
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
  PushNotificationService,
];

// Khai báo Module Notification
@Module({
  imports: [ShareModule, FirebaseModule, UserModule],
  controllers: [NotificationController, NotificationMessageController],
  providers: [
    ...dependencies,
    PushNotificationService, 
    NotificationService, 
    { provide: NOTI_SERVICE, useClass: NotificationService },
    { provide: NOTI_REPOSITORY, useClass: NotificationRepository },
  ],
})
export class NotificationModule {}
