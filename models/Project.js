const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      max: 500,
    },
    img: {
      // 画像のパスを指定する方式で
      type: String,
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);