import { model, Schema } from "mongoose";

const groupSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
    },
    subject: {
      type: String,
    },
    achievement: {
      type: String,
      required: true,
      enum: ["certificate", "badge", "points"],
    },
    members: [
      {
        type: Schema.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Group = model("Group", groupSchema);

export default Group;
