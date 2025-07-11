import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi, type Message, type Conversation } from '@/lib/api';

export function useChat() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
  });

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', currentConversationId],
    queryFn: () => currentConversationId ? chatApi.getMessages(currentConversationId) : [],
    enabled: !!currentConversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ message, conversationId }: { message: string; conversationId?: number }) =>
      chatApi.sendMessage(message, conversationId),
    onSuccess: (data) => {
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Update messages for current conversation
      if (data.conversationId) {
        setCurrentConversationId(data.conversationId);
        queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      }
      
      // Update progress
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const sendMessage = (message: string, conversationId?: number) => {
    return sendMessageMutation.mutateAsync({ message, conversationId });
  };

  const selectConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
  };

  return {
    conversations,
    messages,
    currentConversationId,
    isLoadingConversations,
    isLoadingMessages,
    isSendingMessage: sendMessageMutation.isPending,
    sendMessage,
    selectConversation,
    startNewConversation,
    sendMessageError: sendMessageMutation.error,
  };
}
