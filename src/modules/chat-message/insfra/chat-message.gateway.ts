import { 
  WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, 
  OnGatewayConnection, OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject } from '@nestjs/common';
import { IChatMessageService } from '../chat-message.port';
import { CHAT_MESSAGE_SERVICE } from '../chat-message.di-token';

interface UserSocket {
  [userId: string]: string; // Lưu userId -> socketId
}

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSockets: UserSocket = {}; // Lưu danh sách user online

  constructor(@Inject(CHAT_MESSAGE_SERVICE) private readonly service: IChatMessageService) {}

  // Khi user kết nối WebSocket
  handleConnection(client: Socket) {
    console.log(`User connected: ${client.id}`);
  }

  // Khi user đăng ký ID của họ (gọi khi user đăng nhập)
  @SubscribeMessage('register')
  registerUser(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    this.userSockets[data.userId] = client.id;
    console.log(`User ${data.userId} đăng ký với socket ${client.id}`);

    // Gửi danh sách user online cho tất cả client
    this.broadcastOnlineUsers();
  }

  // Gửi tin nhắn tới một user cụ thể
  @SubscribeMessage('privateMessage')
  async handlePrivateMessage(
    @MessageBody() data: { name: string; avatar: string; roomId: string; sender: string; receiverId: string; message: string },
    @ConnectedSocket() client: Socket
  ) {
    const receiverSocketId = this.userSockets[data.receiverId];

    const messageData = await this.service.create({
      roomId: data.roomId,
      senderId: data.sender,
      content: data.message,
    });

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

  // Khi user ngắt kết nối
  handleDisconnect(client: Socket) {
    const userId = Object.keys(this.userSockets).find((key) => this.userSockets[key] === client.id);
    if (userId) {
      delete this.userSockets[userId];
      console.log(`User ${userId} đã ngắt kết nối`);

      // Cập nhật danh sách user online
      this.broadcastOnlineUsers();
    }
  }

  // Gửi danh sách user online cho tất cả client
  private broadcastOnlineUsers() {
    const onlineUserIds = Object.keys(this.userSockets);
    this.server.emit('onlineUsers', onlineUserIds);
  }

  // API kiểm tra user có online không
  @SubscribeMessage('checkOnline')
  checkUserOnline(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    const isOnline = !!this.userSockets[userId];
    client.emit('userStatus', { userId, isOnline });
  }
}
