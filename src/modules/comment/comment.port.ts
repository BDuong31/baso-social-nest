import { Paginated, PagingDTO } from "src/share/data-model";
import { Requester } from "src/share/interface";
import { Comment, CommentCondDTO, CommentCreateDTO, CommentUpdateDTO } from "./model";

// Interface ICommentService định nghĩa các phương thức cung cấp dịch vụ bình luận
export interface ICommentRepository extends ICommentQueryRepository, ICommentCommandRepository {}

// Interface ICommentQueryRepository định nghĩa các phương thức truy vấn dữ liệu bình luận
export interface ICommentService {
  create(dto: CommentCreateDTO): Promise<string>; // Tạo bình luận mới
  update(id: string, requester: Requester, dto: CommentUpdateDTO): Promise<boolean>; // Cập nhật bình luận
  delete(id: string, requester: Requester): Promise<boolean>; // Xóa bình luận
  findById(id: string): Promise<Comment | null>; // Lấy thông tin bình luận theo id
  list(dto: CommentCondDTO, paging: PagingDTO): Promise<Paginated<Comment>>; // Lấy danh sách bình luận
}

// Interface ICommentCommandRepository định nghĩa các phương thức tương tác với cơ sở dữ liệu
export interface ICommentQueryRepository {
  findById(id: string): Promise<Comment | null>; // Lấy thông tin bình luận theo id
  list(dto: CommentCondDTO, paging: PagingDTO): Promise<Paginated<Comment>>; // Lấy danh sách bình luận
  findByCond(cond: CommentCondDTO): Promise<Comment>; // Lấy thông tin bình luận theo điều kiện
  findByIds(ids: string[], field: string, limit?: number): Promise<Array<Comment>>; // Lấy danh sách bình luận theo id
}

// Interface ICommentCommandRepository định nghĩa các phương thức tương tác với cơ sở dữ liệu
export interface ICommentCommandRepository {
  insert(dto: Comment): Promise<void>;  // Thêm bình luận mới
  update(id: string, dto: CommentUpdateDTO): Promise<void>; // Cập nhật thông tin bình luận
  delete(id: string): Promise<void>;  // Xóa bình luận

  increaseLikeCount(id: string, field: string, step: number): Promise<void>; // Tăng số lượt like
  decreaseLikeCount(id: string, field: string, step: number): Promise<void>;  // Giảm số lượt like
}