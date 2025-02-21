import { Paginated, Topic } from "src/share/data-model";

import { PagingDTO } from 'src/share/data-model';
import { ActionDTO, PostSave } from './post-save.model';

// Định nghĩa interface cho service và repository của lưu bài viết
export interface IPostSaveService {
  save(dto: ActionDTO): Promise<boolean>; // Lưu bài viết
  unsave(dto: ActionDTO): Promise<boolean>; //  Bỏ lưu bài viết
}

// Định nghĩa interface cho repository của lưu bài viết
export interface IPostSaveRepository {
  get(data: ActionDTO): Promise<PostSave | null>;  // Lấy thông tin lưu bài viết
  insert(data: PostSave): Promise<boolean>;  // Thêm thông tin lưu bài viết
  delete(data: ActionDTO): Promise<boolean>; // Xóa thông tin lưu bài viết
  list(userId: string, paging: PagingDTO): Promise<Paginated<PostSave>>; // Lấy danh sách bài viết đã lưu
  listPostIdsSaved(userId: string, postIds: string[]): Promise<string[]>; // Lấy danh sách ID bài viết đã lưu
}

// Định nghĩa interface cho repository thực hiện các thao tác thêm, sửa, xóa
export interface ITopicQueryRPC {
  findByIds(ids: string[]): Promise<Array<Topic>>; // Lấy danh sách chủ đề theo ID
}
