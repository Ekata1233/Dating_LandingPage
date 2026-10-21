"use client";

import { useMemo } from "react";

import {
  useChatMessages,
  type Message,
  type MessageType,
} from "@/app/context/ChatContext";
import type {
  CardMessage,
  ChatMessage,
  GiftMessage,
  TextMessage,
} from "../desktop/ChatMain";

/* -------------------------------------------------------------------------- */
/*  Chat history → frontend message mapping                                    */
/*                                                                            */
/*  The backend returns `Message` rows (cursor paginated, newest page first).  */
/*  The thread renders `ChatMessage` cards: plain text bubbles plus simple     */
/*  cards for roses, gifts, compliments, images and system events. Direction   */
/*  ("me" vs "them") is derived by comparing `senderId` with the active        */
/*  conversation's counterpart user.                                           */
/* -------------------------------------------------------------------------- */

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function metaString(
  meta: Record<string, unknown> | null | undefined,
  key: string
): string | undefined {
  const value = meta?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function metaNumber(
  meta: Record<string, unknown> | null | undefined,
  key: string
): number | undefined {
  const value = meta?.[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

const SYSTEM_TITLES: Partial<Record<MessageType, string>> = {
  DATE_CONFIRMED: "Date confirmed",
  RELATIONSHIP_TAG_PROPOSAL: "Relationship tag proposal",
  ENGAGEMENT: "Engagement",
};

/**
 * Maps one page (or the merged thread) of API messages to the shapes the
 * chat UI renders. Input order is irrelevant — output keeps it as-is, so
 * pass the context's already-sorted `messages`.
 */
export function mapApiMessages(
  messages: Message[],
  counterpartId?: string | null
): ChatMessage[] {
  return messages.map((m): ChatMessage => {
    const from: "me" | "them" =
      counterpartId && m.senderId === counterpartId ? "them" : "me";
    const time = formatTime(m.createdAt);
    const read = !!m.readAt;
    const status =
      from === "me"
        ? m.readAt
          ? "Read"
          : m.deliveredAt
            ? "Delivered"
            : "Sent"
        : "Received";

    /* Compliments arrive as their own sub-object. */
    if (m.compliment) {
      const card: CardMessage = {
        kind: "compliment",
        id: m.id,
        from,
        title: m.compliment.message.trim() || "Compliment",
        time,
        status,
        read,
      };
      return card;
    }

    switch (m.messageType) {
      case "IMAGE": {
        const card: CardMessage = {
          kind: "image",
          id: m.id,
          from,
          title: m.content?.trim() || "Photo",
          imageUrl: m.mediaUrl ?? undefined,
          time,
          status,
          read,
        };
        return card;
      }

      case "ROSE": {
        const card: CardMessage = {
          kind: "rose",
          id: m.id,
          from,
          title:
            (from === "me" ? "Rose sent" : "Rose received"),
          subtitle: metaString(m.metadata, "roseName"),
          time,
          status,
          read,
        };
        return card;
      }

      case "GIFT": {
        const gift: GiftMessage = {
          kind: "gift",
          id: m.id,
          from,
          giftName:
            metaString(m.metadata, "giftName") ||
            m.content?.trim() ||
            "Gift",
          note: metaString(m.metadata, "note"),
          imageUrl: m.mediaUrl ?? undefined,
          coinsSpent: metaNumber(m.metadata, "coinsSpent"),
          repliesDone: metaNumber(m.metadata, "repliesDone"),
          repliesNeeded: metaNumber(m.metadata, "repliesNeeded"),
          time,
          read,
        };
        return gift;
      }

      case "DATE_CONFIRMED":
      case "RELATIONSHIP_TAG_PROPOSAL":
      case "ENGAGEMENT": {
        const card: CardMessage = {
          kind: "event",
          id: m.id,
          from,
          title: SYSTEM_TITLES[m.messageType] ?? "Update",
          subtitle: m.content?.trim() || undefined,
          time,
          status,
          read,
        };
        return card;
      }

      default: {
        const text: TextMessage = {
          kind: "text",
          id: m.id,
          from,
          text: m.content ?? "",
          time,
          read,
        };
        return text;
      }
    }
  });
}

/**
 * Everything a chat screen needs: the mapped thread plus its pagination.
 * The provider already fetches when the active conversation changes, so
 * this hook only wires the mapper on top of `useChatMessages()`.
 */
export function useChatThread(counterpartId?: string | null) {
  const {
    messages,
    loading,
    error,
    status,
    refetch,
    hasMore,
    loadMore,
    loadMoreLoading,
    loadMoreError,
  } = useChatMessages();

  const chatMessages = useMemo(
    () => mapApiMessages(messages, counterpartId),
    [messages, counterpartId]
  );

  return {
    chatMessages,
    loading,
    error,
    status,
    refetch,
    hasMore,
    loadMore,
    loadMoreLoading,
    loadMoreError,
  };
}
