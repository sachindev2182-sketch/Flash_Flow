import mongoose from 'mongoose';

const chatStateSchema = new mongoose.Schema({
  userId: {
    type: String, // Can be user ID or a session string
    required: true,
    unique: true,
    index: true,
  },
  step: {
    type: String,
    required: true,
    default: 'MAIN_MENU',
  },
  history: {
    type: [String],
    default: [],
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

const ChatState = mongoose.models.ChatState || mongoose.model('ChatState', chatStateSchema);

export default ChatState;
