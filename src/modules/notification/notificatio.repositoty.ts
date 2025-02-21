import { Injectable } from "@nestjs/common";
import { PagingDTO } from "src/share";
import prisma from "src/share/components/prisma";
import { Notification, NotificationAction, NotificationCondition, NotificationUpdateDTO } from "./notification.model";
import { INotificationRepository, NotiPaginated } from "./notification.port";

// Lớp NotificationRepository cung cấp các phương thức tương tác với cơ sở dữ liệu
@Injectable()
export class NotificationRepository implements INotificationRepository {
  
  // Phương thức thêm thông báo mới
  async insert(data: Notification): Promise<boolean> {
    await prisma.notification.create({ data });
    return true;
  }

  // Phương thức cập nhật thông tin thông báo
  async update(id: string, dto: NotificationUpdateDTO): Promise<boolean> {
    await prisma.notification.update({ where: { id }, data: dto });
    return true;
  }

  // Phương thức lấy thông tin thông báo theo id
  async get(id: string): Promise<Notification | null> {
    const noti = await prisma.notification.findUnique({ where: { id } });
    if (!noti) return null;

    return {
      ...noti,
      actorId: noti.actorId ?? "",
      content: noti.content ?? "",
      action: noti.action as NotificationAction,
      isSent: noti.isSent ?? false,
      isRead: noti.isRead ?? false,
    };
  }

  // Phương thức lấy danh sách thông báo theo điều kiện
  async list(cond: NotificationCondition, paging: PagingDTO): Promise<NotiPaginated> {
    const offset = (paging.page - 1) * paging.limit;
    const count = await prisma.notification.count({ where: cond });

    const unreadCount = await prisma.notification.count({ where: { ...cond, isRead: false } });

    const result = await prisma.notification.findMany({ where: cond, orderBy: { id: "desc" }, skip: offset, take: paging.limit });

    return {
      data: result.map(noti => ({
        ...noti,
        actorId: noti.actorId ?? "",
        content: noti.content ?? "",
        action: noti.action as NotificationAction,
        isSent: noti.isSent ?? false,
        isRead: noti.isRead ?? false,
      })),
      paging,
      total: count,
      unreadCount: unreadCount,
    };
  }

  // Phương thức đọc tất cả thông báo
  async readAll(receiverId: string): Promise<boolean> {
    await prisma.notification.updateMany({ where: { receiverId }, data: { isRead: true } });
    return true;
  }
}
