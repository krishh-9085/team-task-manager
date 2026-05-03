const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Get Dashboard Stats
router.get('/', protect, async (req, res) => {
  try {
    // Get projects where user is a member
    const projects = await Project.find({
      'members.user': req.user._id
    }).select('_id');

    const projectIds = projects.map(p => p._id);

    if (projectIds.length === 0) {
      return res.json({
        totalTasks: 0,
        tasksByStatus: [],
        tasksPerUser: [],
        overdueTasks: 0
      });
    }

    // Total tasks in accessible projects
    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });

    // Tasks by status
    const tasksByStatusRaw = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const tasksByStatus = tasksByStatusRaw.map(t => ({
      status: t._id,
      count: t.count
    }));

    // Tasks per user (assignees in accessible projects)
    const tasksPerUserRaw = await Task.aggregate([
      { $match: { project: { $in: projectIds }, assignee: { $ne: null } } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } }
    ]);

    const tasksPerUser = [];
    for (const t of tasksPerUserRaw) {
      const user = await User.findById(t._id).select('name');
      tasksPerUser.push({
        userName: user?.name || 'Unknown',
        count: t.count
      });
    }

    // Overdue tasks
    const today = new Date();
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: today },
      status: { $ne: 'Done' }
    });

    res.json({
      totalTasks,
      tasksByStatus,
      tasksPerUser,
      overdueTasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
