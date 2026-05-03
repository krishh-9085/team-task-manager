const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: 'To Do',
    enum: ['To Do', 'In Progress', 'Done'],
  },
  priority: {
    type: String,
    default: 'Medium',
    enum: ['Low', 'Medium', 'High'],
  },
  dueDate: {
    type: Date,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

taskSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Task', taskSchema);
