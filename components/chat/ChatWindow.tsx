"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Bot, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { toggleChat, sendChatMessage, clearError, addSocketMessage, setIsLoading } from "@/lib/redux/features/chat/chatSlice";
import { useSocket } from "../providers/SocketProvider";
import { getSocket, isSocketConnected } from "@/lib/socket";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import SuggestedMessages from "./SuggestedMessages";

interface ChatWindowProps {
  user: any;
}

export default function ChatWindow({ user }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const { messages, isLoading, isOpen, error } = useAppSelector((state) => state.chat);
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null);

  // All possible suggested messages
  const allSuggestedMessages = [
    "hey assistant",
    "Show me my cart",
    "Track my order",
    "Any offers?",
    "Find Shoes",
    "Any discounts?",
    "show me cart",
    "Find accessories",
    "What can you do?",
    "Show my saved items",
    "What are the best rated items?",
    "Apply coupon",
    "Looking for home decor",
    "Find a Fragrance",
    "Move to cart",
    "Find Chair",
    "Show electronic",
    "For kids ?",
    "For makeup ?",
    "For groceries ?",
    "Looking for Sport",
    "Need jewelery",
    "Do you have any deals?",
    "Top rated products",
    "Guide me",
    "Please Find a skincare",
    "Looking for utensil",
    "Find Toys",
    "Show liked products",
    "Go to wishlist",
    "What are your capabilities ?"
  ];

  // Socket listeners
  useEffect(() => {
    if (!socket) {
      console.log('No socket available');
      return;
    }

    const handleReceiveMessage = (data: any) => {
      
      // Clear any pending timeout
      if (messageTimeout) {
        clearTimeout(messageTimeout);
        setMessageTimeout(null);
      }
      
      // Add the message to Redux
      dispatch(addSocketMessage({
        id: data.id || Date.now().toString(),
        role: 'assistant',
        content: data.content,
        timestamp: data.timestamp || Date.now(),
        products: data.products || [],
      }));
      
      // Turn off loading state
      dispatch(setIsLoading(false));
    };

    const handleError = (error: any) => {
      console.error(' Socket error:', error);
      dispatch(setIsLoading(false));
      if (messageTimeout) {
        clearTimeout(messageTimeout);
        setMessageTimeout(null);
      }
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('error', handleError);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('error', handleError);
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [socket, dispatch, messageTimeout]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Set initial suggested messages
  useEffect(() => {
    // Always show the 4 initial messages
    setSuggestedMessages([
      "hey assistant",
      "Show me my cart",
      "Track my order",
      "Any offers?"
    ]);
  }, []);

  // Function to refresh suggested messages randomly
  const refreshSuggestedMessages = () => {
    // Filter out the initial messages to avoid duplicates
    const otherMessages = allSuggestedMessages.filter(msg => 
      !["hey assistant", "Show me my cart", "Track my order", "Any offers?"].includes(msg)
    );
    
    // Shuffle the array and pick 4 random messages
    const shuffled = [...otherMessages].sort(() => 0.5 - Math.random());
    const randomFour = shuffled.slice(0, 4);
    
    setSuggestedMessages(randomFour);
  };

  // Refresh messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSuggestedMessages();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (message: string) => {
    
    // Add user message to Redux
    dispatch({
      type: 'chat/addMessage',
      payload: {
        role: 'user',
        content: message,
      },
    });

    // Set loading state
    dispatch(setIsLoading(true));

    // Try socket first
    const socketInstance = getSocket();
    if (socketInstance?.connected) {
      socketInstance.emit('send-message', {
        message,
        userId: user?._id || user?.uid,
        token: localStorage.getItem('authToken'),
      });
      
      // Set a timeout to check if response is received
      const timeoutId = setTimeout(() => {
        dispatch(sendChatMessage(message));
      }, 5000);
      
      setMessageTimeout(timeoutId);
      
    } else {
      // Fallback to HTTP
      console.log('⚠️ Socket not connected, using HTTP');
      dispatch(sendChatMessage(message));
    }

    // Refresh suggested messages after sending
    refreshSuggestedMessages();
  };

  const handleTyping = (isTyping: boolean) => {
    setIsUserTyping(isTyping);
    const socketInstance = getSocket();
    if (socketInstance?.connected) {
      socketInstance.emit('typing', isTyping);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-w-[400px] h-[500px] sm:h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#5D5FEF] to-[#868CFF] text-white flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot size={16} className="sm:w-[18px] sm:h-[18px] text-white" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold">Flash Flow Assistant</h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <p className="text-[10px] sm:text-xs text-white/80">
                {isSocketConnected() ? 'Online' : 'Offline'}
              </p>
              {isSocketConnected() ? (
                <Wifi size={10} className="sm:w-3 sm:h-3 text-green-300" />
              ) : (
                <WifiOff size={10} className="sm:w-3 sm:h-3 text-yellow-300" />
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => dispatch(toggleChat())} 
          className="p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isLoading && (
          <div className="flex gap-2 sm:gap-3 mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] flex items-center justify-center">
              <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-none px-3 sm:px-4 py-2 sm:py-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4">
            <p className="text-xs sm:text-sm text-red-600">{error}</p>
            <button 
              onClick={() => dispatch(clearError())} 
              className="text-[10px] sm:text-xs text-red-500 hover:underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Messages */}
      {suggestedMessages.length > 0 && !isLoading && (
        <SuggestedMessages
          messages={suggestedMessages}
          onSelectMessage={handleSendMessage}
        />
      )}

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!user}
        onTyping={handleTyping}
      />
    </motion.div>
  );
}