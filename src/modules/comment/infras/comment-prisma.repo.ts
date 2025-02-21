import { Injectable } from "@nestjs/common";
import { Comment as CommentPrisma } from "@prisma/client";
import { ErrNotFound } from "src/share/app-error";
import prisma from "src/share/components/prisma";
import { Paginated, PagingDTO } from "src/share/data-model";
import { ICommentRepository } from "../comment.port";
import { Comment, CommentCondDTO, CommentStatus, CommentUpdateDTO } from "../model";

// Lớp CommentPrismaRepository cung cấp các phương thức tương tác với cơ sở dữ liệu bình luận
@Injectable()
export class CommentPrismaRepository implements ICommentRepository {
  
  // Lấy thông tin bình luận theo id
  async findById(id: string): Promise<Comment | null> {
    const comment = await prisma.comment.findFirst({ where: { id } });
    if (!comment) return null;

    return this._toComment(comment);
  }

  // Lấy thông tin bình luận theo điều kiện
  async findByCond(cond: CommentCondDTO): Promise<Comment> {
    const conditions: Record<string, any> = {};
    if (cond.postId) {
      conditions.postId = cond.postId;
    }
    if (cond.parentId) {
      conditions.parentId = cond.parentId;
    }

    const comment = await prisma.comment.findFirst({ where: conditions });
    if (!comment) throw ErrNotFound;

    return this._toComment(comment);
  }

  // Lấy danh sách bình luận theo id
  async findByIds(ids: string[], field: string, limit?: number): Promise<Array<Comment>> {
    const sql = ids
      .map((id) => `(SELECT * FROM comments WHERE ${field} = '${id}' ORDER BY id ASC LIMIT ${limit})`)
      .join(' UNION ');
    const replies = await prisma.$queryRawUnsafe<any[]>(sql);
    return replies.map((item) => ({
      id: item.id,
      userId: item.user_id,
      postId: item.post_id,
      parentId: item.parent_id,
      content: item.content,
      likedCount: item.liked_count,
      replyCount: item.reply_count,
      status: item.status as CommentStatus,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  }

  // Lấy danh sách bình luận
  async list(dto: CommentCondDTO, paging: PagingDTO): Promise<Paginated<Comment>> {
    const conditions: Record<string, any> = {};
    if (dto.postId) {
      conditions.postId = dto.postId;
    }
    if (dto.parentId) {
      conditions.parentId = dto.parentId;
    } else {
      conditions.parentId = null;
    }

    const total = await prisma.comment.count({
      where: { ...conditions, status: { not: CommentStatus.DELETED } }
    });

    const skip = (paging.page - 1) * paging.limit;

    const result = await prisma.comment.findMany({
      where: conditions,
      take: paging.limit,
      skip,
      orderBy: {
        id: 'asc'
      }
    });

    return {
      data: result.map((item) => this._toComment(item)),
      paging: paging,
      total
    };
  }

  // Thêm bình luận mới
  async insert(dto: Comment): Promise<void> {
    const data: CommentPrisma = {
      ...dto,
      parentId: dto.parentId || null
    };

    await prisma.comment.create({ data });
  }

  // Cập nhật thông tin bình luận
  async update(id: string, dto: CommentUpdateDTO): Promise<void> {
    await prisma.comment.update({
      where: { id },
      data: { content: dto.content, updatedAt: new Date() }
    });
  }

  // Xóa bình luận
  async delete(id: string): Promise<void> {
    await prisma.comment.delete({ where: { id } });
  }

  // Tăng số lượt like
  async increaseLikeCount(id: string, field: string, step: number): Promise<void> {
    await prisma.comment.update({
      where: { id },
      data: { [field]: { increment: step } }
    });
  }

  // Giảm số lượt like
  async decreaseLikeCount(id: string, field: string, step: number): Promise<void> {
    await prisma.comment.update({
      where: { id },
      data: { [field]: { decrement: step } }
    });
  }

  // Chuyển đổi dữ liệu từ Prisma sang
  private _toComment(data: CommentPrisma): Comment {
    return { ...data, status: data.status as CommentStatus, updatedAt: data.updatedAt! } as Comment;
  }
}
