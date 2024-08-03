const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskHistorySchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  changes: [
    {
      field: { type: String, required: true },
      oldValue: Schema.Types.Mixed,
      newValue: Schema.Types.Mixed,
      changedAt: { type: Date, default: Date.now },
      changedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const TaskHistory = mongoose.model("TaskHistory", taskHistorySchema);

module.exports = TaskHistory;
