import { ChatMessageCondDTO } from "../model";

import { Injectable } from "@nestjs/common";
import prisma from "src/share/components/prisma";
import { Paginated, PagingDTO } from "src/share";
import { ChatMessage, ChatMessageUpdateDTO } from "../model";
import { IChatMessageRepository } from "../chat-message.port";

// Lớp ChatMessagePrismaRepository cung cấp các phương thức thao tác với cơ sở dữ liệu tin nhắn chat
@Injectable()
export class ChatMessagePrismaRepository implements IChatMessageRepository {
    async insert(data: ChatMessage): Promise<void> {
        await prisma.chatMessages.create({ data });
    }

    // Phương thức cập nhật thông tin tin nhắn chat
    async update(id: string, data: ChatMessageUpdateDTO): Promise<void> {
        await prisma.chatMessages.update({ where: { id }, data });
    }

    // Phương thức xóa tin nhắn chat
    async delele(id: string): Promise<void> {
        await prisma.chatMessages.delete({ where: { id } });
    }

    // Phương thức lấy thông tin tin nhắn chat theo id
    async findById(id: string): Promise<ChatMessage | null> {
        const chatMessage = await prisma.chatMessages.findUnique({ where: { id } });
        return chatMessage as ChatMessage;
    }

    // Phương thức lấy thông tin tin nhắn chat theo điều kiện
    async findByCond(condition: ChatMessageCondDTO): Promise<ChatMessage | null> {
        const chatMessage = await prisma.chatMessages.findFirst({ where: condition });
        return chatMessage as ChatMessage;
    }

    // Phương thức lấy danh sách tin
    async list(condition: ChatMessageCondDTO, paging: PagingDTO): Promise<Paginated<ChatMessage>> {
        const skip = (paging.page - 1) * paging.limit;

        const total = await prisma.chatMessages.count({
             where:{roomId: condition.roomId}
        });
        const data = await prisma.chatMessages.findMany({
            where: { roomId: condition.roomId },
            take: paging.limit,
            skip,
            orderBy: {
                id: 'desc'
            }
        });

        return {
            data: data as ChatMessage[],
            paging,
            total
        };
    }

    // Phương thức lấy danh sách tin nhắn chat theo id
    async findByIds(ids: string[]): Promise<ChatMessage[]> {
        const chatMessages = await prisma.chatMessages.findMany({ where: { id: { in: ids } } });
        return chatMessages as ChatMessage[];
    }
}