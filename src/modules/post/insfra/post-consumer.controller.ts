import { Controller, Inject } from "@nestjs/common";
import { RedisClient } from "src/share/components";
import { EvtPostCommentDeleted, EvtPostCommented, EvtPostLiked, EvtPostUnliked, PostCommentDeletedEvent, PostCommentedEvent, PostLikedEvent, PostUnlikedEvent } from "src/share/event";
import { POST_REPOSITORY } from "../post.di-token";
import { IPostRepository } from "../post.port";

// Lớp PostConsumerController lắng nghe các sự kiện liên quan đến bài viết và cập nhật dữ liệu
@Controller()
export class PostConsumerController {
  constructor(
    @Inject(POST_REPOSITORY) private readonly repo: IPostRepository,
  ) {
    this.subscribe();
  }

  // Xử lý sự kiện người dùng đã thích bài viết
  async handlePostLiked(evt: PostLikedEvent) {
    this.repo.increaseCount(evt.payload.postId, "likedCount", 1);
  }

  // Xử lý sự kiện người dùng đã bỏ thích bài viết
  async handlePostUnliked(evt: PostUnlikedEvent) {
    this.repo.decreaseCount(evt.payload.postId, "likedCount", 1);
  }

  // Xử lý sự kiện người dùng đã bình luận bài viết
  async handlePostComment(evt: PostCommentedEvent) {
    this.repo.increaseCount(evt.payload.postId, "commentCount", 1);
  }

  // Xử lý sự kiện người dùng đã xóa bình luận
  async handlePostUncomment(evt: PostCommentDeletedEvent) {
    this.repo.decreaseCount(evt.payload.postId, "commentCount", 1);
  }

  // Phương thức đăng ký lắng nghe sự kiện
  subscribe() {

    // Đăng ký lắng nghe sự kiện người dùng đã thích bài viết
    RedisClient.getInstance().subscribe(EvtPostLiked, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostLikedEvent.from(data);
      this.handlePostLiked(evt);
    });

    // Đăng ký lắng nghe sự kiện người dùng đã bỏ thích bài viết
    RedisClient.getInstance().subscribe(EvtPostUnliked, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostUnlikedEvent.from(data);
      this.handlePostUnliked(evt);
    });

    // Đăng ký lắng nghe sự kiện người dùng đã bình luận bài viết
    RedisClient.getInstance().subscribe(EvtPostCommented, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostCommentedEvent.from(data);
      this.handlePostComment(evt);
    });

    // Đăng ký lắng nghe sự kiện người dùng đã xóa bình luận
    RedisClient.getInstance().subscribe(EvtPostCommentDeleted, (msg: string) => {
      const data = JSON.parse(msg);
      const evt = PostCommentDeletedEvent.from(data);
      this.handlePostUncomment(evt);
    });
  }
}