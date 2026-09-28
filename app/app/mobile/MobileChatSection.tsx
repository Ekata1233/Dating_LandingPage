"use client";

import React, { useState } from "react";

import ChatMain from "../desktop/ChatMain";
import ChatSideBar, { DEFAULT_CONVERSATIONS } from "../panels/ChatSideBar";
import type { Conversation } from "../shared/types";

/* -------------------------------------------------------------------------- */
/*  Chats – two-step, Tinder inbox style.                                      */
/*                                                                            */
/*  Without a selected conversation this renders the conversation list;         */
/*  selecting one pushes the thread full screen with a back chevron in the      */
/*  chat header. State is local UI state, not part of ActiveSectionContext.     */
/* -------------------------------------------------------------------------- */

export interface MobileChatSectionProps {
  conversations?: Conversation[];
  onSelectConversation?: (conversation: Conversation) => void;
  onBackToList?: () => void;
}

const MobileChatSection: React.FC<MobileChatSectionProps> = ({
  conversations = DEFAULT_CONVERSATIONS,
  onSelectConversation,
  onBackToList,
}) => {
  const [threadId, setThreadId] = useState<string | number | null>(null);

  const thread = conversations.find((c) => c.id === threadId) ?? null;

  if (thread) {
    return (
      <ChatMain
        fluid
        showBack
        onBack={() => {
          setThreadId(null);
          onBackToList?.();
        }}
        name={thread.name}
        avatarUrl={thread.avatarUrl}
        online={thread.unread}
      />
    );
  }

  return (
    <ChatSideBar
      conversations={conversations}
      onSelectConversation={(id) => {
        const conversation = conversations.find((c) => c.id === id);
        if (!conversation) return;
        onSelectConversation?.(conversation);
        setThreadId(id);
      }}
    />
  );
};

export default MobileChatSection;
