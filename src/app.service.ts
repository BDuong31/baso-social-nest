import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    return `<h1>Baso Social Network API from BASO</h1>`;
  }
}
