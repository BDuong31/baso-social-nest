import { z } from "zod";

// Lỗi thông tin
export const ErrCommentNotFound = new Error('Comment not found');
export const ErrCommentAlreadyLiked = new Error('Comment already liked');
export const ErrCommentHasNotLiked = new Error('Comment has not liked');

// Schema cho dữ liệu like bình luận
export const cmtLikeSchema = z.object({
    userId: z.string().uuid(),
    commentId: z.string().uuid(),
    createdAt: z.date().default(new Date()),
});

//  Kiểu dữ liệu cho dữ liệu like bình luận
export type CommentLike = z.infer<typeof cmtLikeSchema>;

// Schema cho dữ liệu hành động like bình luận
export const actionDTOSchema = cmtLikeSchema.pick({ 
    userId: true,
    commentId: true,
});

//  Kiểu dữ liệu cho dữ liệu hành động like bình luận
export type ActionDTO = z.infer<typeof actionDTOSchema>;