import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post,Request, Query, UseGuards } from '@nestjs/common';
import { paginatedResponse, PagingDTO, pagingDTOSchema, ReqWithRequesterOpt, UserRole } from 'src/share';
import { RemoteAuthGuard, Roles, RolesGuard } from 'src/share/guard';
import { CHAT_MESSAGE_REPOSITORY, CHAT_MESSAGE_SERVICE } from '../chat-message.di-token';
import { ChatMessageCondDTO, ChatMessageCreationDTO, ChatMessageUpdateDTO } from '../model';
import { IChatMessageRepository, IChatMessageService } from '../chat-message.port';

// Controller xử lý các request liên quan đến tin nhắn chat
@Controller('v1/chat-messages')
export class ChatMessageController {
    constructor(
        @Inject(CHAT_MESSAGE_SERVICE) private readonly service: IChatMessageService) {}
    
    // Phương thức tạo tin nhắn chat
   // @Get(':id')
    @Post()
    @HttpCode(HttpStatus.OK)
    async createChatMessage(@Body() dto: ChatMessageCreationDTO) {
        const data = await this.service.create(dto);
        return { data };
    }

    // Phương thức lấy thông tin tin nhắn chat
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    async updateChatMessage(@Param('id') id: string, @Body() dto: ChatMessageUpdateDTO) {
        const data = await this.service.update(id, dto);
        return { data };
    }

    // Phương thức xóa tin nhắn chat
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async deleteChatMessage(@Param('id') id: string) {
        const data = await this.service.delete(id);
        return { data };
    }

    // Phương thức lấy danh sách tin nhắn chat
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async listChatMessages(@Request() req: ReqWithRequesterOpt, @Param('id') id: string) {
        const data = await this.service.list({ roomId: id });
        return data
    }
}

// Controller xử lý các request liên quan đến tin nhắn chat
@Controller('/v1/rpc/chat-messages')
export class ChatMessageRpcController{
    constructor(
        @Inject(CHAT_MESSAGE_REPOSITORY) private readonly repository: IChatMessageRepository) {}
    
    
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.repository.findByIds(ids);
        return { data };
    }

    
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