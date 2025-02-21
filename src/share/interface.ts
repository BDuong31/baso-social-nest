import { AppEvent, Post, PublicUser, Topic } from "./data-model";

// Định nghĩa interface cho payload token
export interface TokenPayload {
  sub: string;
  role: UserRole;
}

// Định nghĩa interface cho requester
export interface Requester extends TokenPayload { }

export interface ReqWithRequester { requester: Requester; } // Requester bắt buộc phải có
export interface ReqWithRequesterOpt { requester?: Requester; } // Requester có thể không có

// Định nghĩa interface cho token provider
export interface ITokenProvider {
  // Tạo mã truy cập token
  generateToken(payload: TokenPayload): Promise<string>;
  verifyToken(token: string): Promise<TokenPayload | null>;
}

// Định nghĩa interface cho token introspector
export type TokenIntrospectResult = {
  payload: TokenPayload | null;
  error?: Error;
  isOk: boolean;
};

// Định nghĩa interface cho token introspector
export interface ITokenIntrospect {
  introspect(token: string): Promise<TokenIntrospectResult>;
}

// Định nghĩa emun cho user role
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

// Định nghĩa interface cho RPC posts
export interface IPostRpc {
  findById(id: string): Promise<Post | null>;
  findByIds(ids: Array<string>): Promise<Array<Post>>;
}

// Định nghĩa interface cho RPC authors
export interface IAuthorRpc {
  findById(id: string): Promise<PublicUser | null>;
  findByIds(ids: Array<string>): Promise<Array<PublicUser>>;
}

// Định nghĩa interface cho RPC topics
export interface ITopicRPC {
  findById(id: string): Promise<Topic | null>;
  findAll(): Promise<Array<Topic>>;
}

// Định nghĩa interface cho RPC người dùng công khai, mở rộng từ IAuthorRpc
export interface IPublicUserRpc extends IAuthorRpc { }

// Định nghĩa kiểu dữ liệu cho hàm xử lý sự kiện
export type EventHandler = (msg: string) => void;

// Định nghĩa interface cho publisher sự kiện
export interface IEventPublisher {
  publish<T>(event: AppEvent<T>): Promise<void>;
}