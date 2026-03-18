"use client";

import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  onTyping?: (isTyping: boolean) => void;
}

export default function ChatInput({ onSendMessage, isLoading, disabled, onTyping }: ChatInputProps) {
  const [message, setMessage] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  }, [message]);

  const handleTyping = () => {
    if (onTyping) {
      onTyping(true);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleSend = () => {
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Stop typing indicator
      if (onTyping) {
        onTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 sm:p-4 border-t border-gray-100 bg-white">
      <div className="flex items-end gap-1 sm:gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Please log in to chat" : "Type your message..."}
            rows={1}
            disabled={isLoading || disabled}
            className="w-full px-3 overflow-hidden sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 rounded-xl text-sm sm:text-base border border-gray-200 focus:outline-none focus:border-[#5D5FEF] focus:ring-2 focus:ring-[#5D5FEF]/20 resize-none max-h-24 sm:max-h-32 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={!message.trim() || isLoading || disabled}
          className="p-2 sm:p-3 bg-[#5D5FEF] mb-1 sm:mb-2.5 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4B4DC9] transition-colors flex-shrink-0"
        >
          <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
        </motion.button>
      </div>
      
      {disabled && (
        <p className="text-[10px] sm:text-xs text-red-500 mt-1 sm:mt-2 text-center">
          Please log in to use the chat assistant
        </p>
      )}
    </div>
  );
}