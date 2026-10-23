"use client";

import React from "react";

import ChatMain from "../desktop/ChatMain";
import ChatSideBar from "../panels/ChatSideBar";
import { useConversations } from "@/app/context/ChatContext";
import type { Conversation } from "@/app/context/ChatContext";
import { useChatThread } from "../shared/chatMessages";

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
            messages={chat.chatMessages}
            messagesLoading={chat.loading}
            messagesError={chat.error}
            onRetryMessages={() => void chat.refetch()}
            hasOlderMessages={chat.hasMore}
            onLoadOlderMessages={() => void chat.loadMore()}
            loadingOlderMessages={chat.loadMoreLoading}
            onSend={chat.sendMessage}
          />
        </div>
      </div>
    );
  }

  /* --------------------------- Loading / error ------------------------- */

  if (loading && conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading chats…
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
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
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
        No conversations yet.
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
