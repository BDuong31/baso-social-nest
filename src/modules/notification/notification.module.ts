import { Module } from '@nestjs/common';
import { ShareModule } from 'src/share/module';
import { NotificationRepository } from './notificatio.repositoty';
import { NotificationController, NotificationMessageController } from './notification.controller';
import { NOTI_REPOSITORY, NOTI_SERVICE } from './notification.di-token';
import { NotificationService } from './notification.service';

// Khai báo các dependencies
const dependencies = [
  { provide: NOTI_SERVICE, useClass: NotificationService },
  { provide: NOTI_REPOSITORY, useClass: NotificationRepository},
];

// Khai báo Module Notification
@Module({
  imports: [ShareModule],
  controllers: [NotificationController, NotificationMessageController],
  providers: [...dependencies],
})
export class NotificationModule {}
