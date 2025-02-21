import e from "express";
import { v7 } from "uuid";
import z from "zod";

// Các trạng thái cơ bản
export enum BaseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  BANNED = 'banned',
  DELETED = 'deleted',
}

// Các kiểu tải bài lên
export enum PostType {
  TEXT = 'text',
  MEDIA = 'media',
}

// Schema của người dùng
export const publicUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().min(10),
  email: z.string().email(),
  avatar: z.string().url(),
});

// Kiểu dữ liệu của người dùng công khai
export interface PublicUser extends z.infer<typeof publicUserSchema> {}

// Schema của phân trang
export const pagingDTOSchema = z.object({
  page: z.coerce.number().min(1, { message: 'Page number must be at least 1' }).default(1),
  limit: z.coerce.number().min(1, { message: 'Limit must be at least 1' }).max(100).default(20),
  sort: z.string().optional(),
  order: z.string().optional(),
});

// Kiểu dữ liệu của phân trang
export interface PagingDTO extends z.infer<typeof pagingDTOSchema> { total?: number; }

// Kiểu dữ liệu phân trang
export type Paginated<E> = {
  data: E[];
  paging: PagingDTO,
  total: number;
};

// lời nhắn PubSub
export class PubSubMessage {
  public readonly ID: string;
  public readonly SenderID?: string;
  public readonly Topic: string;
  public readonly Payload: Record<string, any>;
  public readonly CreatedAt: Date;
  constructor(senderID: string | undefined, topic: string, payload: Record<string, any>) {
    ; (this.ID = v7()), (this.SenderID = senderID), (this.Topic = topic), (this.Payload = payload);
    this.CreatedAt = new Date();
  }
}

// Schema của chủ đề
export const topicSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  postCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu của chủ đề
export interface Topic extends z.infer<typeof topicSchema> {}

// Schema của bài viết
export const postSchema = z.object({
  id: z.string().uuid(),
  authorId: z.string().uuid(),
  author: publicUserSchema,
  content: z.string().min(1),
  image: z.string().url().optional(),
  topicId: z.string().uuid(),
  topic: topicSchema,
  isFeatured: z.boolean().default(false),
  commentCount: z.number().int().nonnegative().default(0),
  likedCount: z.number().int().nonnegative().default(0),
  type: z.nativeEnum(PostType),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

//
export interface Post extends z.infer<typeof postSchema> {}


// Ghi chú Baso: Dành cho kiến ​​trúc hướng sự kiện
// Tất cả các sự kiện nên kế thừa lớp này
export abstract class AppEvent<Payload> {
  private _id: string; // 
  private _occurredAt: Date;
  private _senderId?: string;

  constructor(
    private readonly _eventName: string,
    private readonly _payload: Payload,
    dtoProps?: {
      id?: string,
      occurredAt?: Date,
      senderId?: string;
    }
  ) {
    this._id = dtoProps?.id ?? v7();
    this._occurredAt = dtoProps?.occurredAt ?? new Date();
    this._senderId = dtoProps?.senderId;
  }

  // Lấy tên sự kiện
  get eventName(): string {
    return this._eventName;
  }

  // Lấy id sự kiện
  get id(): string {
    return this._id;
  }

  // Lấy thời gian xảy ra sự kiện
  get occurredAt(): Date {
    return this._occurredAt;
  }

  // Lấy id người gửi
  get senderId(): string | undefined {
    return this._senderId;
  }

  // Lấy dữ liệu sự kiện
  get payload(): Payload {
    return this._payload;
  }

  // Chuyển đổi sự kiện thành đối tượng bình thường
  plainObject() {
    return {
      id: this._id,
      occurredAt: this._occurredAt,
      senderId: this._senderId,
      eventName: this._eventName,
      payload: this._payload,
    };
  }
}