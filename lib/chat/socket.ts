"use client";

import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "@/utils/api";
interface ServerToClientEvents {
  "message:receive": (message: ChatMessage) => void;
}

interface ClientToServerEvents {
  "conversation:join": (payload: JoinConversationPayload) => void;
  "message:send": (payload: SendMessagePayload) => void;
}
export type MessageType = "TEXT";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  messageType?: MessageType;
}

export interface JoinConversationPayload {
  conversationId: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  messageType: MessageType;
}

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