import { Inject, Injectable } from "@nestjs/common";
import { ErrForbidden, ErrNotFound, IPublicUserRpc, Paginated, PagingDTO, PublicUser, Requester } from "src/share";
import { USER_RPC } from "src/share/di-token";
import { v7 } from "uuid";
import { NOTI_REPOSITORY } from "./notification.di-token";
import { Notification, NotificationCondition, notificationCondSchema, NotificationCreateDTO, notificationCreateDTOSchema } from "./notification.model";
import { INotificationRepository, INotificationService } from "./notification.port";

// Lớp NotificationService cung cấp các phương thức xử lý logic liên quan đến thông báo
@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    @Inject(NOTI_REPOSITORY) private readonly repository: INotificationRepository,
    @Inject(USER_RPC) private readonly userPublicUseRPC: IPublicUserRpc,
  ) { }

  // Phương thức tạo thông báo mới
  async create(dto: NotificationCreateDTO): Promise<string> {
    const data = notificationCreateDTOSchema.parse(dto);
    const newId = v7();

    const newData: Notification = {
      ...data,
      id: newId,
      isSent: false,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.repository.insert(newData);
    return newId;
  }

  // Phương thức đọc thông báo
  async read(id: string, requester: Requester): Promise<boolean> {
    const receiverId = requester.sub;

    const noti = await this.repository.get(id);

    if (!noti) throw ErrNotFound;
    if (noti.receiverId !== receiverId) throw ErrForbidden;

    await this.repository.update(id, { isRead: true });
    return true;
  }

  // Phương thức đọc tất cả thông báo
  async readAll(requester: Requester): Promise<boolean> {
    const receiverId = requester.sub;
    await this.repository.readAll(receiverId);
    return true;
  }

  // Phương thức lấy danh sách thông báo
  async list(cond: NotificationCondition, paging: PagingDTO): Promise<Paginated<Notification>> {
    const condition = notificationCondSchema.parse(cond);

    const result = await this.repository.list(condition, paging);

    const userIds = result.data.map(noti => noti.actorId);
    const users = await this.userPublicUseRPC.findByIds(userIds);

    const userMap = new Map<string, PublicUser>();
    users.forEach(user => userMap.set(user.id, user));

    result.data.forEach(noti => { noti.sender = userMap.get(noti.actorId); });

    return result;
  }
}