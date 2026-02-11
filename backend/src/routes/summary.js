const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { generateTaskSummary } = require('../services/aiService');

/**
 * GET /api/summary
 * 获取任务总结
 */
router.get('/', async (req, res) => {
  try {
    const { period } = req.query; // day, week, month
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = null; // 所有任务
    }
    
    let query = {};
    if (startDate) {
      query.createdAt = { $gte: startDate };
    }
    
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    
    // 生成 AI 总结
    const summary = await generateTaskSummary(tasks);
    
    // 基础统计
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => t.status === 'overdue').length,
      byPriority: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length
      }
    };
    
    res.json({
      stats,
      summary,
      period: period || 'all'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
