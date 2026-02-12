import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  isVerified: {
    type: Boolean,
    default: true, 
  },


  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = models.User || model("User", UserSchema);
export default User;
