import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Server } from 'socket.io';

// Mở rộng Request để chứa io
interface CustomRequest extends Request {
  io?: Server;
}

@Injectable()
export class SocketMiddleware implements NestMiddleware {
  constructor(private readonly io: Server) {}

  use(req: CustomRequest, res: Response, next: NextFunction) {
    if (!req.io) {
      req.io = this.io;
    }
    next();
  }
}
