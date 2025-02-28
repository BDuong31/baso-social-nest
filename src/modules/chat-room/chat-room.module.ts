import { Module, Provider } from '@nestjs/common';
import { ShareModule } from 'src/share/module';
import { CHAT_MESSAGE_REPOSITORY, CHAT_ROOM_REPOSITORY, CHAT_ROOM_SERVICE } from './chat-room.di-token';
import { ChatRoomPrismaRepository } from './chat-room-prisma.repo';
import { ChatRoomController, ChatRoomRpcController } from './chat-room.controller';
import { ChatRoomService } from './chat-room.service';
import { ChatMessagePrismaRepository } from '../chat-message/insfra/chat-message-prisma.repo';

// Khai báo các Provider
const repositories: Provider[] = [
  { provide: CHAT_ROOM_REPOSITORY, useClass: ChatRoomPrismaRepository },
];

// Khai báo các Service
const services: Provider[] = [
  { provide: CHAT_ROOM_SERVICE, useClass: ChatRoomService },
];

const chatMessage: Provider[] = [
  { provide: CHAT_MESSAGE_REPOSITORY, useClass: ChatMessagePrismaRepository },
];

// Khai báo Module ChatRoom
@Module({
  imports: [ShareModule],
  controllers: [ChatRoomController, ChatRoomRpcController],
  providers: [...repositories, ...services, ...chatMessage],
})

export class ChatRoomModule {}
