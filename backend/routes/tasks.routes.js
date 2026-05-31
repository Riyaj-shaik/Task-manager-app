const express = require('express');
const { Task, TASK_STAGES } = require('../models/Task.model');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error('list tasks error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, stage } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (stage && !TASK_STAGES.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const task = await Task.create({
      userId: req.userId,
      title: title.trim(),
      description: (description || '').trim(),
      stage: stage || 'todo',
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('create task error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, stage } = req.body || {};
    if (stage && !TASK_STAGES.includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage' });
    }

    const update = {};
    if (typeof title === 'string') update.title = title.trim();
    if (typeof description === 'string') update.description = description.trim();
    if (stage) update.stage = stage;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      update,
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('update task error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!result) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('delete task error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
