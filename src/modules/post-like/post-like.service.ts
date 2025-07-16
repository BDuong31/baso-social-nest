import { Inject } from "@nestjs/common";

import { Injectable } from "@nestjs/common";
import { AppError, ErrNotFound } from "src/share/app-error";
import { EVENT_PUBLISHER } from "src/share/di-token";
import { PostLikedEvent, PostUnlikedEvent } from "src/share/event";
import { IEventPublisher } from "src/share/interface";
import { POST_LIKE_REPOSITORY, POST_QUERY_REPOSITORY } from "./post-like.di-token";
import { ActionDTO, actionDTOSchema, ErrPostAlreadyLiked, ErrPostHasNotLiked, PostLike } from "./post-like.model";
import { IPostLikeRepository, IPostLikeService, IPostQueryRepository } from "./post-like.port";

// Lớp PostLikeService cung cấp các phương thức xử lý logic liên quan đến like bài viết
@Injectable()
export class PostLikeService implements IPostLikeService {
    constructor(
        @Inject(POST_LIKE_REPOSITORY) private readonly repo: IPostLikeRepository,
        @Inject(POST_QUERY_REPOSITORY) private readonly postRpc: IPostQueryRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ){}

    // Phương thức like bài viết
    async like(data: ActionDTO): Promise<boolean> {
        const parseData = actionDTOSchema.parse(data);
        const postExist = await this.postRpc.existed(parseData.postId);
        if (!postExist) {
          throw ErrNotFound;
        }
    
        const existed = await this.repo.get(parseData);
        if (existed) {
          throw AppError.from(ErrPostAlreadyLiked, 400);
        }
    
        await this.repo.insert({ ...parseData, createdAt: new Date() } as PostLike);
    
        console.log(`🚀🚀🚀 [POST-LIKE-SERVICE] Chuẩn bị PHÁT sự kiện PostLikedEvent.`);

        // Gửi sự kiện bài viết được like
        this.eventPublisher.publish(PostLikedEvent.create({ postId: parseData.postId }, parseData.userId));
    
        return true;
      }

      // Phương thức bỏ like bài viết
      async unlike(data: ActionDTO): Promise<boolean> {
        const parseData = actionDTOSchema.parse(data);

        const postExist = await this.postRpc.existed(parseData.postId);
        if (!postExist) {
          throw ErrNotFound;
        }

        const existed = await this.repo.get(parseData);
        if (!existed) {
          throw AppError.from(ErrPostHasNotLiked, 400);
        }

        await this.repo.delete(parseData);

        // Gửi sự kiện bài viết bị bỏ like
        this.eventPublisher.publish(PostUnlikedEvent.create({ postId: parseData.postId }, parseData.userId));

        return true;
      }
}