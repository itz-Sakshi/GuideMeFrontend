import mongoose, { Schema, Document, Model } from "mongoose";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatDocument extends Document {
  userId: mongoose.Types.ObjectId;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<Message>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const ChatSchema = new Schema<ChatDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const ChatModel: Model<ChatDocument> =
  mongoose.models.Chat || mongoose.model<ChatDocument>("Chat", ChatSchema);

export default ChatModel;
