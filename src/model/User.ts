import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
    email: string;
    password: string;
    isResumeSubmitted: boolean;
    isProfileSubmitted: boolean;
}

const UserSchema = new Schema<User>({
    email: {
        type: String,
        required: [true, "email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "please use a valid email address"]
    },
    password: {
        type: String,
        required: [true, "password is required"]
    },
    isResumeSubmitted: {
        type: Boolean,
        default: false
    },   
    isProfileSubmitted: {
        type: Boolean,
        default: false
    }    
});

const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema); //  Avoids model duplication in Mongoose

export default UserModel;


