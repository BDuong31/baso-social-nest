import { Module, Provider } from '@nestjs/common';
import { ShareModule } from 'src/share/module';
import { CHAT_MESSAGE_REPOSITORY, CHAT_MESSAGE_SERVICE } from './chat-message.di-token';
import { ChatMessagePrismaRepository } from './insfra/chat-message-prisma.repo';
import { ChatMessageController, ChatMessageRpcController } from './insfra/chat-message.controller';
import { ChatMessageService } from './service';
import { ChatGateway } from './insfra/chat-message.gateway';
// Khai báo các Provider
const repositories: Provider[] = [
  { provide: CHAT_MESSAGE_REPOSITORY, useClass: ChatMessagePrismaRepository },
];

// Khai báo các Service
const services: Provider[] = [
  { provide: CHAT_MESSAGE_SERVICE, useClass: ChatMessageService },
];

// Khai báo Module ChatMessage
@Module({
  imports: [ShareModule],
  controllers: [ChatMessageController, ChatMessageRpcController],
  providers: [...repositories, ...services, ChatGateway],
})

export class ChatMessageModule {}