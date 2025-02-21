import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { paginatedResponse, PagingDTO, pagingDTOSchema, PublicUser } from "src/share";
import { USER_RPC } from "src/share/di-token";
import { RemoteAuthGuard } from "src/share/guard";
import { IAuthorRpc, ReqWithRequester } from "src/share/interface";
import { COMMENT_LIKE_REPOSITORY, COMMENT_LIKE_SERVICE } from "./comment-like.di-token";
import { ICmtLikeRepository, ICmtLikeService } from "./comment-like.port";

// Lớp CmtLikeHttpController cung cấp các API liên quan đến like bình luận
@Controller('/v1/comments')
export class CmtLikeHttpController {
    constructor(
        @Inject(COMMENT_LIKE_SERVICE) private readonly usecase: ICmtLikeService,
        @Inject(COMMENT_LIKE_REPOSITORY) private readonly repo: ICmtLikeRepository,
        @Inject(USER_RPC) private readonly userRepo: IAuthorRpc
    ) {}

    // API like bình luận
    @Post(':id/like')
    @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
    @HttpCode(HttpStatus.OK)
    async like(@Param('id') commentId: string, @Request() req: ReqWithRequester){
        const { sub } = req.requester;
        const data = await this.usecase.like({ commentId, userId: sub });
        return { data };
    }

    // API bỏ like bình luận
    @Delete(':id/unlike')
    @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
    @HttpCode(HttpStatus.OK)
    async unlike(@Param('id') commentId: string, @Request() req: ReqWithRequester){
        const { sub } = req.requester;
        const data = await this.usecase.unlike({ commentId, userId: sub });
        return { data };
    }

    // API lấy danh sách người đã like bình luận
    @Get(':id/liked-users')
    @HttpCode(HttpStatus.OK)
    async getLikes(@Param('id') commentId: string, @Query() paging: PagingDTO){
        const pagingData = pagingDTOSchema.parse(paging);

        const result = await this.repo.list(commentId, pagingData);

        const userIds = result.data.map((item) => item.userId);
        const users = await this.userRepo.findByIds(userIds);
        
        const userMap: Record<string, PublicUser> = {};
        users.map((user)=>{
            userMap[user.id] = user;
        })

        const finalResult = result.data.map((item)=>{
            const user = userMap[item.userId];
            return { user, likeAt: item.createdAt };
        })

        return paginatedResponse({...result, data: finalResult}, {})
    }
}

// Lớp CmtLikeRpcController cung cấp các phương thức tương tác với comment service
@Controller('/v1/rpc')
export class CmtLikeRpcController {
    constructor(
        @Inject(COMMENT_LIKE_REPOSITORY) private readonly repo: ICmtLikeRepository,
    ) {}

    // Phương thức kiểm tra đã like bình luận chưa
    @Post('has-liked')
    @HttpCode(HttpStatus.OK)
    async hasLiked(@Body() req: { userId: string, commentId: string}){
        try {
            const result = await this.repo.get(req);
            return { data: result !== null };
        } catch(e){
            return { data: false };
        }
    }

    // Phương thức lấy danh sách bình luận đã like
    @Post('list-comment-ids-liked')
    @HttpCode(HttpStatus.OK)
    async listPostIdsLiked(@Body() req: { userId: string, commentIds: string[] }){
        const data = await this.repo.listPostIdsLiked(req.userId, req.commentIds);
        return { data };
    }
}