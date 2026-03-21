"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
const { Bot, User } = Icons;

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    buttons?: Array<{ label: string; action: string; metadata?: any; icon?: string }>;
  };
  onActionClick?: (action: string, metadata: any, label: string) => void;
  isLatest?: boolean; // Only enable buttons on the latest message
}

const ChatMessage = memo(({ message, onActionClick, isLatest }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 sm:gap-3 mb-3 sm:mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] flex items-center justify-center flex-shrink-0 mt-1">
          <Bot size={12} className="sm:w-4 sm:h-4 text-white" />
        </div>
      )}
      
      <div className={`flex flex-col max-w-[85%] sm:max-w-[80%]`}>
        <div
          className={`rounded-2xl px-3 sm:px-4 py-1.5 sm:py-2 ${
            isUser
              ? 'bg-[#5D5FEF] text-white rounded-tr-none'
              : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none'
          }`}
        >
          <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
          <p
            className={`text-[8px] sm:text-[10px] mt-0.5 sm:mt-1 ${
              isUser ? 'text-indigo-200' : 'text-gray-400'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Render Buttons if present */}
        {!isUser && message.buttons && message.buttons.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.buttons.map((btn, idx) => {
              const LucideIcon = btn.icon ? (Icons as any)[btn.icon] : null;
              return (
                <button
                  key={idx}
                  onClick={() => onActionClick && isLatest && onActionClick(btn.action, btn.metadata || {}, btn.label)}
                  disabled={!isLatest}
                  className={`flex items-center justify-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 rounded-xl border transition-all ${
                    isLatest
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 active:scale-95'
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed hidden'
                  }`}
                >
                  {LucideIcon && <LucideIcon size={14} />}
                  {btn.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-1">
          <User size={12} className="sm:w-4 sm:h-4 text-indigo-700" />
        </div>
      )}
    </motion.div>
  );
});

ChatMessage.displayName = 'ChatMessage';
export default ChatMessage;