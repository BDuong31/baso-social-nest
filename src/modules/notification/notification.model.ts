import { PublicUser } from "src/share";
import z from "zod";

// Các hành động thông báo
export enum NotificationAction {
  LIKED = 'liked',
  FOLLOWED = 'followed',
  REPLIED = 'replied',
}

// Schema cho thông báo
export const notificationSchema = z.object({
  id: z.string().uuid(),
  receiverId: z.string().uuid(),
  actorId: z.string().uuid(),
  content: z.string(),
  action: z.nativeEnum(NotificationAction),
  isSent: z.boolean().default(false),
  isRead: z.boolean().default(false),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
});

// Kiểu dữ liệu cho thông báo
export type Notification = z.infer<typeof notificationSchema> & { sender?: PublicUser; };

// Schema cho thông báo mới
export const notificationCreateDTOSchema = notificationSchema.pick({
  receiverId: true,
  actorId: true,
  content: true,
  action: true,
}).required();

// Kiểu dữ liệu cho thông báo mới
export type NotificationCreateDTO = z.infer<typeof notificationCreateDTOSchema>;

// Schema cho thông báo cập nhật
export const notificationUpdateDTOSchema = notificationSchema.pick({
  isSent: true,
  isRead: true,
}).partial();

// Kiểu dữ liệu cho thông báo cập nhật
export type NotificationUpdateDTO = z.infer<typeof notificationUpdateDTOSchema>;

// Schema cho điều kiện lọc thông báo
export const notificationCondSchema = notificationSchema.pick({
  receiverId: true,
  action: true,
}).partial();

// Kiểu dữ liệu cho điều kiện lọc thông báo
export type NotificationCondition = z.infer<typeof notificationCondSchema>;