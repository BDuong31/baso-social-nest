import { Body,Req, Res, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { AppError, ErrNotFound, ReqWithRequester, UserRole } from "src/share";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { USER_REPOSITORY, USER_SERVICE } from "./user.di-token";
import { UserLoginDTO, UserRegistrationDTO, UserUpdateDTO, UserUpdateProfileDTO, UserUpdatePasswordDTO } from "./user.dto";
import { ErrInvalidToken, User } from "./user.model";
import { IUserRepository, IUserService } from "./user.port";
import { AuthGuard } from "@nestjs/passport";

// Lớp UserHttpController cung cấp các phương thức xử lý request HTTP
@Controller()
export class UserHttpController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService
  ) {}

  // Phương thức đăng ký người dùng mới
  @Post('v1/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() dto: UserRegistrationDTO) {
    const data = await this.userService.register(dto);
    return { data };
  }

  // Phương thức đăng nhập
  @Post('v1/authenticate')
  @HttpCode(HttpStatus.OK)
  async authenticate(@Body() dto: UserLoginDTO) {
    const data = await this.userService.login(dto);
    return { data };
  }

  @Post('v1/google-login')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() dto: UserRegistrationDTO) {
    const data = await this.userService.googleLogin(dto);
    return { data };
  }

  // Phương thức lấy thông tin người dùng
  @Get('v1/profile')
  @HttpCode(HttpStatus.OK)
  async profile(@Request() req: ExpressRequest) {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || token === undefined) {
      return AppError.from(ErrInvalidToken, 400); 
    }
    
    const requester = await this.userService.introspectToken(token);
    const data = await this.userService.profile(requester.sub);
    return { data };
  }

  // Phương thức cập nhật hồ sơ người dùng
  @Patch('v1/profile')
  @UseGuards(RemoteAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Request() req: ReqWithRequester, @Body() dto: UserUpdateProfileDTO) {
    const requester = req.requester;
    const data = await this.userService.update(requester, requester.sub, dto);
    return { data: data };
  }

  @Patch('v1/update-password')
  @UseGuards(RemoteAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Request() req: ReqWithRequester, @Body() dto: UserUpdatePasswordDTO) {
    const requester = req.requester;
    const data = await this.userService.updatePassword(requester, requester.sub, dto);
    return { data: true };
  }

  // Phương thức cập nhật thông tin người dùng
  @Patch('v1/users/:id')
  //@UseGuards(RemoteAuthGuard, RolesGuard)
  //@Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateUser(@Request() req: ReqWithRequester, @Param('id') id: string, @Body() dto: UserUpdateDTO) {
    const requester = req.requester;
    await this.userService.update(requester, id, dto);
    return { data: true };
  }

  // Phương thức xóa người dùng
  @Delete('v1/users/:id')
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Request() req: ReqWithRequester, @Param('id') id: string) {
    const requester = req.requester;
    await this.userService.delete(requester, id);
    return { data: true };
  }
}

// Lớp UserRpcHttpController cung cấp các phương thức xử lý request RPC
@Controller('v1/rpc')
export class UserRpcHttpController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository
  ) {}

  // Phương thức kiểm tra mã token
  @Post('introspect')
  @HttpCode(HttpStatus.OK)
  async introspect(@Body() dto: { token: string }) {
    const result = await this.userService.introspectToken(dto.token);
    return { data: result };
  }

  // Phương thức lấy thông tin người dùng
  @Get('users/:id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id') id: string) {
    const user = await this.userRepository.get(id);

    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    return { data: this._toResponseModel(user) };
  }

  // Phương thức lấy danh sách người dùng theo id
  @Post('users/list-by-ids')
  @HttpCode(HttpStatus.OK)
  async listUsersByIds(@Body('ids') ids: string[]) {
    const data = await this.userRepository.listByIds(ids);
    return { data: data.map(this._toResponseModel) };
  }

  // Chuyển đổi dữ liệu từ User sang dạng trả về
  private _toResponseModel(data: User): Omit<User, 'password' | 'salt'> {
    const { password, salt, ...rest } = data;
    return rest;
  }
}

