const mongoose = require('mongoose');

const TASK_STAGES = ['todo', 'in_progress', 'done'];

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    stage: { type: String, enum: TASK_STAGES, default: 'todo' },
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = { Task, TASK_STAGES };
