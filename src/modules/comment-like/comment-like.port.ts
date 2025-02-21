import { Paginated, PagingDTO } from "src/share/data-model";
import { ActionDTO, CommentLike } from "./comment-like.model";

// Interface ICmtLikeService định nghĩa các phương thức cung cấp dịch vụ like bình luận
export interface ICmtLikeService {
    like(data: ActionDTO): Promise<boolean>; // Like bình luận
    unlike(data: ActionDTO): Promise<boolean>; // Bỏ like bình luận
}

// Interface ICmtLikeRepository định nghĩa các phương thức tương tác với cơ sở dữ liệu
export interface ICmtLikeRepository {
    get(data: ActionDTO): Promise<CommentLike | null>; // Lấy thông tin like bình luận
    insert(data: CommentLike): Promise<boolean>; // Thêm dữ liệu like bình luận mới
    delete(data: ActionDTO): Promise<boolean>; // Xóa dữ liệu like bình luận
    list(commentId: string, paging: PagingDTO): Promise<Paginated<CommentLike>>; // Lấy danh sách like bình luận
    listPostIdsLiked(userId: string, commentIds: string[]): Promise<Array<string>>; // Lấy danh sách like bình luận theo người dùng
}

// Interface ICmtLikeQueryRepository định nghĩa các phương thức truy vấn dữ liệu like bình luận
export interface ICmtLikeQueryRepository {
    existed(commentId: string): Promise<boolean>; // Kiểm tra đã like bình luận chưa
}