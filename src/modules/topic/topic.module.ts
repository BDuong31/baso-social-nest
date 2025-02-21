import { Module, Provider } from '@nestjs/common';
import { ShareModule } from 'src/share/module';
import { TOPIC_REPOSITORY, TOPIC_SERVICE } from './token.di-token';
import { TopicPrismaRepository } from './topic-prisma.repo';
import { TopicController, TopicRpcController } from './topic.controller';
import { TopicService } from './topic.service';

// Khai báo các Provider
const repositories: Provider[] = [
  { provide: TOPIC_REPOSITORY, useClass: TopicPrismaRepository },
];

// Khai báo các Service
const services: Provider[] = [
  { provide: TOPIC_SERVICE, useClass: TopicService },
];

// Khai báo Module Topic
@Module({
  imports: [ShareModule],
  controllers: [TopicController, TopicRpcController],
  providers: [...repositories, ...services],
})

export class TopicModule {}
