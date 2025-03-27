import { Requester, TokenPayload } from "src/share";
import { UserAuthDTO, UserCondDTO, UserF2aDTO, UserLoginDTO, UserRegistrationDTO, UserUpdateDTO, UserUpdatePasswordDTO} from "./user.dto";
import { User } from "./user.model";

// Định nghĩa các phương thức mà UserService cần phải cung cấp
export interface IUserService {
    register(dto: UserRegistrationDTO): Promise<string> // Đăng ký người dùng mới
    login(dto: UserLoginDTO): Promise<UserAuthDTO>  // Đăng nhập
    googleLogin(dto: UserRegistrationDTO): Promise<UserAuthDTO> // Đăng nhập bằng Google
    enable2FA(userId: string): Promise<UserF2aDTO> // Bật 2FA
    verify2FAToken(userId: string, token: string): Promise<UserAuthDTO> // Xác thực mã token 2FA
    disable2FA(requester: Requester, userId: string): Promise<boolean> // Tắt 2FA
    profile(userId: string): Promise<Omit<User, 'password' | 'salt'>> // Lấy thông tin người dùng
    update(requester: Requester, userId: string, dto: UserUpdateDTO): Promise<Omit<User, 'password' | 'salt'>> // Cập nhật thông tin người dùng
    updatePassword(requester: Requester, userId: string, dto: UserUpdatePasswordDTO): Promise<void> // Cập nhật mật khẩu
    delete(requester: Requester, userId: string): Promise<void>  // Xóa người dùng
    // Kiểm tra mã token
    introspectToken(token: string): Promise<TokenPayload>;
}

export interface IUserRepository {
    // Truy vấn
    get(id: string): Promise<User | null>  // Lấy thông tin người dùng theo id
    findByCond(cond: UserCondDTO): Promise<User | null> // Lấy thông tin người dùng theo điều kiện
    listByIds(ids: string[]): Promise<User[]> // Lấy danh sách người dùng theo id
    // Yêu cầu
    insert(user: User): Promise<void>  // Thêm người dùng mới
    update(id: string, dto: UserUpdateDTO): Promise<void> // Cập nhật thông tin người dùng
    delete(id: string, isHard: boolean): Promise<void>  // Xóa người dùng
}