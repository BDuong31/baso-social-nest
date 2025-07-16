import { Module, Provider } from '@nestjs/common';
import { ShareModule } from 'src/share/module';
import { CHAT_MESSAGE_REPOSITORY, CHAT_MESSAGE_SERVICE } from './chat-message.di-token';
import { ChatMessagePrismaRepository } from './insfra/chat-message-prisma.repo';
import { ChatMessageController, ChatMessageRpcController } from './insfra/chat-message.controller';
import { ChatMessageService } from './service';
import { ChatGateway } from './insfra/chat-message.gateway';
import { UserModule } from '../user/user.module';
import { NotificationModule } from '../notification/notification.module';
import { PushNotificationService } from '../notification/push-notification.service';
import { USER_REPOSITORY } from '../user/user.di-token';
import { UserPrismaRepository } from '../user/user-prisma.repo';

// Khai báo các Provider
const repositories: Provider[] = [
  { provide: CHAT_MESSAGE_REPOSITORY, useClass: ChatMessagePrismaRepository },
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
    PushNotificationService,
];

// Khai báo các Service
const services: Provider[] = [
  { provide: CHAT_MESSAGE_SERVICE, useClass: ChatMessageService },
];

// Khai báo Module ChatMessage
@Module({
  imports: [ShareModule,  UserModule, NotificationModule],
  controllers: [ChatMessageController, ChatMessageRpcController],
  providers: [...repositories, ...services, ChatGateway],
})

export class ChatMessageModule {}