import z from "zod";

// Định nghĩa lỗi
export const ErrTopicNotFound = new Error("Topic not found");
export const ErrTopicNameInvalid = new Error("Topic name is invalid, must be at least 3 characters");
export const ErrTopicNameAlreadyExists = new Error("Topic name already exists");
export const ErrTopicColorInvalid = new Error("Topic color is invalid, must be a valid hex color code");

// Schema cho chủ đề
export const topicSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, ErrTopicNameInvalid.message),
  postCount: z.number().int().nonnegative().default(0),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/i, ErrTopicColorInvalid.message).default('#008000'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu của chủ đề
export type Topic = z.infer<typeof topicSchema>;

// Schema cho tạo chủ đề
export const topicCreationDTOSchema = topicSchema.pick({ name: true, color: true });

// Kiểu dữ liệu của DTO tạo chủ đề
export type TopicCreationDTO = z.infer<typeof topicCreationDTOSchema>;

// Schema cho cập nhật chủ đề
export const topicUpdateDTOSchema = topicSchema.pick({ name: true, color: true }).partial();

// Kiểu dữ liệu của DTO cập nhật chủ đề
export type TopicUpdateDTO = z.infer<typeof topicUpdateDTOSchema>;

// Schema cho điều kiện tìm kiếm chủ đề
export const topicCondDTOSchema = z.object({
  name: z.string().optional(),
});

// Kiểu dữ liệu của DTO điều kiện tìm kiếm chủ đề
export type TopicCondDTO = z.infer<typeof topicCondDTOSchema>;
