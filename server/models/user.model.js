import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      default: "STUDENT",
      enum: ["SUPER_ADMIN", "ADMIN", "STUDENT"],
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
