import { z } from "zod";

// Định nghĩa lỗi
export const ErrPostNotFound = new Error("Post not found");
export const ErrPostAlreadySaved = new Error("Post already saved");
export const ErrPostHasNotSaved = new Error("Post has not saved");

// Schema cho lưu bài viết
export const postSaveSchema = z.object({
    userId: z.string().uuid(),
    postId: z.string().uuid(),
    createdAt: z.date().default(new Date()),
});

// Kiểu dữ liệu của lưu bài viết
export type PostSave = z.infer<typeof postSaveSchema>;

// Schema cho DTO lưu bài viết
export const actionDTOSchema = z.object({
    userId: z.string().uuid(),
    postId: z.string().uuid(),
})

// Kiểu dữ liệu của DTO lưu bài viết
export type ActionDTO = z.infer<typeof actionDTOSchema>;
