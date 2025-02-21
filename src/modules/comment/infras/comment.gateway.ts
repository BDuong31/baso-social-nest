import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  // WebSocketGateway: Đánh dấu một lớp là một WebSocket Gateway
  @WebSocketGateway({
    namespace: '/comment', 
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Lớp CommentGateway định nghĩa các phương thức xử lý sự kiện WebSocket
  export class CommentGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
  {
    @WebSocketServer() server: Server;
  
    // Phương thức khởi tạo
    afterInit(server: Server) {
      console.log('Comment WebSocket server initialized');
    }
  
    // Phương thức xử lý khi có một client kết nối tới server
    handleConnection(client: Socket) {
      console.log(`Client connected to Comment: ${client.id}`);
    }
  
    // Phương thức xử lý khi một client ngắt kết nối với server
    handleDisconnect(client: Socket) {
      console.log(`Client disconnected from Comment: ${client.id}`);
    }
  
    // Phương thức xử lý khi nhận được một sự kiện 'sendComment' từ client
    @SubscribeMessage('sendComment')
    handleComment(client: Socket, payload: { postId: string; comment: string }) {
      console.log(`Comment received on post ${payload.postId}: ${payload.comment}`);
      this.server.emit('receiveComment', payload); // Broadcast comment to all clients
    }
  }
  