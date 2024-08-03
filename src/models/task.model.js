const mongoose = require('mongoose');
const { Schema } = mongoose;

const statusHistorySchema = new Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Task schema
const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    current: { type: String, enum: ["To Do", "In Progress", "Completed"], default: 'To Do' },
    history: [statusHistorySchema],
  },
  assignedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Multiple user assignments
  subtasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }], // Self-referencing for subtasks
  dependencies: [{ type: Schema.Types.ObjectId, ref: 'Task' }], // Self-referencing for dependencies
},
{
  timestamps: true,
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
