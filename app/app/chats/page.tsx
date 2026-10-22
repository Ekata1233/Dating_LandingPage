"use client";

import React from "react";

import ChatMain from "../desktop/ChatMain";
import MobileChatSection from "../mobile/MobileChatSection";
import Screen from "../shell/Screen";
import { useConversations } from "@/app/context/ChatContext";
import { useChatThread } from "../shared/chatMessages";


function EmptyChat() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <p className="text-sm text-gray-400">
        Select a conversation to start chatting.
      </p>
    </div>
  );
}

export default function Page() {
  const { conversations, activeConversationId,clearChat,clearChatError,deleteChat,deleteChatError } = useConversations();
  function handleOnReport(){
  }
  function handleOnDelete(){
  
  }
  const active =
    conversations.find((c) => c.conversationId === activeConversationId) ??
    null;

  const thread = useChatThread(active?.user.id ?? null);

  const desktop = active ? (
    <ChatMain
      userId={active.user.id}
      name={active.user.fullName}
      avatarUrl={active.user.profilePhoto}
      online={active.user.isOnline}
      messages={thread.chatMessages}
      messagesLoading={thread.loading}
      messagesError={thread.error}
      onRetryMessages={() => void thread.refetch()}
      hasOlderMessages={thread.hasMore}
      onLoadOlderMessages={() => void thread.loadMore()}
      loadingOlderMessages={thread.loadMoreLoading}
    />
  ) : (
    <EmptyChat />
  );

  return <Screen desktop={desktop} mobile={<MobileChatSection />} />;
}
