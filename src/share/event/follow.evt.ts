import { AppEvent } from "..";

export const EvtFollowed = 'Followed'; 
export const EvtUnfollowed = 'Unfollowed';

// Định nghĩa kiểu dữ liệu cho sự kiện Followed
export type FollowUnfollowPayload = {
  followingId: string;
};

// Sự kiện: Người dùng đã theo dõi một người dùng khác
export class FollowedEvent extends AppEvent<FollowUnfollowPayload> {
  // Tạo sự kiện
  static create(payload: FollowUnfollowPayload, senderId: string) {
    return new FollowedEvent(EvtFollowed, payload, { senderId });
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new FollowedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}

// Sự kiện: Người dùng đã bỏ theo dõi một người dùng khác
export class UnfollowedEvent extends AppEvent<FollowUnfollowPayload> {
  // Tạo sự kiện
  static create(payload: FollowUnfollowPayload, senderId: string) {
    return new UnfollowedEvent(EvtUnfollowed, payload, { senderId });
  }

  // Chuyển đổi dữ liệu từ JSON sang đối tượng sự kiện
  static from(json: any) {
    const { eventName, payload, id, occurredAt, senderId } = json;
    return new UnfollowedEvent(eventName, payload, { id, occurredAt, senderId });
  }
}