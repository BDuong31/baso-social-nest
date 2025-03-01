import { Injectable } from "@nestjs/common";
import jwt from 'jsonwebtoken';
import { ITokenProvider, TokenPayload } from "../interface";
import ms , { StringValue } from "ms";

// Lớp JwtTokenService cung cấp các phương thức tạo và xác thực token JWT
@Injectable()
export class JwtTokenService implements ITokenProvider {
  private readonly secretKey: string;
  private readonly expiresIn: string | number;

  constructor(secretKey: string, expiresIn: string | number) {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  // Tạo một token từ dữ liệu payload
  async generateToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.secretKey, {
      expiresIn: this.expiresIn as StringValue | number,
    });
  }
  // Xác thực token
  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, this.secretKey) as TokenPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}