import { PublicUser } from "src/share";
import z from "zod";

export enum NotificationAction {
    LIKED = 'liked',
    FOLLOWED = 'followed'.
    REPLIED = 'replied',
}

export const notificationSchema = z.object({
    id: z.string().uuid(),
    receiverId: z.string().uuid(),
    actorId: z.string().uuid(),
    content: z.string(),
    action: z.nativeEnum(NotificationAction),
    isSent: z.boolean().default(false),
    isRead: z.boolean().default(false),
    createAt: z.date().default(new Date()),
    updateAt: z.date().default(new Date()),
});

export type Notification = z.infer<typeof notificationSchema> & { sender?: PublicUser; };