import dotenv from 'dotenv';

dotenv.config({
  // path: process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV}`
});

// Lấy thông tin cấu hình từ biến môi trường
const port = process.env.PORT || '3000';

// Cấu hình 
export const config = {
  envName: process.env.NODE_ENV,
  port,
  jwtSecret: process.env.JWT_SECRET_KEY || 'baso', // Mã bí mật JWT
  
  // Cấu hình giao tiếp giữa các service
  rpc: {
    jwtSecret: process.env.JWT_SECRET_KEY || 'baso', // Mã bí mật JWT
    introspectUrl: process.env.VERIFY_TOKEN_URL || `http://localhost:${port}/v1/rpc/introspect`, // Đường dẫn kiểm tra token
    postServiceURL: process.env.POST_SERVICE_URL || `http://localhost:${port}/v1`, // Đường dẫn giao tiếp với post service
    userServiceURL: process.env.USER_SERVICE_URL || `http://localhost:${port}/v1`, // Đường dẫn giao tiếp với user service
    commentServiceURL: process.env.COMMENT_SERVICE_URL || `http://localhost:${port}/v1`, // Đường dẫn giao tiếp với comment service
    followServiceURL: process.env.FOLLOW_SERVICE_URL || `http://localhost:${port}/v1`, // Đường dẫn giao tiếp với follow service
    topicServiceURL: process.env.TOPIC_SERVICE_URL || `http://localhost:${port}/v1`, // Đường dẫn giao tiếp với topic service
    postLikeServiceURL: process.env.POST_LIKE_SERVICE_URL || `http://localhost:${port}/v1`, // Đường dẫn giao tiếp với post like service
    postSavedServiceURL: process.env.POST_SAVED_SERVICE_URL || `http://localhost:${port}/v1` // Đường dẫn giao tiếp với post saved service
  },
  
  // Cấu hình Redis
  redis: {
    host: process.env.REDIS_HOST || 'redis-baso',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    url: process.env.REDIS_URL || 'redis://:baso_redis@localhost:6379/0'
  },

  // Cấu hình cơ sở dữ liệu
  db: {
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
  },

  // Cấu hình upload file
  upload: {
    type: 'local',
    path: 'uploads',
    cdn: process.env.CDN_URL || `http://localhost:${port}/uploads`
  },

  // Cấu hình cơ sở dữ liệu
  dbURL: `postgresql://baso:baso_secret@localhost:5432/baso-social?connection_limit=50`
};