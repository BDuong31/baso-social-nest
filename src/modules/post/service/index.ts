import { Inject, Injectable } from "@nestjs/common";
import { AppError, IAuthorRpc, IEventPublisher, Requester } from "src/share";
import { EVENT_PUBLISHER, USER_RPC } from "src/share/di-token";
import { PostCreatedEvent, PostDeletedEvent } from "src/share/event";
import { v7 } from "uuid";
import { CreatePostDTO, createPostDTOSchema, ErrAuthorNotFound, ErrPostNotFound, ErrTopicNotFound, Post, Type, UpdatePostDTO, updatePostDTOSchema } from "../model";
import { POST_REPOSITORY, TOPIC_QUERY } from "../post.di-token";
import { IPostRepository, IPostService, ITopicQueryRPC } from "../post.port";

// Lớp PostService cung cấp các phương thức xử lý logic liên quan đến bài viết
@Injectable()
export class PostService implements IPostService {
  constructor(
    @Inject(POST_REPOSITORY) private readonly repository: IPostRepository,
    @Inject(TOPIC_QUERY) private readonly topicRPC: ITopicQueryRPC,
    @Inject(USER_RPC) private readonly userRPC: IAuthorRpc,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
  ) { }

  // Phương thức tạo bài viết mới
  async create(dto: CreatePostDTO): Promise<string> {
    
    // 1. Parse dữ liệu từ DTO
    const data = createPostDTOSchema.parse(dto);

    // 2. Kiểm tra topic tồn tại
    const topicExist = await this.topicRPC.findById(data.topicId);

    console.log('topicExist', topicExist);
    if (!topicExist) {
      throw AppError.from(ErrTopicNotFound, 404);
    }

    // 3. Kiểm tra tác giả tồn tại
    const authorExist = await this.userRPC.findById(data.authorId);

    if (!authorExist) {
      throw AppError.from(ErrAuthorNotFound, 404);
    }
    const postCount = authorExist.postCount + 1;
    const dtos = {
      postCount: postCount,
    }; 
    const updateAuthor = await this.userRPC.updateAuthorRpc(data.authorId, dtos);

    if (!updateAuthor) {
      throw AppError.from(ErrAuthorNotFound, 404);
    }
    
    // 4. Tạo bài viết mới
    const newId = v7();
    const post: Post = {
      ...data,
      id: newId,
      isFeatured: false,
      topicId: topicExist.id,
      image: data.image ?? '',
      type: data.image ? Type.MEDIA : Type.TEXT,
      commentCount: 0,
      likedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 5. Thêm bài viết mới vào Database
    await this.repository.insert(post);


    // 6. Gửi sự kiện bài viết được tạo
    this.eventPublisher.publish(PostCreatedEvent.create({ postId: newId, topicId: post.topicId }, post.authorId));

    return newId;
  }

  // Phương thức cập nhật bài viết
  async update(id: string, dto: UpdatePostDTO, requester: Requester): Promise<boolean> {
    
    // 1. Parse dữ liệu từ DTO
    const data = updatePostDTOSchema.parse(dto);

    // 2. Kiểm tra bài viết tồn tại
    const postExist = await this.repository.get(id);

    if (!postExist) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    if (postExist.authorId !== requester.sub) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    // 3. Cập nhật thông tin bài viết
    const updateDto: UpdatePostDTO = {
      ...data,
      type: data.image ? Type.MEDIA : Type.TEXT,
      updatedAt: new Date(),
    };

    await this.repository.update(id, updateDto);

    return true;
  }

  // Phương thức xóa bài viết
  async delete(id: string, requester: Requester): Promise<boolean> {
    
    // 1. Kiểm tra bài viết tồn tại
    const postExist = await this.repository.get(id);

    if (!postExist) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    if (postExist.authorId !== requester.sub) {
      throw AppError.from(ErrPostNotFound, 404);
    }

    // 2. Xóa bài viết
    await this.repository.delete(id);

    // 3. Gửi sự kiện bài viết bị xóa
    this.eventPublisher.publish(PostDeletedEvent.create({ postId: postExist.id, topicId: postExist.topicId }, postExist.authorId));

    return true;
  }
}
