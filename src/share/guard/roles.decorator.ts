import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interface';

export const ROLES_KEY = 'roles'; // Key để lưu trữ danh sách role cần thiết
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles); // Decorator để đánh dấu role cần thiết