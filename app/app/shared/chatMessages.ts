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
  LockedMessage,
  MessageKind,
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
/*                                                                            */
/*  Only plain text is ever shown on the web: right before the thread reads    */
/*  the list, `lockRichMessages` swaps every other kind for a `LockedMessage`, */
/*  whose bubble glitters and tells the member to open the app.                */
/* -------------------------------------------------------------------------- */

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function localDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function dayKeyOf(iso: string): string | undefined {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : localDayKey(date);
}

export function formatDayHeading(dayKey: string): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dayKey === localDayKey(now)) return "Today";
  if (dayKey === localDayKey(yesterday)) return "Yesterday";
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
        delivered: !!m.deliveredAt,
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
          delivered: !!m.deliveredAt,
          read,
        };
        return gift;
      }

      case "DATE_CONFIRMED":{
        const card: CardMessage = {
          kind: "date",
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
      case "RELATIONSHIP_TAG_PROPOSAL":{
        const card: CardMessage = {
          kind: "relationshipTag",
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
      case "RELATIONSHIP_TAG_ACCEPTED":{
        const card: CardMessage = {
          kind: "relationshipTag",
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
      case "EVENT_INVITE":{
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
      case "DATE_INVITE":{
        const card: CardMessage = {
          kind: "date",
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
      case "ENGAGEMENT": {
        const card: CardMessage = {
          kind: "relationshipTag",
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
          delivered: !!m.deliveredAt,
          read,
        };
        return text;
      }
    }
  });
}

/** What the locked bubble calls each rich message kind. */
const RICH_LABELS: Record<Exclude<MessageKind, "text" | "locked">, string> = {
  gift: "Gift",
  rose: "Rose",
  compliment: "Compliment",
  image: "Photo",
  event: "Event",
  relationshipTag: "Relationship Tag",
  date: "Date",
};

/**
 * Web render policy: only plain text bubbles show their content. Everything
 * else (photos, gifts, roses, compliments, system events) is swapped for a
 * `LockedMessage`, which the thread renders as a glittering bubble pointing
 * the member at the app — see `LockedBubble` in ChatMain.
 */
function lockRichMessages(items: ChatMessage[]): ChatMessage[] {
  return items.map((item): ChatMessage => {
    if (item.kind === "text" || item.kind === "locked") return item;

    const locked: LockedMessage = {
      kind: "locked",
      id: item.id,
      from: item.from,
      label: RICH_LABELS[item.kind],
      time: item.time,
      status: "status" in item ? item.status : undefined,
      delivered: item.delivered,
      read: item.read,
    };
    return locked;
  });
}

/**
 * Everything a chat screen needs: the mapped thread plus its pagination.
 * The provider already fetches when the active conversation changes, so
 * this hook only wires the mapper on top of `useChatMessages()`.
 *
 * `sendMessage` goes out over the chat socket and appends an optimistic
 * bubble; live rows arrive through the same provider, so the thread updates
 * without a refetch.
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
    sendMessage,
    socketConnected,
  } = useChatMessages();

  const chatMessages = useMemo(() => {
    const mapped = lockRichMessages(mapApiMessages(messages, counterpartId));
    const dayById = new Map<string, string>();
    for (const m of messages) {
      const key = dayKeyOf(m.createdAt);
      if (key) dayById.set(m.id, key);
    }
    if (dayById.size === 0) return mapped;
    return mapped.map((item): ChatMessage => {
      const dayKey = dayById.get(String(item.id));
      return dayKey ? { ...item, dayKey } : item;
    });
  }, [messages, counterpartId]);

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
    sendMessage,
    socketConnected,
  };
}
