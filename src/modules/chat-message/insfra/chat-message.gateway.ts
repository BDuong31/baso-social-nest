import { 
  WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket, 
  OnGatewayConnection, OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, OnModuleDestroy } from '@nestjs/common';
import { IChatMessageService } from '../chat-message.port';
import { CHAT_MESSAGE_SERVICE } from '../chat-message.di-token';

interface UserSocket {
  [userId: string]: string; // Lưu userId -> socketId
}

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
  @WebSocketServer() server: Server;
  private userSockets: UserSocket = {}; // Lưu danh sách user online
  private interval: NodeJS.Timeout; // Interval để gửi danh sách user online liên tục

  constructor(@Inject(CHAT_MESSAGE_SERVICE) private readonly service: IChatMessageService) {
    // Cứ 5 giây bắn danh sách user online
    this.interval = setInterval(() => {
      this.broadcastOnlineUsers();
    }, 5000);
  }

  // Khi module bị hủy (ví dụ: server tắt), clear interval để tránh memory leak
  onModuleDestroy() {
    clearInterval(this.interval);
  }

  // Khi user kết nối WebSocket
  handleConnection(client: Socket) {
    console.log(`User connected: ${client.id}`);
  }

  // Khi user đăng ký ID của họ (gọi khi user đăng nhập)
  @SubscribeMessage('register')
  registerUser(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    if (!data.userId) {
      client.emit('error', 'User ID không hợp lệ');
      return;
    }

    // Nếu user đã đăng nhập từ thiết bị khác, cập nhật socketId mới
    const previousSocketId = this.userSockets[data.userId];
    if (previousSocketId && previousSocketId !== client.id) {
      console.log(`User ${data.userId} đổi socket từ ${previousSocketId} sang ${client.id}`);
    }

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
    if (!data.receiverId || !data.message) {
      client.emit('error', 'Thông tin tin nhắn không hợp lệ');
      return;
    }

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
      client.emit('error', `User ${data.receiverId} hiện không online.`);
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
    console.log('Cập nhật danh sách user online:', onlineUserIds);
  }

  // API kiểm tra user có online không
  @SubscribeMessage('checkOnline')
  checkUserOnline(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    const isOnline = !!this.userSockets[userId];
    client.emit('userStatus', { userId, isOnline });
  }
}
