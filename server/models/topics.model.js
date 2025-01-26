import { model, Schema } from "mongoose";

const topicsSchema = new Schema({
  groupId: {
    type: Schema.ObjectId,
    requred: true,
    ref: "Group",
  },
  title: {
    type: String,
    requred: true,
  },
  description: {
    type: String,
    requred: true,
  },
  file: {
    type: String,
  },
  link: {
    type: String,
  },
});

const Topics = model("Topic", topicsSchema);

export default Topics;
