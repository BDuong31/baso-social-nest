import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ErrTokenInvalid } from '../app-error';
import { REMOTE_AUTH_GUARD, TOKEN_INTROSPECTOR } from '../di-token';
import { ITokenIntrospect } from '../interface';

// Guard kiểm tra token từ request
@Injectable()
export class RemoteAuthGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_INTROSPECTOR) private readonly introspector: ITokenIntrospect,
  ) { }

  // Hàm kiểm tra token
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest(); // Lấy ra request
    const token = extractTokenFromHeader(request); // Lấy ra token từ header
    if (!token) {
      throw new UnauthorizedException();
    }

    try {

      // Kiểm tra token
      const { payload, error, isOk } = await this.introspector.introspect(token);

      if (!isOk) {
        throw ErrTokenInvalid.withLog('Token parse failed').withLog(error!.message);
      }

      request['requester'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }
}

// Hàm lấy ra token từ header
function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
}

// Guard kiểm tra token từ request, nhưng không bắt buộc
@Injectable()
export class RemoteAuthGuardOptional implements CanActivate {
  constructor(
    @Inject(REMOTE_AUTH_GUARD) private readonly authGuard: RemoteAuthGuard,
  ) { }

  // Hàm kiểm tra token
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest(); // Lấy ra request
    const token = extractTokenFromHeader(request); // Lấy ra token từ header

    if (!token) {
      return true;
    }

    return this.authGuard.canActivate(context);
  }
}
