import z from "zod";

// Lỗi thông tin
export const ErrInvalidContent = new Error('Content must be at least 1 character long');
export const ErrCannotEmpty = new Error('Content cannot be empty');
export const ErrInvalidParentId = new Error('Invalid parent id');
export const ErrPostNotFound = new Error('Post not found');

// Trạng thái của bình luận
export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELETED = 'deleted',
  SPAM = 'spam'
}

// Schema cho dữ liệu bình luận
export const commentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  postId: z.string().uuid(),
  parentId: z.string().uuid().nullable().optional(),
  content: z.string().min(1, ErrInvalidContent.message),
  likedCount: z.number().int().nonnegative().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: z.nativeEnum(CommentStatus).default(CommentStatus.APPROVED),
  replyCount: z.number().int().nonnegative().default(0)
});

// Kiểu dữ liệu cho dữ liệu bình luận
export type Comment = z.infer<typeof commentSchema>;

// Schema cho dữ liệu tạo mới bình luận
export const commentCreateDTOSchema = commentSchema.pick({
  userId: true,
  postId: true,
  parentId: true,
  content: true,
});

// Kiểu dữ liệu cho dữ liệu tạo mới bình luận
export type CommentCreateDTO = z.infer<typeof commentCreateDTOSchema>;

// Schema cho dữ liệu cập nhật bình luận
export const commentUpdateDTOSchema = commentSchema.pick({
  content: true,
}).partial();

// Kiểu dữ liệu cho dữ liệu cập nhật bình luận
export type CommentUpdateDTO = z.infer<typeof commentUpdateDTOSchema>;

// Schema cho điều kiện tìm kiếm bình luận
export const commentCondDTOSchema = commentSchema.pick({
  postId: true,
  parentId: true,
}).partial();

// Kiểu dữ liệu cho điều kiện tìm kiếm bình luận
export type CommentCondDTO = z.infer<typeof commentCondDTOSchema>;
