"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  };
}

const ChatMessage = memo(({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 sm:gap-3 mb-3 sm:mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] flex items-center justify-center flex-shrink-0">
          <Bot size={12} className="sm:w-4 sm:h-4 text-white" />
        </div>
      )}
      
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 ${
          isUser
            ? 'bg-[#5D5FEF] text-white rounded-tr-none'
            : 'bg-gray-100 text-gray-800 rounded-tl-none'
        }`}
      >
        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
        <p
          className={`text-[8px] sm:text-[10px] mt-0.5 sm:mt-1 ${
            isUser ? 'text-indigo-200' : 'text-gray-500'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {isUser && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0">
          <User size={12} className="sm:w-4 sm:h-4 text-white" />
        </div>
      )}
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';
export default ChatMessage;