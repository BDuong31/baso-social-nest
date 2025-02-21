import { Module, Provider } from '@nestjs/common';
import { ShareModule } from 'src/share/module';
import { CHAT_ROOM_REPOSITORY, CHAT_ROOM_SERVICE } from './chat-room.di-token';
import { ChatRoomPrismaRepository } from './chat-room-prisma.repo';
import { ChatRoomController, ChatRoomRpcController } from './chat-room.controller';
import { ChatRoomService } from './chat-room.service';

// Khai báo các Provider
const repositories: Provider[] = [
  { provide: CHAT_ROOM_REPOSITORY, useClass: ChatRoomPrismaRepository },
];

// Khai báo các Service
const services: Provider[] = [
  { provide: CHAT_ROOM_SERVICE, useClass: ChatRoomService },
];

// Khai báo Module ChatRoom
@Module({
  imports: [ShareModule],
  controllers: [ChatRoomController, ChatRoomRpcController],
  providers: [...repositories, ...services],
})

export class ChatRoomModule {}
