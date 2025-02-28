import { Inject, Injectable } from "@nestjs/common";
import { AppError, ErrNotFound, IEventPublisher, Paginated, PagingDTO, Requester } from "src/share";
import { v7 } from "uuid";
import { IChatMessageRepository, IChatMessageService } from "../chat-message.port";
import { ChatMessage, ChatMessageCreationDTO, ChatMessageUpdateDTO, ChatMessageCondDTO, ErrChatMessageNotFound, ChatMessageCreationDTOSchema, ErrChatMessageContentInvalid } from "../model";
import { CHAT_MESSAGE_REPOSITORY, CHAT_MESSAGE_SERVICE } from "../chat-message.di-token";
import { chatRoomCreationDTOSchema } from "src/modules/chat-room/chat-room.model";

// Lớp ChatMessageService cung cấp các phương thức xử lý logic liên quan đến tin nhắn chat
@Injectable()
export class ChatMessageService implements IChatMessageService {
    constructor(
        @Inject(CHAT_MESSAGE_REPOSITORY) private readonly chatMessageRepo: IChatMessageRepository,
    ){}

    // Phương thức tạo tin nhắn chat mới
    async create(data: ChatMessageCreationDTO): Promise<string> {
        const chatMessage = ChatMessageCreationDTOSchema.parse(data);

        const newId = v7();
        const chatMessages: ChatMessage = {
            id: newId,
            roomId: chatMessage.roomId,
            senderId: chatMessage.senderId,
            content: chatMessage.content,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.chatMessageRepo.insert(chatMessages);
        return newId;
    }

    // Phương thức lấy thông tin tin
    async get(id: string): Promise<ChatMessage> {
        const chatMessage = await this.chatMessageRepo.findById(id);
        if (!chatMessage) {
            throw AppError.from(ErrChatMessageNotFound, 404);
        }
        return chatMessage
    }

    // Phương thức cập nhật thông tin tin nhắn chat
    async update(id: string, data: ChatMessageUpdateDTO): Promise<void> {
        const chatMessageExist = await this.chatMessageRepo.findById(id);

        if (!chatMessageExist) {
            throw AppError.from(ErrChatMessageNotFound, 404);
        }

        await this.chatMessageRepo.update(id, data);
    }

    async delete(id: string): Promise<void> {
        const chatMessageExist = await this.chatMessageRepo.findById(id);
        if (!chatMessageExist) {
            throw AppError.from(ErrChatMessageNotFound, 404);
        }
        await this.chatMessageRepo.delele(id);
    }

    async list(condition: ChatMessageCondDTO): Promise<ChatMessage[]> {
        const data = await this.chatMessageRepo.list(condition);
        return await this.chatMessageRepo.list(condition);
    }
}