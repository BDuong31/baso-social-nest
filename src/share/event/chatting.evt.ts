import e from "express";
import { AppEvent } from "../data-model";

export const EvtChatMessageSent = 'ChatMessageSent';

// Định nghĩa kiểu dữ liệu cho sự kiện ChatMessageSent
export interface ChatMessageSentPayload {
    roomId: string;
    content: string;
  }

  // Sự kiện: Người dùng đã gửi tin nhắn trong phòng chat
  export class ChatMessageSentEvent extends AppEvent<ChatMessageSentPayload> {
    
    // Tạo sự kiện
    static create(payload: ChatMessageSentPayload, senderId: string) {
      return new ChatMessageSentEvent(EvtChatMessageSent, payload, { senderId });
    }

    // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
    static from(json: any) {
      const { eventName, payload, id, occurredAt, senderId } = json;
      return new ChatMessageSentEvent(eventName, payload, { id, occurredAt, senderId });
    }
  }