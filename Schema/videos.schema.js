// models/blog.schema.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    imagePath: { type: String, default: null },
    videoPath: { type: String, default: null },
  },
  { timestamps: true }
);

const VideosModel = mongoose.model("Videos", videoSchema);

export default VideosModel;
