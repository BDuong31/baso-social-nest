import { AppEvent } from "../data-model";

export const EvtPostLiked = 'PostLiked';
export const EvtPostUnliked = 'PostUnliked';
export const EvtPostCommented = 'PostCommented';
export const EvtPostCommentDeleted = 'PostCommentDeleted';
export const EvtPostCreated = 'PostCreated';
export const EvtPostDeleted = 'PostDeleted';

// Định nghĩa các sự kiện liên quan đến bài viết
export type PostEventPayload = {
  postId: string;
  topicId?: string;
  authorIdOfParentComment?: string | null; // Sự kiện đã trả lời bình luận
};

// Payload: Dữ liệu đi kèm của sự kiện
export class PostEvent<T extends PostEventPayload> extends AppEvent<T> {
  protected constructor(
    eventName: string,
    payload: T,
    options: { id?: string; occurredAt?: Date; senderId: string; }
  ) {
    super(eventName, payload, options);
  }

  // Options: Thông tin thêm của sự kiện
  protected static createEvent<T extends PostEventPayload>(
    eventName: string,
    payload: T,
    senderId: string
  ): PostEvent<T> {
    return new PostEvent(eventName, payload, { senderId });
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  protected static fromJson<T extends PostEventPayload>(json: any): PostEvent<T> {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new PostEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

// Sự kiện: Người dùng đã thích bài viết
export class PostLikedEvent extends PostEvent<PostEventPayload> {
  
  // Tạo sự kiện
  static create(payload: PostEventPayload, senderId: string): PostLikedEvent {
    return PostEvent.createEvent(EvtPostLiked, payload, senderId) as PostLikedEvent;
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any): PostLikedEvent {
    return PostEvent.fromJson<PostEventPayload>(json) as PostLikedEvent;
  }
}

// Sự kiện: Người dùng đã bỏ thích bài viết
export class PostUnlikedEvent extends PostEvent<PostEventPayload> {
  
  // Tạo sự kiện
  static create(payload: PostEventPayload, senderId: string): PostUnlikedEvent {
    return PostEvent.createEvent(EvtPostUnliked, payload, senderId) as PostUnlikedEvent;
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any): PostUnlikedEvent {
    return PostEvent.fromJson<PostEventPayload>(json) as PostUnlikedEvent;
  }
}

// Sự kiện: Người dùng đã bình luận bài viết
export class PostCommentedEvent extends PostEvent<PostEventPayload> {
  
  // Tạo sự kiện
  static create(payload: PostEventPayload, senderId: string): PostCommentedEvent {
    return PostEvent.createEvent(EvtPostCommented, payload, senderId) as PostCommentedEvent;
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any): PostCommentedEvent {
    return PostEvent.fromJson<PostEventPayload>(json) as PostCommentedEvent;
  }
}

// Sự kiện: Người dùng đã xóa bình luận
export class PostCommentDeletedEvent extends PostEvent<PostEventPayload> {
  // Tạo sự kiện
  static create(payload: PostEventPayload, senderId: string): PostCommentDeletedEvent {
    return PostEvent.createEvent(EvtPostCommentDeleted, payload, senderId) as PostCommentDeletedEvent;
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any): PostCommentDeletedEvent {
    return PostEvent.fromJson<PostEventPayload>(json) as PostCommentDeletedEvent;
  }
}

// Sự kiện: Người dùng đã tạo bài viết
export class PostCreatedEvent extends AppEvent<PostEventPayload> {
  // Tạo sự kiện
  static create(payload: PostEventPayload, senderId: string) {
    return new PostCreatedEvent(EvtPostCreated, payload, { senderId });
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new PostCreatedEvent(eventName, payload, { id, occurredAt, senderId });
  }
};

// Sự kiện: Người dùng đã xóa bài viết
export class PostDeletedEvent extends AppEvent<PostEventPayload> {
  // Tạo sự kiện
  static create(payload: PostEventPayload, senderId: string) {
    return new PostDeletedEvent(EvtPostDeleted, payload, { senderId });
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new PostDeletedEvent(eventName, payload, { id, occurredAt, senderId });
  }
};
