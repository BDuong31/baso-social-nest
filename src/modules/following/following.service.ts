import { Inject, Injectable } from "@nestjs/common";
import { AppError, ErrNotFound, IAuthorRpc, IEventPublisher, Paginated, PagingDTO, pagingDTOSchema } from "src/share";
import { EVENT_PUBLISHER, USER_RPC } from "src/share/di-token";
import { FollowedEvent, UnfollowedEvent } from "src/share/event";
import { FOLLOWING_REPOSITORY } from "./following.di-token";
import { ErrAlreadyFollowed, ErrFollowNotFound, ErrFollowYourself, Follow, FollowDTO, followDTOSchema, Follower } from "./following.model";
import { IFollowingRepository, IFollowingService } from "./following.port";

// Lớp FollowingService cung cấp các phương thức xử lý logic liên quan đến theo dõi người dùng
@Injectable()
export class FollowingService implements IFollowingService {
  constructor(
    @Inject(FOLLOWING_REPOSITORY) private readonly repository: IFollowingRepository,
    @Inject(USER_RPC) private readonly userRpc: IAuthorRpc,
    @Inject(EVENT_PUBLISHER) private readonly eventBus: IEventPublisher
  ) { }

  // Phương thức kiểm tra xem người dùng đã theo dõi người khác chưa
  async hasFollowed(followerId: string, followingId: string): Promise<boolean> {
    try {
      const existing = await this.repository.find({ followerId, followingId });
      return existing !== null;
    } catch (e) {
      return false;
    }
  }

  // Phương thức theo dõi người dùng
  async follow(follow: FollowDTO): Promise<boolean> {
    
    // Kiểm tra dữ liệu đầu vào
    const data = followDTOSchema.parse(follow);
    if (data.followerId === data.followingId) {
      throw AppError.from(ErrFollowYourself, 400);
    }

    // Kiểm tra người dùng theo dõi có tồn tại không
    const following = await this.userRpc.findById(data.followingId);
    if (!following) {
      throw ErrNotFound;
    }

    const followerCount = following.followerCount + 1;
    const dtos = {
      followerCount: followerCount,
    };

    const updateFollowing = await this.userRpc.updateAuthorRpc(data.followingId, dtos);

    if (!updateFollowing) {
      throw ErrNotFound;
    }

    // Kiểm tra người dùng đã theo dõi người khác chưa
    const existing = await this.repository.find(data);
    if (existing) {
      throw AppError.from(ErrAlreadyFollowed, 400);
    }

    // Tạo mới dữ liệu theo dõi
    const model: Follow = {
      ...data,
      createdAt: new Date()
    };

    const ok = await this.repository.insert(model);

    console.log(`🚀🚀🚀 [FOLLOWING-SERVICE] Chuẩn bị PHÁT sự kiện FollowedEvent.`);

    // Gửi sự kiện người dùng được theo dõi
    this.eventBus.publish(FollowedEvent.create({ followingId: data.followingId }, data.followerId));

    return ok;
  }

  // Phương thức hủy theo dõi người
  async unfollow(follow: FollowDTO): Promise<boolean> {
    const data = followDTOSchema.parse(follow);

    const existing = await this.repository.find(data);
    if (!existing) {
      throw AppError.from(ErrFollowNotFound, 404);
    }

    const ok = await this.repository.delete(existing);

    // Gửi sự kiện người dùng bị hủy theo dõi
    this.eventBus.publish(UnfollowedEvent.create({ followingId: data.followingId }, data.followerId));

    return ok;
  }

  // Phương thức lấy danh sách người theo dõi
  async listFollowers(userId: string, paging: PagingDTO): Promise<Paginated<Follower>> {
    paging = pagingDTOSchema.parse(paging);
    const result = await this.repository.list({ followingId: userId }, paging);

    if (!result.data.length) {
      return {
        data: [],
        paging,
        total: 0
      };
    }

    // map public user
    const followerIds = result.data.map((f) => f.followerId);
    const followDataMap = new Map<string, Follow>();
    result.data.forEach((f) => followDataMap.set(f.followerId, f));

    const users = await this.userRpc.findByIds(followerIds);
    const userMap = new Map<string, Follower>();
    users.forEach((user) => userMap.set(user.id, {
      ...user,
      followedAt: followDataMap.get(user.id)!.createdAt,
      hasFollowedBack: false
    }));

    // Kiểm tra xem người dùng đã theo dõi lại người khác chưa
    const hasFollowedData = await this.repository.whoAmIFollowing(userId, followerIds);
    hasFollowedData.forEach((f) => {
      const follower = userMap.get(f.followingId);
      if (follower) {
        follower.hasFollowedBack = true;
      }
    });

    const followers = result.data.map((item) => userMap.get(item.followerId)!);

    return {
      data: followers,
      paging,
      total: result.total
    };
  }

  // Phương thức lấy danh sách người đang theo dõi
  async listFollowings(userId: string, paging: PagingDTO): Promise<Paginated<Follower>> {
    const result = await this.repository.list({ followerId: userId }, paging);

    if (!result.data.length) {
      return {
        data: [],
        paging,
        total: 0
      };
    }

    // map public user
    const followingIds = result.data.map((f) => f.followingId);
    const followDataMap = new Map<string, Follow>();
    result.data.forEach((f) => followDataMap.set(f.followingId, f));

    const users = await this.userRpc.findByIds(followingIds);
    const userMap = new Map<string, Follower>();
    users.forEach((user) => userMap.set(user.id, {
      ...user,
      followedAt: followDataMap.get(user.id)!.createdAt,
      hasFollowedBack: true
    }));


    const followings = result.data.map((item) => userMap.get(item.followingId)!);

    return {
      data: followings,
      paging,
      total: result.total
    };
  }
}