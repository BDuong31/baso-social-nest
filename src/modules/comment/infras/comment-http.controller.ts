import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { paginatedResponse, pagingDTOSchema, ReqWithRequester } from "src/share";
import { RemoteAuthGuard } from "src/share/guard";
import { COMMENT_SERVICE } from "../comment.di-token";
import { ICommentService } from "../comment.port";
import { CommentCondDTO, commentCondDTOSchema, CommentCreateDTO, CommentUpdateDTO } from "../model";

// Lớp CommentHttpController xử lý các request liên quan đến bình luận
@Controller()
export class CommentHttpController {
  constructor(@Inject(COMMENT_SERVICE) private readonly service: ICommentService) { }

  // Phương thức lấy danh sách các bình luận của một bài viết
  @Get('/v1/comments/:id/replies')
  @HttpCode(HttpStatus.OK)
  async listComment(@Param('id') postId: string, @Query() query: any) {
    const dto: CommentCondDTO = { postId, ...query };

    const cond = commentCondDTOSchema.parse(dto);
    const paging = pagingDTOSchema.parse(query);
    const data = await this.service.list(cond, paging);

    return paginatedResponse(data, cond);
  }

  // Phương thức tạo bình luận
  @Post('/v1/posts/:id/comments')
  @UseGuards(RemoteAuthGuard) // Sử dụng guard để xác thực token
  @HttpCode(HttpStatus.CREATED) 
  async createComment(@Param('id') postId: string, @Body() dto: CommentCreateDTO, @Request() req: ReqWithRequester) {
    const { requester } = req;

    const data = await this.service.create({ ...dto, userId: requester.sub, postId });
    return { data };
  }

  // Phương thức cập nhật bình luận
  @Patch('/v1/comments/:id')
  @UseGuards(RemoteAuthGuard) // Sử dụng guard để xác thực token
  @HttpCode(HttpStatus.OK)
  async updateComment(@Param('id') id: string, @Body() dto: CommentUpdateDTO, @Request() req: ReqWithRequester) {
    const { requester } = req;
    const data = await this.service.update(id, requester, dto);
    return { data };
  }

  // Phương thức xóa bình luận
  @Delete('/v1/comments/:id')
  @UseGuards(RemoteAuthGuard) // Sử dụng guard để xác thực token
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Param('id') id: string, @Request() req: ReqWithRequester) {
    const { requester } = req;
    const data = await this.service.delete(id, requester);
    return { data };
  }
}