import { Body, Controller, Delete, Get, HttpCode, Inject, Logger, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { IAuthorRpc, IPostRpc, paginatedResponse, PagingDTO, pagingDTOSchema, Post as PostModel, PublicUser, ReqWithRequester, Topic } from "src/share";
import { POST_RPC, USER_RPC } from "src/share/di-token";
import { RemoteAuthGuard } from "src/share/guard";
import { POST_SAVE_REPOSITORY, POST_SAVE_SERVICE, TOPIC_QUERY_RPC } from "./post-save.di-token";
import { IPostSaveRepository, IPostSaveService, ITopicQueryRPC } from "./post-save.port";

// Lớp PostSaveController cung cấp các phương thức xử lý request HTTP liên quan đến lưu bài viết
@Controller('v1')
export class PostSaveController {
  constructor(
    @Inject(POST_SAVE_SERVICE) private readonly usecase: IPostSaveService,
    @Inject(POST_SAVE_REPOSITORY) private readonly repo: IPostSaveRepository,
    @Inject(POST_RPC) private readonly postRpc: IPostRpc,
    @Inject(USER_RPC) private readonly userRPC: IAuthorRpc,
    @Inject(TOPIC_QUERY_RPC) private readonly topicQueryRPC: ITopicQueryRPC,
  ) { }

  // Phương thức lưu bài viết
  @Post('posts/:id/save')
  @UseGuards(RemoteAuthGuard) // Sử dụng guard để xác thực token
  @HttpCode(200)
  async save(@Param('id') postId: string, @Request() req: ReqWithRequester) {
    const { sub } = req.requester; // Lấy thông tin người dùng từ token
    const dto = {postId, userId: sub };

    const result = await this.usecase.save(dto);
    return { data: result };
  }

  // Phương thức bỏ lưu bài viết
  @Delete('posts/:id/save')
  @UseGuards(RemoteAuthGuard) // Sử dụng guard để xác thực token
  @HttpCode(200)
  async unsave(@Param('id') postId: string, @Request() req: ReqWithRequester) {
    const { sub } = req.requester; // Lấy thông tin người dùng từ token

    const dto = { postId, userId: sub };
    const result = await this.usecase.unsave(dto);
    return { data: result };
  }

  // Phương thức lấy danh sách bài viết đã lưu
  @Get('users/:id/saved-posts')
  @UseGuards(RemoteAuthGuard)
  @HttpCode(200)
  async listPostSave(@Param('id') userId: string, @Query() paging: PagingDTO) {
    const pagingData = pagingDTOSchema.parse(paging);

    const postUserSave = await this.repo.list(userId, pagingData);

    const postIds = postUserSave.data.map(item => item.postId);
    const posts = await this.postRpc.findByIds(postIds);

    const authorMap: Record<string, PublicUser> = {};
    const postMap: Record<string, PostModel> = {};
    const topicMap: Record<string, Topic> = {};

    let topicIds: string[] = [];
    let authorIds: string[] = [];

    // Lấy thông tin tác giả và chủ đề của bài viết
    posts.forEach((p: PostModel) => {
      postMap[p.id] = p;
      topicIds.push(p.topicId);
      authorIds.push(p.authorId);
    });

    const authors = await this.userRPC.findByIds(authorIds);

    authors.forEach((au: PublicUser) => {
      authorMap[au.id] = au;
    });


    //const topics = await this.topicQueryRPC.findByIds(topicIds);

    // topics.forEach((t: Topic) => {
    //   topicMap[t.id] = t;
    // });

    //console.log(topicMap);

    // Gộp thông tin bài viết, tác giả, chủ đề
    const listPosts = postUserSave.data.map(item => {
      console.log("item: ", item.postId);
      const post = postMap[item.postId];
      console.log("post: ", post);
      console.log("authorId: ", post.authorId)
      const author = authorMap[post.authorId];
      //const topic = topicMap[post.topicId];

      return {
        ...post,
        author,
        //topic,
        hasSaved: true,
        createdAt: item.createdAt
      };
    });

    const pagingResult = {
      paging,
      total: postUserSave.total,
      data: listPosts
    };

    return paginatedResponse(pagingResult, {});
  }

  // Phương thức kiểm tra bài viết đã được lưu chưa
  @Post('rpc/has-saved')
  @HttpCode(200)
  async hasSavedAPI(@Body() body: { userId: string, postId: string }) {
    try {
      const { userId, postId } = body;
      const result = await this.repo.get({ userId, postId });
      return { data: result !== null };
    } catch (e) {
      Logger.error((e as Error).message);
      return { data: false };
    }
  }

  // Phương thức lấy danh sách ID bài viết đã lưu
  @Post('rpc/list-post-ids-saved')
  @HttpCode(200)
  async listPostIdsSavedAPI(@Body() body: { userId: string, postIds: string[] }) {
    const { userId, postIds } = body;
    const result = await this.repo.listPostIdsSaved(userId, postIds);
    return { data: result };
  }
}