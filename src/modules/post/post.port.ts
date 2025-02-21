import { Paginated, PagingDTO } from "src/share/data-model";
import { Requester } from "src/share/interface";
import { Topic } from "../topic/topic.model";
import { CreatePostDTO, Post, PostCondDTO, UpdatePostDTO } from "./model";

// Định nghĩa các phương thức mà PostService cần phải cung cấp
export interface IPostService {
  create(dto: CreatePostDTO): Promise<string>; // Tạo bài viết mới
  update(id: string, dto: UpdatePostDTO, requester: Requester): Promise<boolean>; // Cập nhật bài viết
  delete(id: string, requester: Requester): Promise<boolean>; // Xóa bài viết
}

// Định nghĩa các phương thức mà PostRepository cần phải cung cấp
export interface IPostRepository extends IPostQueryRepository, IPostCommandRepository { }

// Định nghĩa interface cho repository kiểm tra bài viết đã tồn tại
export interface IPostQueryRepository {
  get(id: string): Promise<Post | null>; // Lấy thông tin bài viết theo id
  list(cond: PostCondDTO, paging: PagingDTO): Promise<Paginated<Post>>; // Lấy danh sách bài viết theo điều kiện
  listByIds(ids: string[]): Promise<Post[]>; // Lấy danh sách bài viết theo id
}

// Định nghĩa interface cho repository thao tác với bài viết
export interface IPostCommandRepository {
  insert(dto: Post): Promise<void>; // Thêm bài viết mới
  update(id: string, dto: UpdatePostDTO): Promise<void>; // Cập nhật thông tin bài viết
  delete(id: string): Promise<void>; // Xóa bài viết
  increaseCount(id: string, field: string, step: number): Promise<void>; // Tăng giá trị trường
  decreaseCount(id: string, field: string, step: number): Promise<void>; // Giảm giá trị trường
}

// Định nghĩa interface cho repository kiểm tra chủ đề
export interface ITopicQueryRPC {
  findById(id: string): Promise<Topic | null>; // Lấy thông tin chủ đề theo id
  findByIds(ids: string[]): Promise<Array<Topic>>; // Lấy danh sách chủ đề theo id
}

// Định nghĩa interface cho repository kiểm tra bài viết đã tồn tại
export interface IPostLikedRPC {
  hasLikedId(userId: string, postId: string): Promise<boolean>; // Kiểm tra bài viết đã được like
  listPostIdsLiked(userId: string, postIds: string[]): Promise<Array<string>>; // Lấy danh sách ID bài viết đã like
}

// Định nghĩa interface cho repository kiểm tra bài viết đã tồn tại
export interface IPostSavedRPC {
  hasSavedId(userId: string, postId: string): Promise<boolean>; // Kiểm tra bài viết đã được lưu
  listPostIdsSaved(userId: string, postIds: string[]): Promise<Array<string>>; // Lấy danh sách ID bài viết đã lưu
}
