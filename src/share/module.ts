import { Module, Provider } from "@nestjs/common";
import { RedisClient } from "./components";
import { config } from "./config";
import { EVENT_PUBLISHER, POST_RPC, TOKEN_INTROSPECTOR, USER_RPC } from "./di-token";
import { PostRPCClient, TokenIntrospectRPCClient, UserRPCClient } from "./rpc";

// Khởi tạo client cho việc kiểm tra token
const tokenRPCClient = new TokenIntrospectRPCClient(config.rpc.introspectUrl);
const tokenIntrospector: Provider = {
  provide: TOKEN_INTROSPECTOR,
  useValue: tokenRPCClient,
};

// Khởi tạo client cho việc giao tiếp với user service
const userRPCClient = new UserRPCClient(config.rpc.userServiceURL);
const userRPC: Provider = {
  provide: USER_RPC,
  useValue: userRPCClient,
};

// Khởi tạo client cho việc giao tiếp với post service
const postRPCClient = new PostRPCClient(config.rpc.postServiceURL);
const postRPC: Provider = {
  provide: POST_RPC,
  useValue: postRPCClient,
};

// Khởi tạo client cho việc giao tiếp với Redis
const redisClient: Provider = {
  provide: EVENT_PUBLISHER,
  useFactory: async () => {
    await RedisClient.init(config.redis.url);
    return RedisClient.getInstance();
  }
};


// Tạo module chia sẻ
@Module({
  providers: [tokenIntrospector, userRPC, postRPC, redisClient],
  exports: [tokenIntrospector, userRPC, postRPC, redisClient]
})

export class ShareModule { }
