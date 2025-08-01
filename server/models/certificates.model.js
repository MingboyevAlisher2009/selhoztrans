import { model, Schema } from "mongoose";

const certeficateSchema = new Schema(
  {
    author: {
      type: Schema.ObjectId,
      required: true,
      ref: "User",
    },
    student: {
      type: Schema.ObjectId,
      required: true,
      ref: "User",
    },
    certificate: {
      type: String,
    },
  },
  { timestamps: true }
);

const Certificate = model("certificate", certeficateSchema);

export default Certificate;
