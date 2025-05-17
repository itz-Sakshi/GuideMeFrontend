import {z} from "zod"

export const profileSchema = z.object({
    name: z.string().max(50, "Name should be less than 50 characters").min(2, "Name should be atleast 2 characters"),
    current_status: z.enum(["Study Permit", "Work Permit", "Permanent Resident", "Refugee", "Visitor", "Other"], {message: "Please select valid current status."}),
    province: z.enum(["Ontario", "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", 
               "Nova Scotia", "Prince Edward Island", "Quebec", "Saskatchewan"], {message: "Please select valid province"}),
    age: z.number().max(150).min(0, "Please enter valid age ( Between 0 and 150 )"),
    marital_status: z.enum(["Never Married or Single", "Married", "Widowed",  "Anulled Marriage", "Legally Separated", "Common-Law", "Divorced or Separated"], {message: "Please select valid marital status."}),
    language_proficiency: z.enum(["English", "French", "Both"], {message: "Please select valid language proficiency option"}),
    additional_info: z.string().max(300, "Maximum limit is 300 characters"),
})

