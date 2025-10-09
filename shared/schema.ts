import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  isOnline: z.boolean().default(false),
  lastSeen: z.date(),
  createdAt: z.date(),
});

export const conversationSchema = z.object({
  id: z.string(),
  participants: z.array(z.string()),
  lastMessage: z.string().optional(),
  lastMessageTime: z.date().optional(),
  unreadCount: z.record(z.string(), z.number()),
  createdAt: z.date(),
});

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  text: z.string().optional(),
  fileUrl: z.string().optional(),
  fileType: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  timestamp: z.date(),
  status: z.enum(['sent', 'delivered', 'read']),
  reactions: z.record(z.string(), z.string()).default({}),
  editedAt: z.date().optional(),
});

export const insertUserSchema = userSchema.omit({ id: true, createdAt: true });
export const insertConversationSchema = conversationSchema.omit({ id: true, createdAt: true });
export const insertMessageSchema = messageSchema.omit({ id: true, timestamp: true });

export type User = z.infer<typeof userSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  timestamp: Date;
}

export interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}
