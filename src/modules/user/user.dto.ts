import { z } from 'zod';
import { userSchema } from './user.model';

// Định nghĩa schema cho đăng ký người dùng
export const userRegistrationDTOSchema = userSchema.pick({
    avatar: true,
    firstName: true,
    lastName: true,
    email: true,
    username: true,
    password: true,
}).required();

// Định nghĩa schema cho đăng nhập người dùng
export const userLoginDTOSchema = userSchema.pick({
    username: true,
    password: true,
}).required();

// Định nghĩa kiểu dữ liệu cho DTO đăng ký người dùng
export interface UserRegistrationDTO extends z.infer<typeof userRegistrationDTOSchema>{} 

// Định nghĩa kiểu dữ liệu cho DTO đăng nhập người dùng
export interface UserLoginDTO extends z.infer<typeof userLoginDTOSchema>{} //

// Định nghĩa kiểu dữ liệu cho DTO cập nhật thông tin người dùng
export const userUpdateDTOSchema = userSchema.pick({
    avatar: true,
    cover: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    password: true,
    bio: true,
    websiteUrl: true,
    salt: true,
    role: true,
    status: true,
}).partial();

// Định nghĩa kiểu dữ liệu cho DTO cập nhật thông tin người dùng
export interface UserUpdateDTO extends z.infer<typeof userUpdateDTOSchema>{}

// Baso TODO: không cho phép cập nhật vai trò và trạng thái
// chỉ cho phép cập nhập vai trò và trạng thái cho quản trị viên
export const userUpdateProfileDTOSchema = userUpdateDTOSchema.omit({
    role: true,
    status: true,
}).partial();

// Định nghĩa schema cho điều kiện tìm kiếm người dùng
export const userCondDTOSchema = userSchema.pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    username: true,
    role: true,
    status: true,
}).partial();

// Định nghĩa kiểu dữ liệu cho DTO tìm kiếm người dùng
export interface UserCondDTO extends z.infer<typeof userCondDTOSchema>{}

// Định nghĩa kiểu dữ liệu cho DTO cập nhật thông tin người dùng
export interface UserUpdateProfileDTO extends z.infer<typeof userUpdateProfileDTOSchema>{}