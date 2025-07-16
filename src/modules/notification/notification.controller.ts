import { Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { IPostRpc, IPublicUserRpc, paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester } from "src/share";
import { RedisClient } from "src/share/components";
import { POST_RPC, USER_RPC } from "src/share/di-token";
import { EvtFollowed, EvtPostCommented, EvtPostLiked, FollowedEvent, PostCommentedEvent, PostLikedEvent } from "src/share/event";
import { RemoteAuthGuard } from "src/share/guard";
import { NOTI_SERVICE } from "./notification.di-token";
import { NotificationAction, NotificationCreateDTO } from "./notification.model";
import { INotificationService } from "./notification.port";
import { PushNotificationService } from "./push-notification.service";
import { IUserRepository } from "src/modules/user/user.port";
import { USER_REPOSITORY } from "src/modules/user/user.di-token";

// Lớp NotificationController cung cấp các API liên quan đến thông báo
@Controller('v1/notifications')
export class NotificationController {
  constructor(
    @Inject(NOTI_SERVICE) private readonly service: INotificationService,
  ) { }

  // API lấy danh sách thông báo
  @Get()
  @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
  @HttpCode(HttpStatus.OK)
  async list(@Query() paging: PagingDTO, @Request() request: ReqWithRequester) {
    const { sub: userId } = request.requester;
    paging = pagingDTOSchema.parse(paging);

    const result = await this.service.list({ receiverId: userId }, paging);
    return paginatedResponse(result, {});
  }

  // API đọc thông báo
  @Post(':id/read')
  @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
  @HttpCode(HttpStatus.OK)
  async read(@Param('id') id: string, @Request() request: ReqWithRequester) {
    const { requester } = request;

    const result = await this.service.read(id, requester);
    return { data: result };
  }

  // API đọc tất cả thông báo
  @Post('read-all')
  @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
  @HttpCode(HttpStatus.OK)
  async readAll(@Request() request: ReqWithRequester) {
    const { requester } = request;

    const result = await this.service.readAll(requester);
    return { data: result };
  }
}

// Lớp NotificationMessageController lắng nghe các sự kiện liên quan đến thông báo và cập nhật dữ liệu
@Controller()
export class NotificationMessageController {
  constructor(
    @Inject(NOTI_SERVICE) private readonly useCase: INotificationService,
    @Inject(USER_RPC) private readonly userPublicUseRPC: IPublicUserRpc,
    @Inject(POST_RPC) private readonly postRPC: IPostRpc,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository, 
    private readonly pushService: PushNotificationService,
  ) {
    console.log('✅ NotificationMessageController has been initialized. Starting subscription...');
    this.subscribe();
  }

  // Xử lý sự kiện người dùng đã thích bài viết
async handlePostLiked(evt: PostLikedEvent) {
    try {
      console.log(`[PUSH_DEBUG] BƯỚC 5: Bắt đầu xử lý sự kiện PostLiked cho postId: ${evt.payload.postId}`);
      
      const { postId } = evt.payload;
      const actorId = evt.senderId!;

      const post = await this.postRPC.findById(postId);
      console.log(`[PUSH_DEBUG] BƯỚC 5A: Kết quả tìm post:`, post ? `Tìm thấy post id ${post.id}` : 'Không tìm thấy post');
      
      const actor = await this.userPublicUseRPC.findById(actorId);
      console.log(`[PUSH_DEBUG] BƯỚC 5B: Kết quả tìm actor:`, actor ? `Tìm thấy actor ${actor.username}` : 'Không tìm thấy actor');
      
      if (!post || !actor || actorId === post.authorId) {
        console.log('[PUSH_DEBUG] KẾT THÚC SỚM: Điều kiện không hợp lệ (post/actor không tồn tại hoặc tự like).');
        return;
      }
      
      console.log(`[PUSH_DEBUG] BƯỚC 5C: Đang tạo thông báo trong database...`);
      const dto: NotificationCreateDTO = {
        receiverId: post.authorId,
        actorId,
        content: `${actor.firstName} ${actor.lastName} đã thích bài viết của bạn.`,
        action: NotificationAction.LIKED,
      };
      await this.useCase.create(dto);
      console.log(`[PUSH_DEBUG] BƯỚC 5D: Đã tạo thông báo trong database thành công. Đang tìm người nhận...`);

      // Lấy user đầy đủ để có fcmToken
      const receiver = await this.userRepo.get(post.authorId);
      console.log(`[PUSH_DEBUG] BƯỚC 5E: Kết quả tìm người nhận:`, receiver ? `Tìm thấy user ${receiver.username} với FCM Token: ${receiver.fcmToken}` : 'Không tìm thấy người nhận');

      if (receiver?.fcmToken) {
        console.log(`[PUSH_DEBUG] BƯỚC 5F: Chuẩn bị gửi Push Notification...`);
        await this.pushService.send(
            receiver.fcmToken,
            'Có lượt thích mới!',
            dto.content,
            { postId: post.id, screen: 'postDetails' }
        );
        console.log(`[PUSH_DEBUG] HOÀN TẤT: Đã gọi lệnh gửi Push Notification.`);
      } else {
        console.log('[PUSH_DEBUG] KẾT THÚC: Người nhận không có FCM token để gửi.');
      }
    } catch (error) {
      console.error('[PUSH_DEBUG] LỖI BÊN TRONG handlePostLiked:', error);
    }
  }

  // Xử lý sự kiện người dùng đã theo dõi
  async handleFollowed(evt: FollowedEvent) {
    const { followingId } = evt.payload;
    const actorId = evt.senderId!;

    const actor = await this.userPublicUseRPC.findById(actorId);
    if (!actor) { return; }

    const dto: NotificationCreateDTO = {
      receiverId: followingId,
      actorId,
      content: `${actor.firstName} ${actor.lastName} followed you`,
      action: NotificationAction.FOLLOWED,
    };

    await this.useCase.create(dto);

    // Lấy user đầy đủ để có fcmToken
    const receiver = await this.userRepo.get(followingId);
    if (receiver?.fcmToken) {
      await this.pushService.send(
        receiver.fcmToken,
        'Bạn có người theo dõi mới!',
        dto.content,
        { userId: followingId, screen: 'profile' }
      );
    } else {
      console.log(`[PUSH_DEBUG] Người nhận không có FCM token để gửi.`);
    }
  };

  async handlePostCommented(evt: PostCommentedEvent) {
    const { postId, authorIdOfParentComment } = evt.payload;
    const actorId = evt.senderId!;

    // Luôn cần thông tin bài viết và người thực hiện hành động
    const [post, actor] = await Promise.all([
      this.postRPC.findById(postId),
      this.userPublicUseRPC.findById(actorId),
    ]);

    if (!post || !actor) return;

    // Tạo một danh sách những người sẽ nhận thông báo (để tránh gửi trùng)
    const receiversToSend = new Set<string>();

    // --- Kịch bản 1: Đây là một bình luận trả lời ---
    if (authorIdOfParentComment && authorIdOfParentComment !== actorId) {
      receiversToSend.add(authorIdOfParentComment);
    }
    
    // --- Kịch bản 2: Gửi cho chủ bài viết (nếu không phải tự bình luận) ---
    // Điều kiện: người bình luận không phải chủ bài viết
    // VÀ người bình luận không phải đang trả lời chính chủ bài viết (tránh thông báo kép)
    if (post.authorId !== actorId && post.authorId !== authorIdOfParentComment) {
      receiversToSend.add(post.authorId);
    }

    // Nếu không có ai để gửi thì kết thúc
    if (receiversToSend.size === 0) return;

    // Lặp qua danh sách những người nhận và gửi thông báo
    for (const receiverId of receiversToSend) {
      // Lấy thông tin đầy đủ của người nhận để có fcmToken
      const receiverUser = await this.userRepo.get(receiverId);

      // Xác định nội dung thông báo dựa trên người nhận
      const content = receiverId === authorIdOfParentComment
        ? `${actor.firstName} ${actor.lastName} đã trả lời bình luận của bạn.`
        : `${actor.firstName} ${actor.lastName} đã bình luận về bài viết của bạn.`;
      
      const title = receiverId === authorIdOfParentComment
        ? 'Bạn có trả lời mới!'
        : 'Bài viết của bạn có bình luận mới!';

      // 1. Tạo thông báo trong database
      await this.useCase.create({
        receiverId: receiverId,
        actorId,
        content,
        action: NotificationAction.REPLIED,
      });

      // 2. Gửi thông báo đẩy
      if (receiverUser?.fcmToken) {
        await this.pushService.send(
          receiverUser.fcmToken,
          title,
          content,
          { postId: post.id, screen: 'postDetails' },
        );
      }
    }
  }

  // Phương thức đăng ký lắng nghe sự kiện
   subscribe() {
    const redisInstance = RedisClient.getInstance();

    // In ra để xác nhận các tên topic là đúng
    console.log(`[SUBSCRIBE_DEBUG] Đang lắng nghe trên các kênh: ${EvtFollowed}, ${EvtPostLiked}, ${EvtPostCommented}`);

    // --- Lắng nghe sự kiện LIKE ---
    redisInstance.subscribe(EvtPostLiked, async (msg: string) => {
      try {
        console.log(`[SUBSCRIBE_DEBUG] BƯỚC 4: NHẬN được tin nhắn trên kênh ${EvtPostLiked}:`, msg);
        const data = JSON.parse(msg);
        const evt = PostLikedEvent.from(data);
        await this.handlePostLiked(evt);
      } catch (error) {
        console.error(`[SUBSCRIBE_DEBUG] LỖI khi xử lý sự kiện ${EvtPostLiked}:`, error);
      }
    });

    // --- Lắng nghe sự kiện FOLLOW ---
    redisInstance.subscribe(EvtFollowed, async (msg: string) => {
      try {
        console.log(`[SUBSCRIBE_DEBUG] BƯỚC 4: NHẬN được tin nhắn trên kênh ${EvtFollowed}:`, msg);
        const data = JSON.parse(msg);
        const evt = FollowedEvent.from(data);
        await this.handleFollowed(evt);
      } catch (error) {
        console.error(`[SUBSCRIBE_DEBUG] LỖI khi xử lý sự kiện ${EvtFollowed}:`, error);
      }
    });

    // --- Lắng nghe sự kiện COMMENT ---
    redisInstance.subscribe(EvtPostCommented, async (msg: string) => {
      try {
        console.log(`[SUBSCRIBE_DEBUG] BƯỚC 4: NHẬN được tin nhắn trên kênh ${EvtPostCommented}:`, msg);
        const data = JSON.parse(msg);
        const evt = PostCommentedEvent.from(data);
        await this.handlePostCommented(evt);
      } catch (error) {
        console.error(`[SUBSCRIBE_DEBUG] LỖI khi xử lý sự kiện ${EvtPostCommented}:`, error);
      }
    });
  }
}