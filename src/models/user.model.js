import mongoose from "mongoose";

// Schema definition for User accounts and authentication
const userSchema = new mongoose.Schema(
  {
    // Unique identifier for the user used during the login process
    username: { type: String, required: true, unique: true },
    
    // Securely hashed password string
    password: { type: String, required: true },
    
    // Defines the user's permissions level
    // 'user' is the default, while 'admin' can create global folders
    role: { type: String, default: "user", enum: ["user", "admin"] }
  },
  { 
    // Automatically tracks when the user record was created and last updated
    timestamps: true 
  }
);

// Exporting the model to handle user-related database operations
export default mongoose.model("User", userSchema);