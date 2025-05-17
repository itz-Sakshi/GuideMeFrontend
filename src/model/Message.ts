import {Schema, Document} from "mongoose";



export interface Message extends Document{
    role: "User" | "Assistant",
    content: string,
    createdAt: Date
}

export const MessageSchema: Schema<Message>= new Schema({
    role:{
        type: String,
        required: true,
        enum: ["User", "Assistant"]
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
})







