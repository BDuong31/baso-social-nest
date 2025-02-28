import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IChatMessageService } from '../chat-message.port';
import { CHAT_MESSAGE_SERVICE } from '../chat-message.di-token';
import { Inject } from '@nestjs/common';
import { ChatMessageCondDTO, ChatMessageCreationDTO, ChatMessageCreationDTOSchema, ChatMessageUpdateDTO } from '../model';

interface UserSocket {
  [userId: string]: string; // Lưu userId -> socketId
}

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway {
    constructor(
        @Inject(CHAT_MESSAGE_SERVICE) private readonly service: IChatMessageService) {}
  @WebSocketServer() server: Server;

  private userSockets: UserSocket = {}; // Lưu danh sách user và socket ID

  // Khi user kết nối WebSocket
  handleConnection(client: Socket) {
    console.log(`User connected: ${client.id}`);
  }

  

  // Khi user đăng ký ID của họ (được gọi khi user đăng nhập)
  @SubscribeMessage('register')
  registerUser(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    this.userSockets[data.userId] = client.id;
    console.log(`User ${data.userId} đăng ký với socket ${client.id}`);
  }

  // Gửi tin nhắn tới một user cụ thể
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: {name: string;avatar: string; roomId: string; sender: string; receiverId: string; message: string },
    @ConnectedSocket() client: Socket
  ) {
    const receiverSocketId = this.userSockets[data.receiverId];
    
    const messageData = await this.service.create({
        roomId: data.roomId,
        senderId: data.sender,
        content: data.message,
    })

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('message', {
        name: data.name,
        avatar: data.avatar,
        roomId: data.roomId,
        sender: data.sender,
        message: data.message,
      });
      console.log(`Gửi tin nhắn từ ${data.name} tới ${data.receiverId}`);
    } else {
      console.log(`Không tìm thấy user ${data.receiverId}`);
    }
  }

  // Khi user ngắt kết nối, xóa khỏi danh sách
  handleDisconnect(client: Socket) {
    const userId = Object.keys(this.userSockets).find((key) => this.userSockets[key] === client.id);
    if (userId) {
      delete this.userSockets[userId];
      console.log(`User ${userId} đã ngắt kết nối`);
    }
  }
}
