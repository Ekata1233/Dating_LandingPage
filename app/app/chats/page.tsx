"use client";

import React from "react";

import ChatMain from "../desktop/ChatMain";
import MobileChatSection from "../mobile/MobileChatSection";
import Screen from "../shell/Screen";
import { useConversations } from "@/app/context/ChatContext";
import { useChatThread } from "../shared/chatMessages";
import { toast } from "sonner";


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
  const active =
  conversations.find((c) => c.conversationId === activeConversationId) ??
  null;
  async function handleClearChat(){
    if(active?.conversationId){
      const response = await clearChat(active?.conversationId)
      if(response){
        toast.success("Chat Cleared Succesfully");
      }
      else{
        toast.success("Could't Deleted Chat");
      }
    }
  }
  async function handleOnDelete(){
      if(active?.conversationId){
      const response = await deleteChat(active?.conversationId)
      if(response){
        toast.success("Chat Cleared Succesfully");
      }
      else{
        toast.success("Could't Clear Chat");
      }
    }
  }
  
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
      onSend={thread.sendMessage}
      onClearChat={handleClearChat}
      onDeleteConversation={handleOnDelete}
    />
  ) : (
    <EmptyChat />
  );

  return <Screen desktop={desktop} mobile={<MobileChatSection />} />;
}
