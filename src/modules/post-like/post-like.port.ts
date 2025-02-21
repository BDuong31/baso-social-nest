import { Paginated, PagingDTO } from "src/share/data-model";
import { ActionDTO, PostLike } from "./post-like.model";

// Định nghĩa interface cho service và repository của like bài viết
export interface IPostLikeService {
    like(data: ActionDTO): Promise<boolean>; // Like bài viết
    unlike(data: ActionDTO): Promise<boolean>; // Bỏ like bài viết
}

// Định nghĩa interface cho repository của like bài viết
export interface IPostLikeRepository {
    get(data: ActionDTO): Promise<PostLike | null>; // Lấy thông tin like bài viết
    insert(data: PostLike): Promise<void>; // Thêm thông tin like bài viết
    delete(data: ActionDTO): Promise<void>; // Xóa thông tin like bài viết
    list(postId: string, paging: PagingDTO): Promise<Paginated<PostLike>>; // Lấy danh sách like bài viết
    listPostIdsLiked(userId: string, postIds: string[]): Promise<Array<string>>; // Lấy danh sách ID bài viết đã like
}

// Định nghĩa interface cho repository kiểm tra bài viết đã tồn tại
export interface IPostQueryRepository {
    existed(postId: string): Promise<boolean>; // Kiểm tra bài viết đã tồn tại
}