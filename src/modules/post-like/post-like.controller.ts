import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { paginatedResponse, PagingDTO, pagingDTOSchema, PublicUser } from "src/share";
import { USER_RPC } from "src/share/di-token";
import { RemoteAuthGuard } from "src/share/guard";
import { IAuthorRpc, ReqWithRequester } from "src/share/interface";
import { POST_LIKE_REPOSITORY, POST_LIKE_SERVICE } from "./post-like.di-token";
import { IPostLikeRepository, IPostLikeService } from "./post-like.port";

// Lớp PostLikeHttpController cung cấp các phương thức xử lý request HTTP liên quan đến like bài viết
@Controller('/v1/posts')
export class PostLikeHttpController {
    constructor(
        @Inject(POST_LIKE_SERVICE) private readonly usecase: IPostLikeService,
        @Inject(POST_LIKE_REPOSITORY) private readonly repo: IPostLikeRepository,
        @Inject(USER_RPC) private readonly userRepo: IAuthorRpc
    ) {}

    // Phương thức like bài viết
    @Post(':id/like')
    @UseGuards(RemoteAuthGuard) // Sử dụng guard để xác thực token
    @HttpCode(HttpStatus.OK)
    async like(@Param('id') postId: string, @Request() req: ReqWithRequester){
        const { sub } = req.requester;
        const data = await this.usecase.like({ postId, userId: sub });
        return { data };
    }

    // Phương thức bỏ like bài viết
    @Delete(':id/unlike')
    @UseGuards(RemoteAuthGuard) // Sử dụng guard để xác thực token
    @HttpCode(HttpStatus.OK)
    async unlike(@Param('id') postId: string, @Request() req: ReqWithRequester){
        const { sub } = req.requester;
        const data = await this.usecase.unlike({ postId, userId: sub });
        return { data };
    }

    // Phương thức lấy danh sách người dùng đã like bài viết
    @Get(':id/liked-users')
    @HttpCode(HttpStatus.OK)
    async getLikes(@Param('id') postId: string, @Query() paging: PagingDTO){
        const pagingData = pagingDTOSchema.parse(paging);

        const result = await this.repo.list(postId, pagingData);

        const userIds = result.data.map((item) => item.userId);
        const users = await this.userRepo.findByIds(userIds);
        
        // Tạo map user
        const userMap: Record<string, PublicUser> = {};
        users.map((user)=>{
            userMap[user.id] = user;
        })

        // Tạo kết quả cuối cùng
        const finalResult = result.data.map((item)=>{
            const user = userMap[item.userId];
            return { user, likeAt: item.createdAt };
        })

        return paginatedResponse({...result, data: finalResult}, {})
    }
}

// Lớp PostLikeRpcController cung cấp các phương thức xử lý request RPC liên quan đến like bài viết
@Controller('/v1/rpc')
export class PostLikeRpcController {
    constructor(
        @Inject(POST_LIKE_REPOSITORY) private readonly repo: IPostLikeRepository,
    ) {}

    // Phương thức kiểm tra người dùng đã like bài viết chưa
    @Post('has-liked')
    @HttpCode(HttpStatus.OK)
    async hasLiked(@Body() req: { userId: string, postId: string}){
        try {
            const result = await this.repo.get(req);
            return { data: result !== null };
        } catch(e){
            return { data: false };
        }
    }

    // Phương thức lấy danh sách ID bài viết đã like
    @Post('list-post-ids-liked')
    @HttpCode(HttpStatus.OK)
    async listPostIdsLiked(@Body() req: { userId: string, postIds: string[] }){
        const data = await this.repo.listPostIdsLiked(req.userId, req.postIds);
        return { data };
    }
}