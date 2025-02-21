import { z } from "zod";

// Định nghĩa lỗi
export const ErrPostNotFound = new Error("Post not found");
export const ErrPostAlreadyLiked = new Error("Post already liked");
export const ErrPostHasNotLiked = new Error("Post has not liked");

// Schema cho lưu bài viết
export const postLikeSchema = z.object({
    userId: z.string().uuid(),
    postId: z.string().uuid(),
    createdAt: z.date().default(new Date()),
});

// Kiểu dữ liệu của lưu bài viết
export type PostLike = z.infer<typeof postLikeSchema>;

// Schema cho DTO lưu bài viết
export const actionDTOSchema = postLikeSchema.pick({ 
    userId: true,
    postId: true,
});

// Kiểu dữ liệu của DTO lưu bài viết
export type ActionDTO = z.infer<typeof actionDTOSchema>;