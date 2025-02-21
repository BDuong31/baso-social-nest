import { Module } from '@nestjs/common';
import { config } from 'src/share/config';
import { ShareModule } from 'src/share/module';
import { PostSaveRepository } from './post-save.repository';
import { POST_SAVE_REPOSITORY, POST_SAVE_SERVICE, TOPIC_QUERY_RPC } from './post-save.di-token';
import { PostSaveService } from './post-save.service';
import { PostSaveController } from './post-save.controller';
import { PostQueryRPC } from '../post-like/post-like.repository';

// Khai báo các dependencies
const dependencies = [
    { provide: POST_SAVE_REPOSITORY, useClass: PostSaveRepository },
    { provide: TOPIC_QUERY_RPC, useFactory: () => new PostQueryRPC(config.rpc.postServiceURL) },
    { provide: POST_SAVE_SERVICE, useClass: PostSaveService },
];

// Khai báo Module PostSave
@Module({
    imports: [ShareModule],
    controllers: [PostSaveController],
    providers: [...dependencies],
})
export class PostSaveModule {}
