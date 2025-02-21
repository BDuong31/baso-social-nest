import { Paginated, PagingDTO, Requester } from "src/share";
import { Notification, NotificationCondition, NotificationCreateDTO, NotificationUpdateDTO } from "./notification.model";

// Định nghĩa các phương thức mà NotificationService cần phải cung cấp
export type NotiPaginated = Paginated<Notification> & {
  unreadCount: number;
};

// Định nghĩa các phương thức mà NotificationService cần phải cung cấp
export interface INotificationService {
  create(dto: NotificationCreateDTO): Promise<string>; // Tạo thông báo mới
  list(cond: NotificationCondition, paging: PagingDTO): Promise<Paginated<Notification>>; // Lấy danh sách thông báo
  read(id: string, requester: Requester): Promise<boolean>; // Đọc thông báo
  readAll(requester: Requester): Promise<boolean>; // Đọc tất cả thông báo
}

// Định nghĩa các phương thức mà NotificationRepository cần phải cung cấp
export interface INotificationRepository {
  insert(data: Notification): Promise<boolean>; // Thêm thông báo mới
  update(id: string, dto: NotificationUpdateDTO): Promise<boolean>; // Cập nhật thông tin thông báo
  get(id: string): Promise<Notification | null>; // Lấy thông tin thông báo theo id
  list(cond: NotificationCondition, paging: PagingDTO): Promise<NotiPaginated>; // Lấy danh sách thông báo theo điều kiện
  readAll(receiverId: string): Promise<boolean>; // Đọc tất cả thông báo
}