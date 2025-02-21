import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Requester, UserRole } from '../interface';
import { ROLES_KEY } from './roles.decorator';

// Guard kiểm tra quyền của user
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  // Hàm kiểm tra quyền của user
  canActivate(context: ExecutionContext): boolean {
    
    // Lấy ra danh sách role cần thiết
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu không cần quyền thì trả về true
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest(); // Lấy ra request
    const requester = request['requester'] as Requester; // Lấy ra thông tin user
    return requiredRoles.some((role) => requester.role === role); // Kiểm tra xem user có quyền không
  }
}