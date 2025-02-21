import { PagingDTO } from "src/share/data-model";
import { Paginated } from "src/share/data-model";
import { ChatMessage, ChatMessageCondDTO, ChatMessageCreationDTO, ChatMessageUpdateDTO } from "./model";

// Interface IChatMessageService định nghĩa các phương thức xử lý logic liên quan đến tin nhắn chat
export interface IChatMessageService {
    create(data: ChatMessageCreationDTO): Promise<string>; // Phương thức tạo tin nhắn chat mới
    get(id: string): Promise<ChatMessage>; // Phương thức lấy thông tin tin nhắn chat
    update(id: string, data: ChatMessageUpdateDTO): Promise<void>; // Phương thức cập nhật thông tin tin nhắn chat
    delete(id: string): Promise<void>; // Phương thức xóa tin nhắn chat
    list(condition: ChatMessageCondDTO, paging: PagingDTO): Promise<Paginated<ChatMessage>>; // Phương thức lấy danh sách tin nhắn chat
}

// Interface IChatMessageRepository định nghĩa các phương thức cần thiết để thao tác với cơ sở dữ liệu
export interface IChatMessageRepository extends IChatMessageCommandRepository, IChatMessageQueryRepository {}

// Interface IChatMessageCommandRepository định nghĩa các phương thức thêm, cập nhật, xóa tin nhắn chat
export interface IChatMessageCommandRepository { 
    insert(data: ChatMessage): Promise<void>; // Phương thức thêm tin nhắn chat mới
    update(id: string, data: ChatMessageUpdateDTO): Promise<void>; // Phương thức cập nhật thông tin tin nhắn chat
    delele(id: string): Promise<void>; // Phương thức xóa tin nhắn chat
}

// Interface IChatMessageQueryRepository định nghĩa các phương thức lấy thông tin tin nhắn chat
export interface IChatMessageQueryRepository {
    findById(id: string): Promise<ChatMessage | null>; // Phương thức lấy thông tin tin nhắn chat theo id
    findByCond(condition: ChatMessageCondDTO): Promise<ChatMessage | null>; // Phương thức lấy thông tin tin nhắn chat theo điều kiện
    list(condition: ChatMessageCondDTO, paging: PagingDTO): Promise<Paginated<ChatMessage>>; // Phương thức lấy danh sách tin nhắn chat
    findByIds(ids: string[]): Promise<ChatMessage[]>; // Phương thức lấy danh sách tin nhắn chat theo id
}