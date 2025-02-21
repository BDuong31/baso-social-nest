import { Injectable } from "@nestjs/common";
import { Post as PrismaPost } from "@prisma/client";
import prisma from "src/share/components/prisma";
import { Paginated, PagingDTO } from "src/share/data-model";
import { Post, PostCondDTO, Type, UpdatePostDTO } from "../model";
import { IPostRepository } from "../post.port";

// Lớp PostPrismaRepository cung cấp các phương thức thao tác với Database sử dụng Prisma
@Injectable()
export class PostPrismaRepository implements IPostRepository {
  
  // Lấy thông tin bài viết theo id
  async get(id: string): Promise<Post | null> {
    const result = await prisma.post.findFirst({ where: { id } });

    if (!result) return null;

    return this._toModel(result);
  }

  // Lấy danh sách bài viết theo điều kiện
  async list(cond: PostCondDTO, paging: PagingDTO): Promise<Paginated<Post>> {
    const { str, userId, ...rest } = cond; // Lấy ra userId và các điều kiện còn lại

    // Tạo điều kiện where
    let where = {
      ...rest
    };

    // Nếu có userId thì thêm điều kiện authorId
    if (userId) {
      where = {
        ...where,
        authorId: userId
      } as PostCondDTO;
    }

    // Nếu có str thì thêm điều kiện content
    if (str) {
      where = {
        ...where,
        content: { contains: str },
      } as PostCondDTO;
    }

    const total = await prisma.post.count({ where });

    const skip = (paging.page - 1) * paging.limit;

    const result = await prisma.post.findMany({
      where,
      take: paging.limit,
      skip,
      orderBy: {
        id: 'desc'
      }
    });

    return {
      data: result.map(this._toModel),
      paging,
      total
    };
  };

  // Thêm bài viết mới
  async insert(data: Post): Promise<void> {
    await prisma.post.create({ data });
  }

  // Cập nhật thông tin bài viết
  async update(id: string, dto: UpdatePostDTO): Promise<void> {
    await prisma.post.update({ where: { id }, data: dto });
  }

  // Xóa bài viết
  async delete(id: string): Promise<void> {
    await prisma.post.delete({ where: { id } });
  }

  // Lấy danh sách bài viết theo id
  async listByIds(ids: string[]): Promise<Post[]> {
    const result = await prisma.post.findMany({ where: { id: { in: ids } } });
    return result.map(this._toModel);
  }

  // Tăng giá trị trường
  async increaseCount(id: string, field: string, step: number): Promise<void> {
    await prisma.post.update({ where: { id }, data: { [field]: { increment: step } } });
  }

  // Giảm giá trị trường
  async decreaseCount(id: string, field: string, step: number): Promise<void> {
    await prisma.post.update({ where: { id }, data: { [field]: { decrement: step } } });
  }

  // Chuyển đổi dữ liệu từ PrismaPost sang Post
  private _toModel(data: PrismaPost): Post {
    return {
      ...data,
      image: data.image ?? '',
      isFeatured: data.isFeatured ?? false,
      commentCount: data.commentCount ?? 0,
      likedCount: data.likedCount ?? 0,
      type: data.type as Type,
    } as Post;
  }
}
