const express = require('express');
const router = express.Router();
const { parseTaskFromNaturalLanguage, parseTaskModification } = require('../services/aiService');
const Task = require('../models/Task');

/**
 * POST /api/chat
 * AI 聊天对话 - 分析用户意图并执行相应操作
 */
router.post('/', async (req, res) => {
  try {
    const { message, currentTask } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 意图识别关键词
    const intentPatterns = {
      create: [/创建任务/i, /新建任务/i, /加个任务/i, /添加任务/i, /新任务/i],
      modify: [/修改/i, /更改/i, /改一下/i, /换个/i, /改到/i, /改到/i],
      delete: [/删除/i, /删掉/i, /去掉/i, /移除/i],
      complete: [/完成/i, /做完/i, /结束/i, /搞定/i],
      summary: [/总结/i, /summary/i, /概况/i, /状态/i],
      list: [/任务列表/i, /有哪些任务/i, /列出任务/i]
    };

    let intent = 'unknown';
    let response = { message: '', action: null };

    // 识别意图
    if (intentPatterns.create.some(p => p.test(message))) {
      intent = 'create';
    } else if (intentPatterns.modify.some(p => p.test(message))) {
      intent = 'modify';
    } else if (intentPatterns.delete.some(p => p.test(message))) {
      intent = 'delete';
    } else if (intentPatterns.complete.some(p => p.test(message))) {
      intent = 'complete';
    } else if (intentPatterns.summary.some(p => p.test(message))) {
      intent = 'summary';
    } else if (intentPatterns.list.some(p => p.test(message))) {
      intent = 'list';
    }

    // 根据意图处理
    switch (intent) {
      case 'create':
        const newTaskData = await parseTaskFromNaturalLanguage(message);
        const newTask = new Task(newTaskData);
        await newTask.save();
        response = {
          message: `✅ 已创建任务：「${newTask.title}」`,
          task: newTask.toJSON(),
          action: 'created'
        };
        break;

      case 'modify':
        if (currentTask) {
          const modification = await parseTaskModification(message, currentTask);
          const updatedTask = await Task.findByIdAndUpdate(
            currentTask.id,
            modification.updates,
            { new: true }
          );
          response = {
            message: `✅ 已修改任务：「${updatedTask.title}」`,
            task: updatedTask.toJSON(),
            action: 'modified',
            explanation: modification.explanation
          };
        } else {
          response = {
            message: '❓ 您想修改哪个任务？请先选择要修改的任务。',
            action: 'need_task_selection'
          };
        }
        break;

      case 'delete':
        const tasks = await Task.find({ 
          $or: [
            { title: { $regex: message.replace(/删除|删掉|去掉|移除/i, ''), $options: 'i' } }
          ]
        });
        if (tasks.length > 0) {
          await Task.findByIdAndDelete(tasks[0]._id);
          response = {
            message: `✅ 已删除任务：「${tasks[0].title}」`,
            action: 'deleted'
          };
        } else {
          response = {
            message: '❓ 没有找到要删除的任务，请先选择任务。',
            action: 'need_task_selection'
          };
        }
        break;

      case 'complete':
        const tasksToComplete = await Task.find({
          title: { $regex: message.replace(/完成|做完|结束|搞定/i, ''), $options: 'i' }
        });
        if (tasksToComplete.length > 0) {
          const completed = await Task.findByIdAndUpdate(
            tasksToComplete[0]._id,
            { status: 'completed', updatedAt: new Date() },
            { new: true }
          );
          response = {
            message: `✅ 已完成任务：「${completed.title}」`,
            task: completed.toJSON(),
            action: 'completed'
          };
        } else {
          response = {
            message: '❓ 没有找到要完成的任务，请先选择任务。',
            action: 'need_task_selection'
          };
        }
        break;

      case 'summary':
        const allTasks = await Task.find().sort({ createdAt: -1 });
        const summary = await generateQuickSummary(allTasks);
        response = {
          message: summary,
          action: 'summary',
          tasksCount: {
            total: allTasks.length,
            completed: allTasks.filter(t => t.status === 'completed').length,
            pending: allTasks.filter(t => t.status === 'pending').length
          }
        };
        break;

      case 'list':
        const pendingTasks = await Task.find({ status: 'pending' }).sort({ priority: -1, createdAt: -1 });
        const taskList = pendingTasks.map((t, i) => 
          `${i + 1}. [${getPriorityIcon(t.priority)}] ${t.title} ${t.dueDate ? `(截止: ${formatDate(t.dueDate)})` : ''}`
        ).join('\n');
        
        response = {
          message: `📋 当前待办任务（${pendingTasks.length}个）：\n\n${taskList || '暂无待办任务'} `,
          action: 'list',
          tasks: pendingTasks.map(t => t.toJSON())
        };
        break;

      default:
        // 默认尝试解析为创建任务
        try {
          const taskData = await parseTaskFromNaturalLanguage(message);
          const task = new Task(taskData);
          await task.save();
          response = {
            message: `✅ 已创建任务：「${task.title}」`,
            task: task.toJSON(),
            action: 'created'
          };
        } catch (parseError) {
          response = {
            message: '🤔 我不太理解您的意思。您可以：\n- 直接输入任务（如"明天下午3点开会"）\n- 说"创建任务"来新建任务\n- 说"总结"查看任务概况',
            action: 'need_help'
          };
        }
    }

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/create-task
 * 直接从自然语言创建任务
 */
router.post('/create-task', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const taskData = await parseTaskFromNaturalLanguage(message);
    const task = new Task(taskData);
    await task.save();

    res.json({
      success: true,
      task: task.toJSON(),
      message: `已创建任务：「${task.title}」`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/modify-task
 * 直接从自然语言修改任务
 */
router.post('/modify-task', async (req, res) => {
  try {
    const { message, taskId } = req.body;
    
    if (!message || !taskId) {
      return res.status(400).json({ error: 'Message and taskId are required' });
    }

    const currentTask = await Task.findById(taskId);
    if (!currentTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const modification = await parseTaskModification(message, currentTask);
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      modification.updates,
      { new: true }
    );

    res.json({
      success: true,
      task: updatedTask.toJSON(),
      explanation: modification.explanation,
      message: `已修改任务：「${updatedTask.title}」`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 辅助函数
function getPriorityIcon(priority) {
  const icons = { high: '🔴', medium: '🟡', low: '🟢' };
  return icons[priority] || '⚪';
}

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
}

async function generateQuickSummary(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  let summary = `📊 任务总结\n\n`;
  summary += `📈 完成率：${completionRate}%\n`;
  summary += `✅ 已完成：${completed} 个\n`;
  summary += `⏳ 待办中：${pending} 个\n`;
  summary += `⚠️ 已逾期：${overdue} 个\n`;
  
  if (pending > 0) {
    const highPriority = pendingTasks.filter(t => t.priority === 'high').length;
    summary += `\n🔥 高优先级任务：${highPriority} 个`;
  }
  
  return summary;
}

module.exports = router;
