const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Đang chờ xử lý", "Đã tiếp nhận", "Đã giải quyết", "Đã từ chối"],
      default: "Đang chờ xử lý",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);