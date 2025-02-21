import { Inject } from "@nestjs/common";

import { Injectable } from "@nestjs/common";
import { AppError, ErrNotFound } from "src/share/app-error";
import { EVENT_PUBLISHER } from "src/share/di-token";
import { CommentLikedEvent, CommentUnlikedEvent } from "src/share/event";
import { IEventPublisher } from "src/share/interface";
import { COMMENT_LIKE_REPOSITORY, COMMENT_QUERY_REPOSITORY } from "./comment-like.di-token";
import { ActionDTO, actionDTOSchema, ErrCommentAlreadyLiked, ErrCommentHasNotLiked, CommentLike } from "./comment-like.model";
import { ICmtLikeRepository, ICmtLikeService, ICmtLikeQueryRepository } from "./comment-like.port";

// Lớp CommentLikeService cung cấp các phương thức xử lý logic liên quan đến like bình luận
@Injectable()
export class CommentLikeService implements ICmtLikeService {
    constructor(
        @Inject(COMMENT_LIKE_REPOSITORY) private readonly repo: ICmtLikeRepository,
        @Inject(COMMENT_QUERY_REPOSITORY) private readonly postRpc: ICmtLikeQueryRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ){}

    // Phương thức like bình luận
    async like(data: ActionDTO): Promise<boolean> {
        const parseData = actionDTOSchema.parse(data);
        const commentExist = await this.postRpc.existed(parseData.commentId);
        if (!commentExist) {
          throw ErrNotFound;
        }
    
        const existed = await this.repo.get(parseData);
        if (existed) {
          throw AppError.from(ErrCommentAlreadyLiked, 400);
        }
    
        await this.repo.insert({ ...parseData, createdAt: new Date() } as CommentLike);
    
        // Gửi sự kiện bình luận được like
        this.eventPublisher.publish(CommentLikedEvent.create({ commentId: parseData.commentId }, parseData.userId));
    
        return true;
      }

      // Phương thức bỏ like bình luận
      async unlike(data: ActionDTO): Promise<boolean> {
        const parseData = actionDTOSchema.parse(data);

        const commentExist = await this.postRpc.existed(parseData.commentId);
        if (!commentExist) {
          throw ErrNotFound;
        }

        const existed = await this.repo.get(parseData);
        if (!existed) {
          throw AppError.from(ErrCommentHasNotLiked, 400);
        }

        await this.repo.delete(parseData);

        // Gửi sự kiện bình luận bị bỏ like
        this.eventPublisher.publish(CommentUnlikedEvent.create({ commentId: parseData.commentId }, parseData.userId));

        return true;
      }
}