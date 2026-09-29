import mongoose from "mongoose";

const NEXT_PUBLIC_MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI!;

if (!NEXT_PUBLIC_MONGODB_URI) {
  throw new Error("NEXT_PUBLIC_MONGODB_URI is not defined");
}

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  await mongoose.connect(NEXT_PUBLIC_MONGODB_URI);
}