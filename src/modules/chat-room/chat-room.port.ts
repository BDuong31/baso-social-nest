import { PagingDTO } from "src/share/data-model";
import { Paginated } from "src/share/data-model";
import { ChatRoom, ChatRoomCondDTO, ChatRoomCreationDTO, ChatRoomUpdateDTO } from "./chat-room.model";

// Interface IChatRoomService định nghĩa các phương thức xử lý logic liên quan đến phòng chat
export interface IChatRoomService {
    create(data: ChatRoomCreationDTO): Promise<string>; // Phương thức tạo phòng chat mới
    get(id: string): Promise<ChatRoom>; // Phương thức lấy thông tin phòng chat
    update(id: string, data: ChatRoomUpdateDTO): Promise<void>; // Phương thức cập nhật thông tin phòng chat
    delete(id: string): Promise<void>; // Phương thức xóa phòng chat
    list(userId: string): Promise<ChatRoom[]>; // Phương thức lấy danh sách phòng chat
}

// Interface IChatRoomRepository định nghĩa các phương thức cần thiết để thao tác với cơ sở dữ liệu
export interface IChatRoomRepository extends IChatRoomCommandRepository, IChatRoomQueryRepository {}

// Interface IChatRoomCommandRepository định nghĩa các phương thức thêm, cập nhật, xóa phòng chat
export interface IChatRoomCommandRepository {
    insert(data: ChatRoom): Promise<void>; // Phương thức thêm phòng chat mới
    update(id: string, data: ChatRoomUpdateDTO): Promise<void>; // Phương thức cập nhật thông tin phòng chat
    delele(id: string): Promise<void>; // Phương thức xóa phòng chat
}

// Interface IChatRoomQueryRepository định nghĩa các phương thức lấy thông tin phòng chat
export interface IChatRoomQueryRepository {
    findById(id: string): Promise<ChatRoom | null>; // Phương thức lấy thông tin phòng chat theo id
    findByCond(condition: ChatRoomCondDTO): Promise<ChatRoom | null>; // Phương thức lấy thông tin phòng chat theo điều kiện
    list(userId: string): Promise<ChatRoom[]>; // Phương thức lấy danh sách phòng chat
    findByIds(ids: string[]): Promise<ChatRoom[]>; // Phương thức lấy danh sách phòng chat theo id
}
