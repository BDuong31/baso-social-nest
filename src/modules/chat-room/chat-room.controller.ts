import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { paginatedResponse, PagingDTO, pagingDTOSchema, UserRole } from 'src/share';
import { RemoteAuthGuard, Roles, RolesGuard } from 'src/share/guard';
import { CHAT_ROOM_REPOSITORY, CHAT_ROOM_SERVICE } from './chat-room.di-token';
import { ChatRoomCondDTO, ChatRoomCreationDTO, ChatRoomUpdateDTO } from './chat-room.model';
import { IChatRoomRepository, IChatRoomService } from './chat-room.port';

// Lớp ChatRoomController xử lý các request liên quan đến phòng chat
@Controller('v1/chat-rooms')
export class ChatRoomController {
    constructor(
        @Inject(CHAT_ROOM_SERVICE) private readonly service: IChatRoomService) {}

    // Phương thức tạo phòng chat mới
    @Post()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.OK)
    async createChatRoom(@Body() dto: ChatRoomCreationDTO) {
        const data = await this.service.create(dto);
        return { data };
    }

    // Phương thức lấy thông tin phòng chat
    @Patch(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard) // Sử dụng guard để xác thực token
    @HttpCode(HttpStatus.OK)    
    async updateChatRoom(@Param('id') id: string, @Body() dto: ChatRoomUpdateDTO) {
        const data = await this.service.update(id, dto);
        return { data };
    }
    
    // Phương thức xóa phòng chat
    @Delete(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard) // Sử dụng guard để xác thực token
    @HttpCode(HttpStatus.OK)
    async deleteChatRoom(@Param('id') id: string) {
        const data = await this.service.delete(id);
        return { data };
    }

    // Phương thức lấy danh sách phòng chat
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard) // Sử dụng guard để xác thực token
    @HttpCode(HttpStatus.OK)
    async listChatRooms(@Query() pading: PagingDTO, @Query() dto: ChatRoomCondDTO) {
        const paging = pagingDTOSchema.parse(pading);
        const data = await this.service.list(dto, paging);
        return paginatedResponse(data, dto);
    }
}

// Lớp ChatRoomRpcController xử lý các request liên quan đến phòng chat
@Controller('/v1/rpc/chat-rooms')
export class ChatRoomRpcController{
    constructor(
        @Inject(CHAT_ROOM_REPOSITORY) private readonly repository: IChatRoomRepository) {}

    // Phương thức lấy thông tin phòng chat
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.repository.findByIds(ids);
        return { data };
    }

    // Phương thức lấy thông tin phòng chat theo id
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