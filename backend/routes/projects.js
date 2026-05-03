const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');

// Get all projects for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      'members.user': req.user._id
    }).populate('members.user', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new project
router.post('/', protect, async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      members: [{
        user: req.user._id,
        role: 'Admin'
      }]
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to project (Admin only)
router.post('/:id/members', protect, async (req, res) => {
  const projectId = req.params.id;
  const { email } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if user is Admin of the project
    const member = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!member || member.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized. Admins only.' });
    }

    // Find user to add
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    if (project.members.some(m => m.user.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member
    project.members.push({
      user: userToAdd._id,
      role: 'Member'
    });
    await project.save();

    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove member from project (Admin only)
router.delete('/:projectId/members/:userId', protect, async (req, res) => {
  const { projectId, userId } = req.params;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if requester is Admin
    const adminCheck = project.members.find(m => m.user.toString() === req.user._id.toString());
    if (!adminCheck || adminCheck.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized. Admins only.' });
    }

    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'Admin cannot remove themselves. Delete project instead.' });
    }

    project.members = project.members.filter(m => m.user.toString() !== userId);
    await project.save();

    res.json({ message: 'Member removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single project
router.get('/:id', protect, async (req, res) => {
  const projectId = req.params.id;

  try {
    const project = await Project.findOne({
      _id: projectId,
      'members.user': req.user._id
    }).populate('members.user', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const tasks = await Task.find({ project: projectId }).populate('assignee', 'name');

    res.json({ ...project.toObject(), tasks });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
