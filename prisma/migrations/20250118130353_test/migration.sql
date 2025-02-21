-- CreateEnum
CREATE TYPE "NotificationAction" AS ENUM ('liked', 'followed', 'replied');

-- CreateEnum
CREATE TYPE "chatRoomType" AS ENUM ('direct', 'group');

-- CreateEnum
CREATE TYPE "chatRoomStatus" AS ENUM ('pending', 'active', 'deleted');

-- CreateEnum
CREATE TYPE "stories_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('pending', 'approved', 'rejected', 'deleted', 'spam');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('text', 'media');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'pending', 'inactive', 'banned', 'deleted');

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" VARCHAR(36) NOT NULL,
    "room_id" VARCHAR(36) NOT NULL,
    "sender_id" VARCHAR(36) NOT NULL,
    "content" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_rooms" (
    "id" VARCHAR(36) NOT NULL,
    "creator_id" VARCHAR(36) NOT NULL,
    "receiver_id" VARCHAR(36) NOT NULL,
    "type" "chatRoomType" DEFAULT 'direct',
    "status" "chatRoomStatus" DEFAULT 'pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "chat_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_likes" (
    "comment_id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comment_likes_pkey" PRIMARY KEY ("comment_id","user_id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "post_id" VARCHAR(36) NOT NULL,
    "parent_id" VARCHAR(36),
    "content" TEXT NOT NULL,
    "liked_count" INTEGER NOT NULL DEFAULT 0,
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "status" "CommentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "followers" (
    "follower_id" VARCHAR(36) NOT NULL,
    "following_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("following_id","follower_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" VARCHAR(36) NOT NULL,
    "receiver_id" VARCHAR(36) NOT NULL,
    "actor_id" VARCHAR(36),
    "content" TEXT,
    "action" "NotificationAction" NOT NULL DEFAULT 'liked',
    "is_sent" BOOLEAN,
    "is_read" BOOLEAN,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_likes" (
    "post_id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id","user_id")
);

-- CreateTable
CREATE TABLE "post_saves" (
    "post_id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_saves_pkey" PRIMARY KEY ("post_id","user_id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "post_id" VARCHAR(36) NOT NULL,
    "tag_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" VARCHAR(36) NOT NULL,
    "content" TEXT NOT NULL,
    "image" VARCHAR(255),
    "author_id" VARCHAR(36) NOT NULL,
    "topic_id" VARCHAR(36) NOT NULL,
    "is_featured" BOOLEAN DEFAULT false,
    "comment_count" INTEGER DEFAULT 0,
    "liked_count" INTEGER DEFAULT 0,
    "type" "PostType" DEFAULT 'text',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "content" TEXT,
    "like_count" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "media" JSONB,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "status" "stories_status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story_likes" (
    "story_id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "story_likes_pkey" PRIMARY KEY ("story_id","user_id")
);

-- CreateTable
CREATE TABLE "story_views" (
    "story_id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("story_id","user_id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "post_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "color" VARCHAR(10) NOT NULL,
    "post_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "cover" VARCHAR(255),
    "avatar" VARCHAR(255),
    "username" VARCHAR(100) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "salt" VARCHAR(50) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "bio" VARCHAR(255),
    "website_url" VARCHAR(255),
    "follower_count" INTEGER DEFAULT 0,
    "post_count" INTEGER DEFAULT 0,
    "status" "UserStatus" DEFAULT 'active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "room_id" ON "chat_messages"("room_id");

-- CreateIndex
CREATE INDEX "sender_id" ON "chat_messages"("sender_id");

-- CreateIndex
CREATE INDEX "creatorIdIdx" ON "chat_rooms"("creator_id");

-- CreateIndex
CREATE INDEX "receiverIdIdx" ON "chat_rooms"("receiver_id");

-- CreateIndex
CREATE INDEX "parentIdIdx" ON "comments"("parent_id");

-- CreateIndex
CREATE INDEX "postIdIdx" ON "comments"("post_id");

-- CreateIndex
CREATE INDEX "statusIdx" ON "comments"("status");

-- CreateIndex
CREATE INDEX "userIdIdx" ON "comments"("user_id");

-- CreateIndex
CREATE INDEX "followerIdIdx" ON "followers"("follower_id");

-- CreateIndex
CREATE INDEX "receiver_id" ON "notifications"("receiver_id");

-- CreateIndex
CREATE INDEX "userId" ON "post_likes"("user_id");

-- CreateIndex
CREATE INDEX "postSaveUserIdIdx" ON "post_saves"("user_id");

-- CreateIndex
CREATE INDEX "tag_id" ON "post_tags"("tag_id");

-- CreateIndex
CREATE INDEX "authorIdIdx" ON "posts"("author_id");

-- CreateIndex
CREATE INDEX "isFeaturedIdx" ON "posts"("is_featured");

-- CreateIndex
CREATE UNIQUE INDEX "stories_created_at_idx" ON "stories"("created_at");

-- CreateIndex
CREATE INDEX "user_id" ON "stories"("user_id");

-- CreateIndex
CREATE INDEX "role" ON "users"("role");

-- CreateIndex
CREATE INDEX "status" ON "users"("status");
