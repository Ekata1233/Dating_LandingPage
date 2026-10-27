"use client";

import React from "react";

import ChatMain from "../desktop/ChatMain";
import ChatSideBar, { lastSeenLabel } from "../panels/ChatSideBar";
import { useConversations } from "@/app/context/ChatContext";
import type { Conversation } from "@/app/context/ChatContext";
import { toast } from "sonner";
import { useChatThread } from "../shared/chatMessages";
const C = {
  pink: "#e23a6a",
  pinkText: "#e0355f",
  pinkSoft: "#fdeef1",
  green: "#1f9254",
  greenSoft: "#e7f7ee",
  greenBadge: "#22b56b",
  ink: "#17151a",
  grey: "#8a8790",
  greyLight: "#b8b5bc",
  border: "#ececec",
  track: "#e7e5e9",
  white: "#ffffff",
};
/* -------------------------------------------------------------------------- */
/*  Chats – two-step, Tinder inbox style.                                      */
/*                                                                            */
/*  Without a selected conversation this renders the conversation list (the     */
/*  full ChatSideBar, so the "Messages" header + filter tabs show on mobile     */
/*  too); selecting one pushes the thread full screen with the same header +    */
/*  tabs pinned above the chat, plus a back chevron. Selection is shared with   */
/*  the desktop rail through ChatContext, not local UI state.                   */
/* -------------------------------------------------------------------------- */

export interface MobileChatSectionProps {
  onSelectConversation?: (conversation: Conversation) => void;
  onBackToList?: () => void;
}

const MobileChatSection: React.FC<MobileChatSectionProps> = ({
  onSelectConversation,
  onBackToList,
}) => {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    clearChat,
    deleteChat,
    loading,
    error,
    refetch,
  } = useConversations();

  const thread =
    conversations.find((c) => c.conversationId === activeConversationId) ??
    null;

  const chat = useChatThread(thread?.user.id ?? null);

  /* ------------------------------ Thread ------------------------------ */

  if (thread) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="relative min-h-0 flex-1">
          <ChatMain
            fluid
            showBack
            onBack={() => {
              selectConversation(null);
              onBackToList?.();
            }}
            userId={thread.user.id}
            name={thread.user.fullName}
            avatarUrl={thread.user.profilePhoto}
            online={thread.user.isOnline}
            lastSeenLabel={lastSeenLabel(thread.user.lastSeenAt)}
            messages={chat.chatMessages}
            messagesLoading={chat.loading}
            messagesError={chat.error}
            onRetryMessages={() => void chat.refetch()}
            hasOlderMessages={chat.hasMore}
            onLoadOlderMessages={() => void chat.loadMore()}
            loadingOlderMessages={chat.loadMoreLoading}
            onSend={chat.sendMessage}
            onClearChat={async () => {
              const ok = await clearChat(thread.conversationId);
              if (ok) {
                toast.success("Chat cleared successfully");
                void chat.refetch();
              } else {
                toast.error("Couldn't clear chat");
              }
            }}
            onDeleteConversation={async () => {
              const ok = await deleteChat(thread.conversationId);
              if (ok) {
                toast.success("Conversation deleted successfully");
                selectConversation(null);
                onBackToList?.();
              } else {
                toast.error("Couldn't delete conversation");
              }
            }}
          />
        </div>
      </div>
    );
  }

  /* --------------------------- Loading / error ------------------------- */

  if (loading && conversations.length === 0) {
    return (
            <div>
        <header
          className="px-[4.054cqw] py-[1.778cqh]"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            className="text-[7.432cqw]"
            style={{
              margin: 0,
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: C.ink }}>Mess</span>
            <span style={{ color: C.pinkText }}>ages</span>
          </h1>
        </header>
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading chats…
      </div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
            <div>
        <header
          className="px-[4.054cqw] py-[1.778cqh]"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            className="text-[7.432cqw]"
            style={{
              margin: 0,
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: C.ink }}>Mess</span>
            <span style={{ color: C.pinkText }}>ages</span>
          </h1>
        </header>
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-gray-600">{error}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-full bg-black px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div>
        <header
          className="px-[4.054cqw] py-[1.778cqh]"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            className="text-[7.432cqw]"
            style={{
              margin: 0,
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            <span style={{ color: C.ink }}>Mess</span>
            <span style={{ color: C.pinkText }}>ages</span>
          </h1>
        </header>
        <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
          No conversations yet.
        </div>
      </div>

    );
  }

  /* ------------------------------- List -------------------------------- */

  return (
    <ChatSideBar
      onSelectConversation={(id) => {
        const conversation = conversations.find(
          (c) => c.conversationId === id
        );
        if (conversation) onSelectConversation?.(conversation);
      }}
    />
  );
};

export default MobileChatSection;
