import { Injectable } from "@nestjs/common";
import axios from "axios";
import prisma from "src/share/components/prisma";
import { Paginated, PagingDTO } from "src/share/data-model";
import { ActionDTO, CommentLike } from "./comment-like.model";
import { ICmtLikeRepository, ICmtLikeQueryRepository } from "./comment-like.port";

// Lớp CmtLikeRepository cung cấp các phương thức tương tác với cơ sở dữ liệu
@Injectable()
export class CmtLikeRepository implements ICmtLikeRepository {

    // Phương thức lấy thông tin like bình luận
    async get(data: ActionDTO): Promise<CommentLike | null> {
        const result = await prisma.commentLikes.findFirst({ where: data });
        if (!result) {
            return null;
        }

        return result;
    }

    // Phương thức thêm dữ liệu like bình luận mới
    async insert(data: CommentLike): Promise<boolean> {
        await prisma.commentLikes.create({ data });
        return true;
    }

    //
    async delete(data: ActionDTO): Promise<boolean> {
        await prisma.commentLikes.delete({
            where: {
                commentId_userId: {
                    commentId: data.commentId,
                    userId: data.userId
                }
            }
        });
        return true;
    }

    // Phương thức lấy danh sách like bình luận
    async list(commentId: string, paging: PagingDTO): Promise<Paginated<CommentLike>> {
        const total = await prisma.commentLikes.count({ where: { commentId } });

        const skip = (paging.page - 1) * paging.limit;

        const items = await prisma.commentLikes.findMany({
            where: { commentId },
            take: paging.limit,
            skip,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            data: items,
            paging,
            total
        }
    }

    // Phương thức lấy danh sách like bình luận theo người dùng
    async listPostIdsLiked(userId: string, commentIds: string[]): Promise<Array<string>> {
        const result = await prisma.commentLikes.findMany({ where: { userId, commentId: { in: commentIds } } });
        return result.map((item) => item.commentId);
    }
}

// Lớp CmtQueryRPC cung cấp các phương thức tương tác với comment service
@Injectable()
export class CmtQueryRPC implements ICmtLikeQueryRepository {
    constructor(private readonly commentServiceUrl: string) { }
  
    // Phương thức kiểm tra bình luận đã tồn tại chưa
    async existed(commentId: string): Promise<boolean> {
      try {
        const { status } = await axios.get(`${this.commentServiceUrl}/comments/${commentId}`);
        return status === 200;
      } catch (error) {
        return false;
      }
    }
  }