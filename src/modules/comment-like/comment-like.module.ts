import { Module } from '@nestjs/common';
import { config } from 'src/share/config';
import { ShareModule } from 'src/share/module';
import { CmtLikeHttpController, CmtLikeRpcController } from './comment-like.controller';
import { COMMENT_LIKE_REPOSITORY, COMMENT_LIKE_SERVICE, COMMENT_QUERY_REPOSITORY } from './comment-like.di-token';
import { CmtLikeRepository, CmtQueryRPC } from './comment-like.repository';
import { CommentLikeService } from './comment-like.service';

// Khai báo các dependencies
const dependencies = [
  { provide: COMMENT_LIKE_REPOSITORY, useClass: CmtLikeRepository },
  { provide: COMMENT_QUERY_REPOSITORY, useFactory: () => new CmtQueryRPC(config.rpc.commentServiceURL) },
  { provide: COMMENT_LIKE_SERVICE, useClass: CommentLikeService },
];

// Khai báo Module CommentLike
@Module({
  imports: [ShareModule],
  controllers: [CmtLikeHttpController, CmtLikeRpcController],
  providers: [...dependencies],
})
export class CommentLikeModule {}
