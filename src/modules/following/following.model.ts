import { PublicUser } from "src/share";
import { z } from "zod";

// Lỗi thông tin
export const ErrFollowYourself = new Error('You cannot follow yourself');
export const ErrAlreadyFollowed = new Error('You have already followed this user');
export const ErrFollowNotFound = new Error('Follow relationship not found');

// Schema cho dữ liệu theo dõi
export const followDTOSchema = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid()
});

//  Kiểu dữ liệu cho dữ liệu theo dõi
export type FollowDTO = z.infer<typeof followDTOSchema>;

// Schema cho điều kiện lọc dữ liệu theo dõi
export const followCondDTOSchema = z.object({
  followingId: z.string().uuid().optional(),
  followerId: z.string().uuid().optional()
});

//  Kiểu dữ liệu cho điều kiện lọc dữ liệu theo dõi
export type FollowCondDTO = z.infer<typeof followCondDTOSchema>;

// Schema cho dữ liệu theo dõi
export const followSchema = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid(),
  createdAt: z.date().default(new Date())
});

//  Kiểu dữ liệu cho dữ liệu theo dõi
export type Follow = z.infer<typeof followSchema>;

// Schema cho dữ liệu người theo dõi
export type Follower = PublicUser & {
  hasFollowedBack: boolean;
  followedAt: Date;
};