import { Inject, Injectable } from "@nestjs/common";
import bcrypt from 'bcrypt';
import { AppError, ErrForbidden, ErrNotFound, ITokenProvider, Requester, TokenPayload, UserRole } from "src/share";
import { v7 } from "uuid";
import { TOKEN_PROVIDER, USER_REPOSITORY } from "./user.di-token";
import { UserLoginDTO, userLoginDTOSchema, UserRegistrationDTO, userRegistrationDTOSchema, UserUpdateDTO, userUpdateDTOSchema, UserUpdatePasswordDTO, userUpdatePasswordDTOSchema } from "./user.dto";
import { ErrInvalidToken, ErrInvalidUsernameAndPassword, ErrUserInactivated, ErrUsernameExisted, Status, User } from "./user.model";
import { IUserRepository, IUserService } from "./user.port";

// Lớp UserService cung cấp các phương thức xử lý logic liên quan đến người dùng
@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository, // Đối tượng thực thi các phương thức truy vấn dữ liệu
    @Inject(TOKEN_PROVIDER) private readonly tokenProvider: ITokenProvider, // Đối tượng tạo và xác thực token
  ) { }

  // Phương thức đăng ký người dùng mới
  async register(dto: UserRegistrationDTO): Promise<string> {
    const data = userRegistrationDTOSchema.parse(dto);

    // 1. Kiểm tra tên người dùng đã tồn tại chưa
    const user = await this.userRepo.findByCond({ username: data.username });
    if (user) throw AppError.from(ErrUsernameExisted, 400);

    // 2. Tạo Salt và Mật khẩu mã hoá
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = await bcrypt.hash(`${data.password}.${salt}`, 10);

    // 3. Tạo người dùng mới
    const newId = v7();
    const newUser: User = {
      ...data,
      phone: '',
      password: hashPassword,
      id: newId,
      status: Status.ACTIVE,
      salt: salt,
      role: UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
      followerCount: 0,
      postCount: 0,
    };

    // 4. Thêm người dùng mới vào Database
    await this.userRepo.insert(newUser);
    return newId;
  }

  // Phương thức đăng nhập
  async login(dto: UserLoginDTO): Promise<string> {
    const data = userLoginDTOSchema.parse(dto);

    // 1. Tìm người dùng trong DTO
    const user = await this.userRepo.findByCond({ username: dto.username });
    if (!user) {
      throw AppError.from(ErrInvalidUsernameAndPassword, 400).withLog('Username not found');
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(`${dto.password}.${user.salt}`, user.password);
    if (!isMatch) {
      throw AppError.from(ErrInvalidUsernameAndPassword, 400).withLog('Password is incorrect');
    }

    // 3. Kiểm tra trạng thái người dùng
    if (user.status === Status.DELETED || user.status === Status.INACTIVE) {
      throw AppError.from(ErrUserInactivated, 400);
    }

    // 3. Trả về token
    const role = user.role;
    const token = await this.tokenProvider.generateToken({ sub: user.id, role });
    return token;
  }

  // Phương thức đăng nhập bằng google
  async googleLogin(dto : UserRegistrationDTO): Promise<string> {
    const data = userRegistrationDTOSchema.parse(dto);

    // Kiểm tra xem user đã tồn tại hay chưa
    const user = await this.userRepo.findByCond({ email: data.email });

    const salt = bcrypt.genSaltSync(8);
    const hashPassword = await bcrypt.hash(`${data.password}.${salt}`, 10);

    //Nếu chưa có, tự động đăng ký tài khoản mới
    if (!user) {
      const newId = v7();
      const newUser: User = {
        ...data,
        phone: '',
        password: hashPassword,
        id: newId,
        status: Status.ACTIVE,
        salt: '',
        role: UserRole.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
        followerCount: 0,
        postCount: 0,
      };
      await this.userRepo.insert(newUser);
      const role = newUser.role;
      const token = await this.tokenProvider.generateToken({ sub: newUser.id, role });
      return token;
      console.log('Đăng ký tài khoản mới thành công');
    } else {

      if (user.status === Status.DELETED || user.status === Status.INACTIVE) {
        throw AppError.from(ErrUserInactivated, 400);
      }

      const role = user.role;
      const token = await this.tokenProvider.generateToken({ sub: user.id, role });
      return token;
    }
  }

  // Phương thức xác thực token
  async introspectToken(token: string): Promise<TokenPayload> {

    // 1. Xác thực token
    const payload = await this.tokenProvider.verifyToken(token);

    // 2. Kiểm tra token
    if (!payload) {
      throw AppError.from(ErrInvalidToken, 400);
    }

    // 3. Lấy thông tin người dùng
    const user = await this.userRepo.get(payload.sub);
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    // 4. Kiểm tra trạng thái người dùng
    if (user.status === Status.DELETED || user.status === Status.INACTIVE || user.status === Status.BANNED) {
      throw AppError.from(ErrUserInactivated, 400);
    }

    return {
      sub: user.id,
      role: user.role,
    };
  }

  // Phương thức lấy thông tin người dùng
  async profile(userId: string): Promise<Omit<User, 'password' | 'salt'>> {
    
    // 1. Lấy thông tin người dùng
    const user = await this.userRepo.get(userId);
    
    // 2. Kiểm tra người dùng
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    const { password, salt, ...rest } = user;
    return rest;
  }

  // Phương thức cập nhật thông tin người dùng
  async update(requester: Requester, userId: string, dto: UserUpdateDTO): Promise<Omit<User, 'password' | 'salt'>> {
    // 1. Kiểm tra quyền hạn
    if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
      throw AppError.from(ErrForbidden, 400);
    }

    // 2. Kiểm tra dữ liệu đầu vào
    const data = userUpdateDTOSchema.parse(dto);

    // 3. Kiểm tra người dùng
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    // 4. Cập nhật thông tin người dùng
    await this.userRepo.update(userId, data);

    const { password, salt, ...rest } = user;

    return rest;
  }

  async updatePassword(requester: Requester, userId: string, dto: UserUpdatePasswordDTO): Promise<void> {
    // 1. Kiểm tra quyền hạn
    if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
      throw AppError.from(ErrForbidden, 400);
    }

    // 2. Kiểm tra dữ liệu đầu vào
    const data = userUpdatePasswordDTOSchema.parse(dto);

    // 3. Kiểm tra người dùng
    const user = await this.userRepo.get(userId);
    if (!user) {
      throw AppError.from(ErrNotFound, 400);
    }

    //4. Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(`${data.oldpassword}.${user.salt}`, user.password);
    if (!isMatch) {
      throw AppError.from(ErrInvalidUsernameAndPassword, 400).withLog('Old password is incorrect');
    }

    // 5. Tạo Salt và Mật khẩu mã hoá
    const salt = bcrypt.genSaltSync(8);
    const hashPassword = await bcrypt.hash(`${data.password}.${salt}`, 10);

    // 6. Cập nhật mật khẩu
    await this.userRepo.update(userId, { password: hashPassword, salt });
  }

  // Phương thức xóa người dùng
  async delete(requester: Requester, userId: string): Promise<void> {
    // 1. Kiểm tra quyền hạn
    if (requester.role !== UserRole.ADMIN && requester.sub !== userId) {
      throw AppError.from(ErrForbidden, 400);
    }

    // 2. Xóa người dùng
    await this.userRepo.delete(userId, false);
  }
}
