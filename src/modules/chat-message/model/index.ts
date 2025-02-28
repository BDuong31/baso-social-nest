import z from "zod";

// Lỗi thông tin
export const ErrChatMessageNotFound = new Error("Chat message not found");
export const ErrChatMessageSenderInvalid = new Error("Chat message sender is invalid");
export const ErrChatMessageContentInvalid = new Error("Chat message content is invalid");

// Schema cho dữ liệu tin nhắn chat
export const chatMessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

//  Kiểu dữ liệu cho dữ liệu tin nhắn chat
export type ChatMessage = z.infer<typeof chatMessageSchema>;

// Schema cho dữ liệu tạo tin nhắn chat
export const ChatMessageCreationDTOSchema = z.object({
  roomId: z.string(),
  senderId: z.string(),
  content: z.string(),
});

//  Kiểu dữ liệu cho dữ liệu tạo tin nhắn chat
export type ChatMessageCreationDTO = z.infer<typeof ChatMessageCreationDTOSchema>;

// Schema cho dữ liệu cập nhật tin nhắn chat
export const ChatMessageUpdateDTOSchema = z.object({
  content: z.string(),
}).partial();

//  Kiểu dữ liệu cho dữ liệu cập nhật tin nhắn chat
export type ChatMessageUpdateDTO = z.infer<typeof ChatMessageUpdateDTOSchema>;

// Schema cho điều kiện lọc tin nhắn chat
export const ChatMessageCondDTOSchema = z.object({
  roomId: z.string(),
}).partial();

export type ChatMessageCondDTO = z.infer<typeof ChatMessageCondDTOSchema>;

