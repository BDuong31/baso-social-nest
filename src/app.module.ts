import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentModule } from './modules/comment/comment.module';
import { CommentLikeModule } from './modules/comment-like/comment-like.module';
import { FollowingModule } from './modules/following/following.module';
import { NotificationModule } from './modules/notification/notification.module';
import { PostLikeModule } from './modules/post-like/post-like.module';
import { PostSaveModule } from './modules/post-save/post-save.module';
import { PostModule } from './modules/post/post.module';
import { TopicModule } from './modules/topic/topic.module';
import { UploadModule } from './modules/upload/upload-module';
import { UserModule } from './modules/user/user.module';
import { ChatRoomModule } from './modules/chat-room/chat-room.module';
import { ChatMessageModule } from './modules/chat-message/chat-message.module';
import { ShareModule } from './share/module';
import { FirebaseModule } from './modules/firebase/firebase.module';
@Module({
  imports: [
    // Cấu hình ServeStaticModule để phục vụ các tệp tĩnh từ thư mục uploads
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Cấu hình ServeStaticModule để phục vụ các tệp tĩnh từ thư mục assets
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets'),
      serveRoot: '/assets',
    }),

    // Import các module
    FirebaseModule,
    ShareModule,
    UserModule,
    UploadModule,
    TopicModule,
    PostModule,
    CommentModule,
    CommentLikeModule,
    PostLikeModule,
    PostSaveModule,
    FollowingModule,
    NotificationModule,
    ChatRoomModule,
    ChatMessageModule,
  ],
  controllers: [AppController], // Định nghĩa các controller
  providers: [AppService], // Định nghĩa các service
})
export class AppModule {}