import { Controller, Delete, Get, HttpCode, Inject, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequester } from "src/share";
import { RemoteAuthGuard } from "src/share/guard";
import { FOLLOWING_SERVICE } from "./following.di-token";
import { IFollowingService } from "./following.port";

// Lớp FollowingController cung cấp các API liên quan đến theo dõi người dùng
@Controller()
export class FollowingController {
    constructor(@Inject(FOLLOWING_SERVICE) private readonly service: IFollowingService) { }

    // API kiểm tra xem người dùng đã theo dõi người khác chưa
    @Get('/v1/users/:id/has-followed')
    @UseGuards(RemoteAuthGuard)  // Sử dụng guard RemoteAuthGuard để xác thực người dùng
    @HttpCode(200)
    async hasFollowed(@Request() req: ReqWithRequester, @Param('id') followingId: string) {
        const { sub } = req.requester;
        const result = await this.service.hasFollowed(sub, followingId);
        return { data: result };
    }

    // API theo dõi người dùng
    @Post('/v1/users/:id/follow')
    @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
    @HttpCode(200)
    async follow(@Request() req: ReqWithRequester, @Param('id') followingId: string) {
        const { sub } = req.requester;

        const dto = { followerId: sub, followingId };

        const result = await this.service.follow(dto);
        return { data: result };
    }

    // API bỏ theo dõi người dùng
    @Delete('/v1/users/:id/unfollow') 
    @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
    @HttpCode(200)
    async unfollow(@Request() req: ReqWithRequester, @Param('id') followingId: string) {
        const { sub } = req.requester;

        const dto = { followerId: sub, followingId };

        const result = await this.service.unfollow(dto);
        return { data: result };
    }

    // API lấy danh sách người theo dõi
    @Get('/v1/users/:id/followers')
    @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
    @HttpCode(200)
    async listFollowers(@Request() req: ReqWithRequester, @Param('id') followingId: string, @Query() paging: PagingDTO) {
        const pagingData = pagingDTOSchema.parse(paging);
        const result = await this.service.listFollowers(followingId, pagingData);

        return paginatedResponse(result, {});
    }

    // API lấy danh sách người được theo dõi
    @Get('/v1/users/:id/followings')
    @UseGuards(RemoteAuthGuard) // Sử dụng guard RemoteAuthGuard để xác thực người dùng
    @HttpCode(200)
    async listFollowings(@Request() req: ReqWithRequester, @Param('id') followerId: string, @Query() paging: PagingDTO) {
        const pagingData = pagingDTOSchema.parse(paging);
        const result = await this.service.listFollowings(followerId, pagingData);

        return paginatedResponse(result, {});
    }
}