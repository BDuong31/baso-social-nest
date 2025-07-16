import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, Patch, Post,Request, Query, UseGuards } from '@nestjs/common';
import { paginatedResponse, PagingDTO, pagingDTOSchema,PublicUser,ReqWithRequester, UserRole } from 'src/share';
import { RemoteAuthGuard, Roles, RolesGuard } from 'src/share/guard';
import { USER_RPC } from "src/share/di-token";
import { IAuthorRpc, ReqWithRequesterOpt } from "src/share/interface";
import { CHAT_MESSAGE_REPOSITORY, CHAT_ROOM_REPOSITORY, CHAT_ROOM_SERVICE } from './chat-room.di-token';
import { ChatRoom, ChatRoomCondDTO, ChatRoomCreationDTO, ChatRoomUpdateDTO } from './chat-room.model';
import { IChatRoomRepository, IChatRoomService } from './chat-room.port';
import { Request as ExpressRequest } from 'express';
import { IUserService } from '../user/user.port';
import { ChatRoomModule } from './chat-room.module';
import { IChatMessageRepository } from '../chat-message/chat-message.port';

// Lớp ChatRoomController xử lý các request liên quan đến phòng chat
@Controller('v1/chat-rooms')
export class ChatRoomController {
    constructor(
        @Inject(CHAT_ROOM_SERVICE) private readonly service: IChatRoomService,    
        @Inject(USER_RPC) private readonly userRPC: IAuthorRpc,
        @Inject(CHAT_MESSAGE_REPOSITORY) private readonly chatMessageRepo: IChatMessageRepository
    ) {}

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
    // @Get()
    // @UseGuards(RemoteAuthGuard, RolesGuard) // Sử dụng guard để xác thực token
    // @HttpCode(HttpStatus.OK)
    // async listChatRooms(@Query() pading: PagingDTO, @Query() dto: ChatRoomCondDTO) {
    //     const paging = pagingDTOSchema.parse(pading);
    //     const data = await this.service.list(dto, paging);
    //     return paginatedResponse(data, dto);
    // }
    @Get()
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.OK)
    async listChatRooms(@Request() request: ReqWithRequester) {
        const userId = request.requester.sub;
        const dataUser = await this.service.list(userId); 

        const messengerIds = dataUser.map((item) => {
            return item.creatorId == userId ? item.receiverId : item.creatorId;
        });

        const users = await this.userRPC.findByIds(messengerIds);

        const userMap: Record<string, PublicUser> = {};

        users.forEach((u: PublicUser) => {
            userMap[u.id] = u;
        });

        console.log('userMap', userMap);

        const data = await Promise.all(dataUser.map(async (item) => {
            const messagerId = item.creatorId == userId ? item.receiverId : item.creatorId;
            const messager = userMap[messagerId];
            const dataMessage = await this.chatMessageRepo.findByCond({ roomId: item.id });
            console.log('dataMessage', dataMessage);
            console.log('messenger', item.id);
            return {
                ...item,
                messager: messager,
                messages: dataMessage
            } as ChatRoom;
        }));

        console.log('result', data);

        return { data };
    }
}

// Lớp ChatRoomRpcController xử lý các request liên quan đến phòng chat
@Controller('/v1/rpc/chat-rooms')
export class ChatRoomRpcController{
    constructor(
        @Inject(CHAT_ROOM_REPOSITORY) private readonly repository: IChatRoomRepository,
        @Inject(CHAT_ROOM_SERVICE) private readonly service: IChatRoomService,
        @Inject(USER_RPC) private readonly userRPC: IAuthorRpc,
        @Inject(CHAT_MESSAGE_REPOSITORY) private readonly chatMessageRepo: IChatMessageRepository,
    ) {}
    // Phương thức lấy thông tin phòng chat
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Body('ids') ids: string[]) {
        const data = await this.repository.findByIds(ids);
        return { data };
    }

    // Phương thức lấy thông tin phòng chat theo id
    @Get(':id')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @HttpCode(HttpStatus.OK)
    async getById(@Request() request: ReqWithRequester, @Param('id') id: string) {
        const userId = request.requester.sub;
        const dataUser = await this.service.list(userId);

        const messengerIds = dataUser.map((item) => {
            return item.creatorId == userId ? item.receiverId : item.creatorId;
        });

        const users = await this.userRPC.findByIds(messengerIds);

        const userMap: Record<string, PublicUser> = {};

        users.forEach((u: PublicUser) => {
            userMap[u.id] = u;
        });

        const data = await Promise.all(dataUser.map(async (item) => {
            const messagerId = item.creatorId == userId ? item.receiverId : item.creatorId;
            const messager = userMap[messagerId];
            const dataMessage = await this.chatMessageRepo.findByCond({ roomId: item.id });
            return {
                ...item,
                messager: messager,
                messages: dataMessage
            } as ChatRoom;
        }));

        const chatRoom = data.find(room => room.id === id);
        if (!chatRoom) {
            throw new NotFoundException(`Chat room with id ${id} not found`);
        }
        return { data: chatRoom };
    }
}