import { Injectable } from "@nestjs/common";
import prisma from "src/share/components/prisma";
import { Paginated, PagingDTO, Topic, topicSchema } from "src/share/data-model";
import { ActionDTO } from "../post-like/post-like.model";
import { PostSave } from "./post-save.model";
import { IPostSaveRepository } from "./post-save.port";

// Lớp PostSaveRepository cung cấp các phương thức thao tác với Database sử dụng Prisma
@Injectable()
export class PostSaveRepository implements IPostSaveRepository {
  
  // Lấy thông tin lưu bài viết
  async get(data: ActionDTO): Promise<PostSave | null> {
    
    // Tìm thông tin lưu bài viết
    const result = await prisma.postSave.findFirst({ where: data });

    if (!result) return null;

    return {
      userId: result.userId,
      postId: result.postId,
      createdAt: result.createdAt
    };
  }

  // Thêm thông tin lưu bài viết
  async insert(data: PostSave): Promise<boolean> {

    // Tạo dữ liệu lưu bài viết
    const persistenceData: PostSave = {
      userId: data.userId,
      postId: data.postId,
      createdAt: data.createdAt,
    };

    // Thêm thông tin lưu bài viết vào Database
    await prisma.postSave.create({ data: persistenceData });

    return true;
  }

  // Xóa thông tin lưu bài viết
  async delete(data: ActionDTO): Promise<boolean> {
    
    // Xóa thông tin lưu bài viết
    await prisma.postSave.delete({
      where: {
        postId_userId: {
          postId: data.postId,
          userId: data.userId
        }
      }
    });

    return true;
  }

  // Lấy danh sách bài viết đã lưu
  async list(userId: string, paging: PagingDTO): Promise<Paginated<PostSave>> {
    const condition = { userId };

    const total = await prisma.postSave.count({ where: condition });

    const skip = (paging.page - 1) * paging.limit;

    const result = await prisma.postSave.findMany({
      where: condition,
      take: paging.limit,
      skip,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      data: result,
      paging: paging,
      total
    };
  }

  // Lấy danh sách ID bài viết đã lưu
  async listPostIdsSaved(userId: string, postIds: string[]): Promise<string[]> {
    const result = await prisma.postSave.findMany({ where: { userId, postId: { in: postIds } } });

    return result.map((item) => item.postId);
  }

}
