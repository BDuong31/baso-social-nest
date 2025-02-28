import { ChatRoomCondDTO } from "./chat-room.model";

import { Injectable } from "@nestjs/common";
import prisma from "src/share/components/prisma";
import { Paginated, PagingDTO } from "src/share";
import { ChatRoom, ChatRoomUpdateDTO } from "./chat-room.model";
import { IChatRoomRepository } from "./chat-room.port";

// Lớp ChatRoomPrismaRepository cài đặt các phương thức thao tác với cơ sở dữ liệu bằng Prisma
@Injectable()
export class ChatRoomPrismaRepository implements IChatRoomRepository {

    // Phương thức thêm phòng chat mới
    async insert(data: ChatRoom): Promise<void> {
        await prisma.chatRoom.create({ data });
    }   

    // Phương thức cập nhật thông tin phòng chat
    async update(id: string, data: ChatRoomUpdateDTO): Promise<void> {
        await prisma.chatRoom.update({ where: { id }, data });
    }
    
    // Phương thức xóa phòng chat
    async delele(id: string): Promise<void> {
        await prisma.chatRoom.delete({ where: { id } });
    }

    // Phương thức lấy thông tin phòng chat theo id
    async findById(id: string): Promise<ChatRoom | null> {
        const chatRoom = await prisma.chatRoom.findUnique({ where: { id } });
        return chatRoom as ChatRoom;
    }

    // Phương thức lấy thông tin phòng chat theo điều kiện
    async findByCond(condition: ChatRoomCondDTO): Promise<ChatRoom | null> {
        const chatRoom = await prisma.chatRoom.findFirst({ where: condition });
        return chatRoom as ChatRoom;
    }

    //
    async list(userId: string): Promise<ChatRoom[]> {
        console.log('condition', userId);
        const data = await prisma.chatRoom.findMany({
            where: {
                OR: [
                    { creatorId: userId},
                    { receiverId: userId }
                ]
            },
        });

        return data as ChatRoom[];
    }

    // Phương thức lấy danh sách phòng chat theo id
    async findByIds(ids: string[]): Promise<ChatRoom[]> {
        const chatRooms = await prisma.chatRoom.findMany({ where: { id: { in: ids } } });
        return chatRooms as ChatRoom[];
    }
}