import { Injectable } from "@nestjs/common";
import { Paginated, PagingDTO } from "src/share";
import prisma from "src/share/components/prisma";
import { Follow, FollowCondDTO, FollowDTO } from "./following.model";
import { IFollowingRepository } from "./following.port";

// Lớp FollowingRepository cung cấp các phương thức tương tác với cơ sở dữ liệu
@Injectable()
export class FollowingRepository implements IFollowingRepository {
    
    // Phương thức thêm dữ liệu theo dõi mới
    async insert(follow: Follow): Promise<boolean> {
        await prisma.follower.create({ data: follow });

        return true;
    }

    // Phương thức xóa dữ liệu theo dõi
    async delete(follow: FollowDTO): Promise<boolean> {
        await prisma.follower.delete({ 
            where: {
                followingId_followerId: {
                    followerId: follow.followerId,
                    followingId: follow.followingId
                }
            }
        });

        return true;
    }

    // Phương thức lấy thông tin theo dõi
    async find(cond: FollowDTO): Promise<Follow | null>{
        const result = await prisma.follower.findFirst({ where: cond });

        return result;
    }

    // Phương thức lấy danh sách theo dõi
    async whoAmIFollowing(followingId: string, ids: string[]): Promise<Follow[]> {
        const result = await prisma.follower.findMany({
          where: {
            followingId: {
              in: ids
            },
            followerId: followingId
          }
        });
    
        return result;
    }

    // Phương thức lấy danh sách người theo dõi
    async list(cond: FollowCondDTO, paging: PagingDTO): Promise<Paginated<Follow>> {
        const count = await prisma.follower.count({ where: cond });

        const skip = (paging.page - 1) * paging.limit;
        const  result = await prisma.follower.findMany({
            where: cond,
            take: paging.limit,
            skip,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            total: count,
            paging,
            data: result
        };
    }
}