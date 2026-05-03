const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/authMiddleware');

// Get all tasks assigned to the user
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id }).populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a task (Admin only)
router.post('/', protect, async (req, res) => {
  const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is Admin of the project
    const adminCheck = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminCheck || adminCheck.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized. Admins only.' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'To Do',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      project: projectId,
      assignee: assigneeId || undefined,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task (Admin can update all, Member can only update status of assigned tasks)
router.put('/:id', protect, async (req, res) => {
  const taskId = req.params.id;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const projectMember = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!projectMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    let updateData = {};

    if (projectMember.role === 'Admin') {
      updateData = {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignee: assigneeId || undefined,
      };
    } else {
      // Member can only update status if they are the assignee
      if (task.assignee?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      updateData = { status };
    }

    // Clean undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task (Admin only)
router.delete('/:id', protect, async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const adminCheck = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminCheck || adminCheck.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized. Admins only.' });
    }

    await Task.findByIdAndDelete(taskId);

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
