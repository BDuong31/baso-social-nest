import { Injectable } from "@nestjs/common";
import axios from "axios";
import { ITokenIntrospect, TokenIntrospectResult } from "../interface";

// Khởi tạo client cho việc giao tiếp với introspect service
@Injectable()
export class TokenIntrospectRPCClient implements ITokenIntrospect {
  constructor(private readonly url: string) { }

  // Hàm kiểm tra token
  async introspect(token: string): Promise<TokenIntrospectResult> {
    try {
      // Gửi request lên introspect service
      const { data } = await axios.post(`${this.url}`, { token });
      const { sub, role } = data.data;
      return {
        payload: { sub, role },
        isOk: true,
      };
    } catch (error) {
      return {
        payload: null,
        error: (error as Error),
        isOk: false,
      };
    }
  }
}