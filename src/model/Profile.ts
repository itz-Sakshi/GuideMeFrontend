import mongoose, {Schema, Document} from "mongoose";
import { User } from "./User";

export interface Profile extends Document{
    _id: User["_id"], // Reference from the User model 
    name: string,
    current_status: "Study Permit" | "Work Permit" | "Permanent Resident" | "Refugee" | "Visitor" | "Other";
    province: "Ontario" | "Alberta" | "British Columbia" | "Manitoba" | "New Brunswick" | "Newfoundland and Labrador" | 
              "Nova Scotia" | "Prince Edward Island" | "Quebec" | "Saskatchewan";
    age: number;
    marital_status: "Never Married or Single" | "Married" | "Widowed" | "Anulled Marriage" | "Legally Separated" | "Common-Law" | "Divorced or Separated";
    language_proficiency: "English" | "French" | "Both";
    additional_info: string;
    resume:string;
}


export const ProfileSchema = new Schema<Profile>({
    _id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    current_status: {
        type: String,
        required: true,
        enum: ["Study Permit", "Work Permit", "Permanent Resident", "Refugee", "Visitor", "Other"]
    },
    province: {
        type: String,
        required: true,
        enum: ["Ontario", "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", 
               "Nova Scotia", "Prince Edward Island", "Quebec", "Saskatchewan"]
    },
    age: {
        type: Number,
        required: true
    },
    marital_status: {
        type: String,
        required: true,
        enum: ["Never Married or Single", "Married", "Widowed",  "Anulled Marriage", "Legally Separated", "Common-Law", "Divorced or Separated"]
    },
    language_proficiency: {
        type: String,
        required: true,
        enum: ["English", "French", "Both"]
    },
    additional_info: {
        type: String
    },
    resume:{
        type: String  // cloudinary url
    }
})

const ProfileModel = (
    mongoose.models.Profile || mongoose.model<Profile>("Profile", ProfileSchema)
  ) as mongoose.Model<Profile>;
  

export default ProfileModel;

