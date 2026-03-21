"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, Bot, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { applyPromoCode } from "@/lib/redux/features/cart/cartSlice";
import { toggleChat, sendChatMessage, clearError, addSocketMessage, setIsLoading } from "@/lib/redux/features/chat/chatSlice";
import { useSocket } from "../providers/SocketProvider";
import { getSocket, isSocketConnected } from "@/lib/socket";
import ChatMessage from "./ChatMessage";

interface ChatWindowProps {
  user: any;
}

export default function ChatWindow({ user }: ChatWindowProps) {
  const dispatch = useAppDispatch();
  const { messages, isLoading, isOpen, error } = useAppSelector((state) => state.chat);
  const cartState = useAppSelector((state) => state.cart);
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageTimeout, setMessageTimeout] = useState<NodeJS.Timeout | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate or retrieve session ID for guest users
    let storedSession = localStorage.getItem('chatSessionId');
    if (!storedSession) {
      storedSession = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('chatSessionId', storedSession);
    }
    setSessionId(storedSession);
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data: any) => {
      if (messageTimeout) {
        clearTimeout(messageTimeout);
        setMessageTimeout(null);
      }
      
      dispatch(addSocketMessage({
        id: data.id || Date.now().toString(),
        role: 'assistant',
        content: data.content,
        buttons: data.buttons || [],
        timestamp: data.timestamp || Date.now(),
        products: data.products || [],
      }));
      dispatch(setIsLoading(false));
    };

    const handleError = (error: any) => {
      console.error('Socket error:', error);
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
      if (messageTimeout) clearTimeout(messageTimeout);
    };
  }, [socket, dispatch, messageTimeout]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleActionClick = (action: string, metadata: any = {}, label: string = '') => {
    // Guards to prevent promo overrides
    if (action === 'NAV_OFFERS' && cartState.promoCode) {
      dispatch({
        type: 'chat/addMessage',
        payload: { 
          role: 'assistant', 
          content: `Promo code ${cartState.promoCode} is already applied to your cart!`, 
          buttons: [{ label: 'Back', action: 'BACK', icon: 'ArrowLeft' }] 
        },
      });
      return;
    }

    if (action === 'APPLY_PROMO' && metadata.code) {
      if (cartState.promoCode) {
        dispatch({
          type: 'chat/addMessage',
          payload: { 
            role: 'assistant', 
            content: `Promo code ${cartState.promoCode} is already applied!`, 
            buttons: [{ label: 'Back', action: 'BACK', icon: 'ArrowLeft' }] 
          },
        });
        return;
      }
      dispatch(applyPromoCode({ code: metadata.code, cartTotal: cartState.total }));
    }

    // If it's a reset action, don't show the user bubble
    if (action !== 'RESET') {
      dispatch({
        type: 'chat/addMessage',
        payload: { role: 'user', content: label },
      });
    }

    dispatch(setIsLoading(true));

    const socketInstance = getSocket();
    const payload = {
      action,
      metadata,
      userId: user?._id || user?.uid,
      sessionId,
      token: localStorage.getItem('authToken'),
    };

    if (socketInstance?.connected) {
      socketInstance.emit('send-message', payload);
      
      const timeoutId = setTimeout(() => {
        // Fallback to HTTP if socket doesn't respond in 5s
        dispatch(sendChatMessage(payload));
      }, 5000);
      setMessageTimeout(timeoutId);
    } else {
      console.log('⚠️ Socket not connected, using HTTP');
      dispatch(sendChatMessage(payload));
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
      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#5D5FEF] to-[#868CFF] text-white flex items-center justify-between shadow-sm z-10">
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
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleActionClick('RESET', {}, 'Restart')}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            title="Restart flow"
          >
            <RefreshCw size={14} className="sm:w-4 sm:h-4 text-white" />
          </button>
          <button 
            onClick={() => dispatch(toggleChat())} 
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-1"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50/50">
        {messages.map((message, index) => (
          <ChatMessage 
            key={message.id} 
            message={message} 
            onActionClick={handleActionClick}
            isLatest={index === messages.length - 1 && !isLoading}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-2 sm:gap-3 mb-4">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#5D5FEF] to-[#868CFF] flex items-center justify-center">
              <Bot size={14} className="sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-none px-3 sm:px-4 py-2.5">
              <div className="flex gap-1 items-center h-full">
                <div className="w-1.5 h-1.5 bg-[#5D5FEF]/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#5D5FEF]/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#5D5FEF]/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 mb-4 flex justify-between items-center">
            <p className="text-xs sm:text-sm text-red-600">{error}</p>
            <button 
              onClick={() => dispatch(clearError())} 
              className="text-[10px] sm:text-xs text-red-500 hover:text-red-700 bg-red-100/50 px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div ref={messagesEndRef} className="h-2" />
      </div>
      
      {/* Footer to give it a nice bordered look since input is gone */}
      <div className="bg-white border-t border-gray-100 p-2 sm:p-3 text-center">
        <p className="text-[10px] sm:text-xs text-gray-400">
          Click the buttons above to navigate
        </p>
      </div>
    </motion.div>
  );
}