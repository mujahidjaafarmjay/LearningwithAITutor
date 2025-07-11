import { useState, useEffect, useRef } from 'react';
import { useChat } from '@/hooks/use-chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Mic, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const {
    messages,
    currentConversationId,
    isSendingMessage,
    sendMessage,
    startNewConversation,
    sendMessageError,
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim() || isSendingMessage) return;

    const currentMessage = message;
    setMessage('');
    setIsTyping(true);

    try {
      await sendMessage(currentMessage, currentConversationId || undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">AI Tutor</h3>
              <p className="text-sm text-slate-600">Ready to help you learn</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Circle className="w-2 h-2 text-secondary fill-current" />
            <span className="text-sm text-slate-600">Online</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full p-6">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-4 max-w-md">
                  <p className="text-slate-700">
                    Hi! I'm your AI tutor. What would you like to learn today? I can help you with programming, 
                    mathematics, science, and many other subjects.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 message-fade-in ${
                  msg.role === 'user' ? 'justify-end' : ''
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`rounded-2xl p-4 max-w-md ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-slate-50 text-slate-700 rounded-tl-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.role === 'assistant' && msg.content.includes('```') && (
                    <div className="mt-3 p-3 bg-slate-100 rounded-lg">
                      <code className="text-sm text-slate-800">
                        {msg.content.split('```')[1]}
                      </code>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder="Ask me anything about learning..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pr-12 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isSendingMessage}
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-primary"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSendingMessage}
              className="rounded-full px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
