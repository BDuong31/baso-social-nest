import { Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { IPostRpc, IPublicUserRpc, paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester } from "src/share";
import { RedisClient } from "src/share/components";
import { POST_RPC, USER_RPC } from "src/share/di-token";
import { EvtFollowed, EvtPostCommented, EvtPostLiked, FollowedEvent, PostCommentedEvent, PostLikedEvent } from "src/share/event";
import { RemoteAuthGuard } from "src/share/guard";
import { NOTI_SERVICE } from "./notification.di-token";
import { NotificationAction, NotificationCreateDTO } from "./notification.model";
import { INotificationService } from "./notification.port";

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
  ) {
    this.subscribe();
  }

  // Xử lý sự kiện người dùng đã thích bài viết
  async handlePostLiked(evt: PostLikedEvent) {
    const { postId } = evt.payload;
    const actorId = evt.senderId!;

    const post = await this.postRPC.findById(postId);
    if (!post) { return; }

    if (actorId === post.authorId) return;

    const actor = await this.userPublicUseRPC.findById(actorId);
    if (!actor) { return; }

    const dto: NotificationCreateDTO = {
      receiverId: post.authorId,
      actorId,
      content: `${actor.firstName} ${actor.lastName} liked your post`,
      action: NotificationAction.LIKED,
    };

    await this.useCase.create(dto);
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
  };

  // Xử lý sự kiện người dùng đã bình luận bài viết
  async handlePostCommented(evt: PostCommentedEvent) {
    const { postId, authorIdOfParentComment } = evt.payload;
    const actorId = evt.senderId!;

    if (!authorIdOfParentComment) return; // do nothing if it's not a replied comment

    const actor = await this.userPublicUseRPC.findById(actorId);
    if (!actor) { return; }

    if (actorId === authorIdOfParentComment) return;

    const dto: NotificationCreateDTO = {
      receiverId: authorIdOfParentComment,
      actorId,
      content: `${actor.firstName} ${actor.lastName} replied to your comment`,
      action: NotificationAction.REPLIED,
    };

    await this.useCase.create(dto);
  }

  // Phương thức đăng ký lắng nghe sự kiện
  subscribe() {

    // Đăng ký lắng nghe sự kiện người dùng đã theo dõi
    RedisClient.getInstance().subscribe(EvtFollowed, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = FollowedEvent.from(data);
      this.handleFollowed(evt);
    });

    // Đăng ký lắng nghe sự kiện người dùng đã thích bài viết
    RedisClient.getInstance().subscribe(EvtPostLiked, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostLikedEvent.from(data);
      this.handlePostLiked(evt);
    });

    // Đăng ký lắng nghe sự kiện người dùng đã bình luận bài viết
    RedisClient.getInstance().subscribe(EvtPostCommented, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostCommentedEvent.from(data);
      this.handlePostCommented(evt);
    });
  }
}