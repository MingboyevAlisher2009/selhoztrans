import { model, Schema } from "mongoose";

const attendingSchema = new Schema(
  {
    group: {
      type: Schema.ObjectId,
      ref: "Group",
      required: true,
    },
    members: [
      {
        user: {
          type: Schema.ObjectId,
          ref: "User",
          required: true,
        },
        isAttending: {
          type: String,
          enum: ["panding", "attending", "not-attending"],
          default: "panding",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Attending = model("Attending", attendingSchema);

export default Attending;
