import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface ChatButton {
  label: string;
  action: string;
  metadata?: any;
  icon?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  buttons?: ChatButton[];
  products?: any[];
}

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  socketConnected: boolean;
  typingUsers: string[];
}

const initialState: ChatState = {
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your Flash Flow shopping assistant.\n\nPlease select an option below:",
      timestamp: Date.now(),
      buttons: [
        { label: 'Shop / Products', action: 'NAV_SHOP', icon: 'ShoppingBag' },
        { label: 'My Cart', action: 'NAV_CART', icon: 'ShoppingCart' },
        { label: 'My Orders', action: 'NAV_ORDERS', icon: 'Package' },
        { label: 'Wishlist', action: 'NAV_WISHLIST', icon: 'Heart' },
        { label: 'Offers', action: 'NAV_OFFERS', icon: 'Tag' },
        { label: 'Profile', action: 'NAV_PROFILE', icon: 'User' }
      ]
    },
  ],
  isOpen: false,
  isLoading: false,
  error: null,
  socketConnected: false,
  typingUsers: [],
};

export interface SendChatPayload {
  message?: string;
  action?: string;
  metadata?: any;
  userId?: string;
  sessionId: string;
}

export const sendChatMessage = createAsyncThunk(
  'chat/sendMessage',
  async (payload: SendChatPayload, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
    addMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>) => {
      state.messages.push({
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...action.payload,
      });
    },
    addSocketMessage: (state, action: PayloadAction<ChatMessage>) => {
      console.log('📥 Adding socket message to state:', action.payload);
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [initialState.messages[0]];
    },
    clearError: (state) => {
      state.error = null;
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.typingUsers = action.payload;
    },
    addTypingUser: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(id => id !== action.payload);
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: action.payload.response,
          buttons: action.payload.buttons || [],
          timestamp: Date.now(),
          products: action.payload.products,
        });
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  toggleChat, 
  openChat, 
  closeChat, 
  addMessage, 
  addSocketMessage,
  clearMessages, 
  clearError,
  setSocketConnected,
  setTypingUsers,
  addTypingUser,
  removeTypingUser,
  setIsLoading,
  setError
} = chatSlice.actions;
export default chatSlice.reducer;