import { PublicUser } from "src/share/data-model";
import z from "zod";
import { ChatMessage } from "../chat-message/model";

// Lỗi thông tin
export const ErrChatRoomNotFound = new Error("Chat room not found");
export const ErrChatRoomCreatorInvalid = new Error("Chat room creator is invalid");
export const ErrChatRoomReceiverInvalid = new Error("Chat room receiver is invalid");
export const ErrChatRoomTypeInvalid = new Error("Chat room type is invalid");
export const ErrChatRoomStatusInvalid = new Error("Chat room status is invalid");

// Kiểu dữ liệu cho loại phòng chat
export enum ChatRoomType {
  DIRCET = 'direct',
  GROUP = 'group'
}

// Kiểu dữ liệu cho trạng thái phòng chat
export enum ChatRoomStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    DELETED = 'deleted'
}

// Schema cho dữ liệu phòng chat
export const chatRoomSchema = z.object({
    id: z.string().uuid(),
    creatorId: z.string().uuid(),
    receiverId: z.string().uuid(),
    type: z.nativeEnum(ChatRoomType).default(ChatRoomType.DIRCET),
    status: z.nativeEnum(ChatRoomStatus).default(ChatRoomStatus.ACTIVE),
    createdAt: z.date().default(new Date()),
    updatedAt: z.date().default(new Date()),
    deletedAt: z.date().nullable(),
  });

// Kiểu dữ liệu cho dữ liệu phòng chat
export type ChatRoom = z.infer<typeof chatRoomSchema> & { messager?: PublicUser, messages?: ChatMessage };

// Schema cho dữ liệu tạo phòng chat
export const chatRoomCreationDTOSchema = chatRoomSchema.pick({
    creatorId: true,
    receiverId: true,
    type: true,
  });

// Kiểu dữ liệu cho dữ liệu tạo phòng chat
export type ChatRoomCreationDTO = z.infer<typeof chatRoomCreationDTOSchema>;

// Schema cho dữ liệu cập nhật phòng chat
export const chatRoomUpdateDTOSchema = chatRoomSchema.pick({
    status: true,
  }).partial();

// Kiểu dữ liệu cho dữ liệu cập nhật phòng chat
export type ChatRoomUpdateDTO = z.infer<typeof chatRoomUpdateDTOSchema>;

// Schema cho điều kiện tìm kiếm phòng chat
export const chatRoomCondDTOSchema = chatRoomSchema.pick({
    creatorId: true,
    receiverId: true,
  }).partial();

// Kiểu dữ liệu cho điều kiện tìm kiếm phòng chat
export type ChatRoomCondDTO = z.infer<typeof chatRoomCondDTOSchema>;
