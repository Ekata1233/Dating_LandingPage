"use client";

import React from "react";

import ChatMain from "../desktop/ChatMain";
import MobileChatSection from "../mobile/MobileChatSection";
import Screen from "../shell/Screen";
import { useConversations } from "@/app/context/ChatContext";

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
  const { conversations, activeConversationId } = useConversations();

  const active =
    conversations.find((c) => c.conversationId === activeConversationId) ??
    null;

  const desktop = active ? (
    <ChatMain
      name={active.user.fullName}
      avatarUrl={active.user.profilePhoto}
      online={active.user.isOnline}
    />
  ) : (
    <EmptyChat />
  );

  return <Screen desktop={desktop} mobile={<MobileChatSection />} />;
}
