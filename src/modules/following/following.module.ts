import { Module } from '@nestjs/common';
import { ShareModule } from 'src/share/module';
import { FollowingController } from './following.controller';
import { FOLLOWING_REPOSITORY, FOLLOWING_SERVICE } from './following.di-token';
import { FollowingRepository } from './following.repository';
import { FollowingService } from './following.service';

// Khai báo các dependencies
const dependencies = [
    { provide: FOLLOWING_REPOSITORY, useClass: FollowingRepository },
    { provide: FOLLOWING_SERVICE, useClass: FollowingService },
  ];
  
  // Khai báo Module Following
  @Module({
    imports: [ShareModule],
    controllers: [FollowingController],
    providers: [...dependencies],
  })
  export class FollowingModule {}
  