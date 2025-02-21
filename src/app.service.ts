import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    return `
    <div style="background-color: blue; width: 173vh; height:98vh; display: flex; justify-content: center; align-items: center">
      <h1 style="color: white">Baso Spark Network API from BASO</h1>
    <div>
      `
  }
}