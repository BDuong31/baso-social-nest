import { PagingDTO } from "src/share/data-model";

import { Paginated } from "src/share/data-model";
import { Topic, TopicCondDTO, TopicCreationDTO, TopicUpdateDTO } from "./topic.model";

// Định nghĩa interface cho service và repository của chủ đề
export interface ITopicService {
  create(data: TopicCreationDTO): Promise<string>; // Tạo chủ đề mới
  get(id: string): Promise<Topic>; // Lấy thông tin chủ đề theo ID
  update(id: string, data: TopicUpdateDTO): Promise<void>; // Cập nhật thông tin chủ đề
  delete(id: string): Promise<void>; // Xóa chủ đề
  list(condition: TopicCondDTO, paging: PagingDTO): Promise<Paginated<Topic>>; // Lấy danh sách chủ đề
}

// Định nghĩa interface cho repository của chủ đề
export interface ITopicRepository extends ITopicCommandRepository, ITopicQueryRepository {}

// Định nghĩa interface cho repository thực hiện các thao tác thêm, sửa, xóa
export interface ITopicCommandRepository {
  insert(data: Topic): Promise<void>; // Thêm chủ đề mới
  update(id: string, data: TopicUpdateDTO): Promise<void>; // Cập nhật thông tin chủ đề
  delete(id: string): Promise<void>; // Xóa chủ đề
  increaseTopicCount(id: string, field: string, step: number): Promise<void>; // Tăng số lượng chủ đề
  decreaseTopicCount(id: string, field: string, step: number): Promise<void>; // Giảm số lượng chủ đề
}

// Định nghĩa interface cho repository thực hiện các thao tác truy vấn
export interface ITopicQueryRepository {
  findById(id: string): Promise<Topic | null>; // Lấy thông tin chủ đề theo ID
  findByCond(condition: TopicCondDTO): Promise<Topic | null>; // Lấy thông tin chủ đề theo điều kiện
  list(condition: TopicCondDTO, paging: PagingDTO): Promise<Paginated<Topic>>; // Lấy danh sách chủ đề
  findByIds(ids: string[]): Promise<Topic[]>; // Lấy danh sách chủ đề theo ID
}