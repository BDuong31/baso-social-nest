import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { paginatedResponse, PagingDTO, pagingDTOSchema, UserRole } from 'src/share';
import { RemoteAuthGuard, Roles, RolesGuard } from 'src/share/guard';
import { TOPIC_REPOSITORY, TOPIC_SERVICE } from './token.di-token';
import { TopicCondDTO, TopicCreationDTO, TopicUpdateDTO } from './topic.model';
import { ITopicRepository, ITopicService } from './topic.port';

// Lớp TopicController cung cấp các phương thức xử lý request HTTP liên quan đến chủ đề
@Controller('v1/topics')
export class TopicController {
  constructor(
    @Inject(TOPIC_SERVICE) private readonly service: ITopicService) {}

  // Phương thức tạo chủ đề mới
  @Post()
  @UseGuards(RemoteAuthGuard, RolesGuard) // Sử dụng guard để xác thực token và quyền truy cập
  @Roles(UserRole.ADMIN) // Chỉ cho phép quản trị viên tạo chủ đề mới
  @HttpCode(HttpStatus.CREATED)
  async createTopic(@Body() dto: TopicCreationDTO) {
    const data = await this.service.create(dto);
    return { data };
  }

  // Phương thức cập nhật thông tin chủ đề
  @Patch(':id')
  @UseGuards(RemoteAuthGuard, RolesGuard) // Sử dụng guard để xác thực token và quyền truy cập
  @Roles(UserRole.ADMIN) // Chỉ cho phép quản trị viên cập nhật thông tin chủ đề
  @HttpCode(HttpStatus.OK)
  async updateTopic(@Param('id') id: string, @Body() dto: TopicUpdateDTO) {
    const data = await this.service.update(id, dto);
    return { data };
  }

  // Phương thức xóa chủ đề
  @Delete(':id')
  @UseGuards(RemoteAuthGuard, RolesGuard) // Sử dụng guard để xác thực token và quyền truy cập
  @Roles(UserRole.ADMIN) // Chỉ cho phép quản trị viên xóa chủ đề
  @HttpCode(HttpStatus.OK)
  async deleteTopic(@Param('id') id: string) {
    const data = await this.service.delete(id);
    return { data };
  }

  // Phương thức lấy thông tin chủ đề
  @Get()
  @HttpCode(HttpStatus.OK)
  async listTopics(@Query() pading: PagingDTO, @Query() dto: TopicCondDTO) {
    const paging = pagingDTOSchema.parse(pading);
    const data = await this.service.list(dto, paging);
    return paginatedResponse(data, dto);
  }
}

// Lớp TopicRpcController cung cấp các phương thức xử lý request RPC liên quan đến chủ đề
@Controller('/v1/rpc/topics')
export class TopicRpcController {
  constructor(
    @Inject(TOPIC_REPOSITORY) private readonly repository: ITopicRepository) {}

  // Phương thức lấy thông tin chủ đề theo ID
  @Post('list-by-ids')
  @HttpCode(HttpStatus.OK)
  async listByIds(@Body('ids') ids: string[]) {
    const data = await this.repository.findByIds(ids);
    return { data };
  }

  // Phương thức lấy thông tin chủ đề theo ID
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string) {
    const data = await this.repository.findById(id);

    if (!data) {
      throw new NotFoundException();
    }

    return { data };
  }
}
