import { Injectable } from "@nestjs/common";
import axios from "axios";
import prisma from "src/share/components/prisma";
import { Paginated, PagingDTO } from "src/share/data-model";
import { ActionDTO, PostLike } from "./post-like.model";
import { IPostLikeRepository, IPostQueryRepository } from "./post-like.port";

// Lớp PostLikeRepository cung cấp các phương thức thao tác với Database sử dụng Prisma
@Injectable()
export class PostLikeRepository implements IPostLikeRepository {
    
    // Lấy thông tin like bài viết
    async get(data: ActionDTO): Promise<PostLike | null> {
        const result = await prisma.postLike.findFirst({ where: data });
        if (!result) {
            return null;
        }

        return result;
    }

    // Thêm thông tin like bài viết
    async insert(data: PostLike): Promise<void>{
        await prisma.postLike.create({ data });
    }

    // Xóa thông tin like bài viết
    async delete(data: ActionDTO): Promise<void> {
        await prisma.postLike.delete({
            where: {
                postId_userId: {
                    postId: data.postId,
                    userId: data.userId
                }
            }
        });
    }

    // Lấy danh sách like bài viết
    async list(postId: string, paging: PagingDTO): Promise<Paginated<PostLike>> {
        const total = await prisma.postLike.count({ where: { postId } });

        const skip = (paging.page - 1) * paging.limit;

        const items = await prisma.postLike.findMany({
            where: { postId },
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

    // Lấy danh sách ID bài viết đã
    async listPostIdsLiked(userId: string, postIds: string[]): Promise<Array<string>> {
        const result = await prisma.postLike.findMany({ where: { userId, postId: { in: postIds } } });
        return result.map((item) => item.postId);
    }
}

// Lớp PostQueryRPC cung cấp các phương thức thực hiện truy vấn thông tin bài viết từ service Post
@Injectable()
export class PostQueryRPC implements IPostQueryRepository {
    constructor(private readonly postServiceUrl: string) { }
  
    // Kiểm tra bài viết đã tồn tại chưa
    async existed(postId: string): Promise<boolean> {
      try {
        const { status } = await axios.get(`${this.postServiceUrl}/posts/${postId}`);
        return status === 200;
      } catch (error) {
        return false;
      }
    }
  }