import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: String,
  age: Number,
  mobile: String,
  gender: String,
  email: String,
  city: String,
});

export const User = mongoose.models.User ||
  mongoose.model("User", UserSchema);