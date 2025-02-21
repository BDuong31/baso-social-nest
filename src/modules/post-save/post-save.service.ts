import { Inject, Injectable } from "@nestjs/common";
import { IPostRpc } from "src/share";
import { AppError } from "src/share/app-error";
import { POST_RPC } from "src/share/di-token";
import { POST_SAVE_REPOSITORY } from "./post-save.di-token";
import { ActionDTO, actionDTOSchema, ErrPostAlreadySaved, ErrPostHasNotSaved, ErrPostNotFound, PostSave } from "./post-save.model";
import { IPostSaveRepository, IPostSaveService } from "./post-save.port";

// Lớp PostSaveService cung cấp các phương thức xử lý logic liên quan đến lưu bài viết
@Injectable()
export class PostSaveService implements IPostSaveService {
  constructor(
    @Inject(POST_SAVE_REPOSITORY) private readonly repository: IPostSaveRepository,
    @Inject(POST_RPC) private readonly postRpc: IPostRpc,
  ) { }

  // Phương thức lưu bài viết
  async save(dto: ActionDTO): Promise<boolean> {

    // Kiểm tra dữ liệu đầu vào
    const data = actionDTOSchema.parse(dto);
    const { postId } = data;

    // Kiểm tra xem đã lưu bài viết chưa
    const existedAction = await this.repository.get(data);

    if (existedAction) {
      throw AppError.from(ErrPostAlreadySaved, 400);
    }

    //  Kiểm tra bài viết tồn tại không
    const existed = await this.postRpc.findById(postId);

    if (!existed) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    // Lưu bài viết
    const newData: PostSave = { ...data, createdAt: new Date() };
    const result = await this.repository.insert(newData);
    return result;
  }

  // Phương thức bỏ lưu bài viết
  async unsave(dto: ActionDTO): Promise<boolean> {

    // Kiểm tra dữ liệu đầu vào
    const data = actionDTOSchema.parse(dto);

    // Kiểm tra xem đã lưu bài viết chưa
    const existedAction = await this.repository.get(data);

    if (!existedAction) {
      throw AppError.from(ErrPostHasNotSaved, 400);
    }

    // Bỏ lưu bài viết
    const result = await this.repository.delete(data);
    return result;
  }
}