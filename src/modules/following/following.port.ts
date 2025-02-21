import { Paginated, PagingDTO } from "src/share";
import { Follow, FollowCondDTO, FollowDTO, Follower } from "./following.model";

// Interface IFollowingService định nghĩa các phương thức cung cấp dịch vụ theo dõi
export interface IFollowingService {
  follow(follow: FollowDTO): Promise<boolean>; // Theo dõi người dùng
  hasFollowed(followerId: string, followingId: string): Promise<boolean>; // Kiểm tra đã theo dõi chưa
  unfollow(follow: FollowDTO): Promise<boolean>; // Bỏ theo dõi người dùng
  listFollowers(userId: string, paging: PagingDTO): Promise<Paginated<Follower>>; // Lấy danh sách người theo dõi
  listFollowings(userId: string, paging: PagingDTO): Promise<Paginated<Follower>>; // Lấy danh sách người được theo dõi
}

// Interface IFollowingRepository định nghĩa các phương thức tương tác với cơ sở dữ liệu
export interface IFollowingRepository {
  insert(follow: Follow): Promise<boolean>; // Thêm dữ liệu theo dõi mới
  delete(follow: FollowDTO): Promise<boolean>; // Xóa dữ liệu theo dõi
  find(cond: FollowDTO): Promise<Follow | null>; // Lấy thông tin theo dõi

  whoAmIFollowing(meId: string, ids: string[]): Promise<Follow[]>; // Lấy danh sách người theo dõi
  list(cond: FollowCondDTO, paging: PagingDTO): Promise<Paginated<Follow>>; // Lấy danh sách theo dõi
}