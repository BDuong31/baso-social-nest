import { Inject, Injectable } from '@nestjs/common';
import { AppError, ErrNotFound, IEventPublisher, Paginated, PagingDTO, Requester } from "src/share";
import { v7 } from 'uuid';
import { IChatRoomRepository, IChatRoomService } from './chat-room.port';
import { ChatRoom, ChatRoomCreationDTO, ChatRoomUpdateDTO, ChatRoomCondDTO, ChatRoomStatus, ChatRoomType, chatRoomCreationDTOSchema, ErrChatRoomCreatorInvalid, ErrChatRoomNotFound, chatRoomCondDTOSchema } from './chat-room.model';
import { CHAT_ROOM_REPOSITORY, CHAT_ROOM_SERVICE } from './chat-room.di-token';

// Lớp ChatRoomService cung cấp các phương thức xử lý logic liên quan đến phòng chat
@Injectable()
export class ChatRoomService implements IChatRoomService {
  constructor(
    @Inject(CHAT_ROOM_REPOSITORY) private readonly chatRoomRepo: IChatRoomRepository,
  ) {}

  // Phương thức tạo phòng chat mới
  async create(dto: ChatRoomCreationDTO): Promise<string> {
    const data = chatRoomCreationDTOSchema.parse(dto);

    const chatRoomExist = await this.chatRoomRepo.findByCond({ creatorId: data.creatorId, receiverId: data.receiverId });
    
    if (chatRoomExist) {
      throw AppError.from(ErrChatRoomCreatorInvalid, 400); // Thêm chi tiết thông báo lỗi
    }

    const newId = v7();
    const chatRoom: ChatRoom = {
      id: newId,  
      creatorId: data.creatorId,
      receiverId: data.receiverId,
      type: data.type, 
      status: ChatRoomStatus.ACTIVE, 
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    // Lưu phòng chat vào cơ sở dữ liệu
    await this.chatRoomRepo.insert(chatRoom);

    return newId;
  }

  // Phương thức lấy thông tin phòng chat
  async get(id: string): Promise<ChatRoom> {
    const chatRoom = await this.chatRoomRepo.findById(id);
    if (!chatRoom) {
      throw AppError.from(ErrNotFound, 404); // Thêm chi tiết thông báo lỗi
    }

    return chatRoom;
  }

  // Phương thức cập nhật thông tin phòng chat
  async update(id: string, dto: ChatRoomUpdateDTO): Promise<void> {
      const chatRoomExist = await this.chatRoomRepo.findById(id);

        if (!chatRoomExist) {
            throw AppError.from(ErrChatRoomNotFound, 404); // Thêm chi tiết thông báo lỗi
        }
        await this.chatRoomRepo.update(id, dto);
  }

// Phương thức xóa phòng chat
async delete(id: string): Promise<void> {
    const chatRoomExist = await this.chatRoomRepo.findById(id);
    if (!chatRoomExist) {
      throw AppError.from(ErrChatRoomNotFound, 404);
    }
    await this.chatRoomRepo.delele(id);
}

// Phương thức lấy danh sách phòng chat
  async list(userId: string): Promise<ChatRoom[]> {
    console.log('condition', userId);
    //const dto = chatRoomCondDTOSchema.parse(userId);
    return await this.chatRoomRepo.list(userId);
  }
}