"use client";

import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/utils/api";
import { MessageType } from "@/app/context/ChatContext";
interface ServerToClientEvents {
  "message:receive": (message: ChatMessage) => void;
  /** Server → sender: the counterpart's client acknowledged delivery. */
  "message:delivered": (payload: MessageReceiptPayload) => void;
  /** Server → sender: the counterpart's client has read the message. */
  "message:read": (payload: MessageReceiptPayload) => void;
  /** Server → everyone: some user's presence became ONLINE. */
  "user:online": (payload: PresencePayload) => void;
  /** Server → everyone: some user's presence became OFFLINE. */
  "user:offline": (payload: PresencePayload) => void;
}

interface ClientToServerEvents {
  "conversation:join": (payload: JoinConversationPayload) => void;
  "message:send": (payload: SendMessagePayload) => void;
  /** Client → server: the receiver's client received this message. */
  "message:delivered": (payload: MessageReceiptPayload) => void;
  /** Client → server: the receiver's client opened/read this message. */
  "message:read": (payload: MessageReceiptPayload) => void;
  /** Client → server: no payload — keeps our presence key warm in Redis. */
  "presence:heartbeat": () => void;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  messageType?: MessageType;
  deliveredAt?: string | null;
  readAt?: string | null;
}

export interface JoinConversationPayload {
  conversationId: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  messageType: MessageType;
}

/**
 * Receipt for a single message. The client → server request carries only the
 * two ids (`message:delivered` / `message:read`); a server → client relay may
 * add the timestamps it stamped, which is what the sender's UI renders.
 */
export interface MessageReceiptPayload {
  conversationId: string;
  messageId: string;
  deliveredAt?: string | null;
  readAt?: string | null;
}

/** Broadcast of one member's presence (`user:online` / `user:offline`). */
export interface PresencePayload {
  userId: string;
  status: "ONLINE" | "OFFLINE";
  /** Set when going OFFLINE; `null` while online. */
  lastSeenAt: string | null;
}

/**
 * DOM event carrying `PresencePayload` from the module that owns the socket
 * (`ChatContext`) to every other context that shows presence — the feed's
 * `UsersContext` listens for it. Mirrors the `welvors-auth-change` pattern.
 */
export const PRESENCE_EVENT = "welvors-presence";

export type ChatSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

let socket: ChatSocket | null = null;

export function connectChatSocket(token: string): ChatSocket {
  if (!socket) {
    socket = io(
      API_BASE_URL as string,
      {
        autoConnect: false,
        auth: { token },
      }
    );
  }

  // Update credentials if the token changes.
  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}