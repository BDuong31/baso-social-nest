import { AppEvent } from "../data-model";

export const EvtCommentLiked = 'CommentLiked';
export const EvtCommentUnliked = 'CommentUnliked';

// Định nghĩa kiểu dữ liệu cho sự kiện CommentLiked
export type CommentLikeUnlikePayload = {
  commentId: string;
};

// Sự kiện: Người dùng đã thích bình luận
export class CommentLikedEvent extends AppEvent<CommentLikeUnlikePayload> {
  // Tạo sự kiện
  static create(payload: CommentLikeUnlikePayload, senderId: string) {
    return new CommentLikedEvent(EvtCommentLiked, payload, { senderId });
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CommentLikedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

// Sự kiện: Người dùng đã bỏ thích bình luận
export class CommentUnlikedEvent extends AppEvent<CommentLikeUnlikePayload> {
  // Tạo sự kiện
  static create(payload: CommentLikeUnlikePayload, senderId: string) {
    return new CommentUnlikedEvent(EvtCommentUnliked, payload, { senderId });
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new CommentUnlikedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}