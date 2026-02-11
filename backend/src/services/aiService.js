const OpenAI = require('openai');

// 初始化 OpenAI 客户端
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * 解析自然语言，创建任务
 * @param {string} userInput - 用户输入
 * @returns {Object} 解析后的任务数据
 */
async function parseTaskFromNaturalLanguage(userInput) {
  if (!openai) {
    // 如果没有 OpenAI API Key，使用简单的规则解析
    return simpleParseTask(userInput);
  }

  const prompt = `
你是一个任务助手。用户输入自然语言，你需要解析出任务信息。

请严格按照以下 JSON 格式输出（不要添加任何其他文字）：
{
  "title": "任务标题（简洁明了）",
  "description": "任务描述（可选）",
  "priority": "high/medium/low（根据时间紧迫程度判断）",
  "dueDate": "YYYY-MM-DD HH:mm 格式（如果用户没有指定，设置为你认为合理的时间）",
  "tags": ["标签1", "标签2（根据内容推断）"],
  "reminder": "提醒时间（用户指定则使用，否则设置为截止前30分钟）"
}

用户输入：${userInput}

记住：
- 如果用户只说了"开会"，title 就是"开会"
- 如果用户说了"明天下午3点"，dueDate 就是明天下午3点
- priority 根据紧迫程度判断
- tags 根据任务内容推断
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个任务助手，擅长解析自然语言并提取任务信息。你总是输出有效的 JSON 格式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    
    // 尝试解析 JSON
    try {
      // 清理可能的 markdown 代码块
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', content);
      return simpleParseTask(userInput);
    }
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return simpleParseTask(userInput);
  }
}

/**
 * 解析自然语言，修改任务
 * @param {string} userInput - 用户输入
 * @param {Object} currentTask - 当前任务
 * @returns {Object} 修改后的任务数据
 */
async function parseTaskModification(userInput, currentTask) {
  if (!openai) {
    return simpleParseModification(userInput, currentTask);
  }

  const prompt = `
你是一个任务助手。用户要修改任务，你需要解析修改内容。

当前任务信息：
- 标题：${currentTask.title}
- 描述：${currentTask.description || '无'}
- 优先级：${currentTask.priority}
- 截止日期：${currentTask.dueDate || '未设置'}
- 标签：${currentTask.tags.join(', ') || '无'}
- 状态：${currentTask.status}

用户修改要求：${userInput}

请严格按照以下 JSON 格式输出：
{
  "updates": {
    "title": "修改后的标题（如果用户没说要改标题，保持原样）",
    "description": "修改后的描述（如果用户没说要改描述，保持原样）",
    "priority": "high/medium/low（如果用户没说要改优先级，保持原样）",
    "dueDate": "YYYY-MM-DD HH:mm 格式（如果用户没说要改时间，保持原样）",
    "reminder": "提醒时间（如果用户没说要改提醒，保持原样）",
    "tags": ["标签1", "标签2（如果用户没说要改标签，保持原样）"]
  },
  "explanation": "用一句话说明你理解了用户的修改意图"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个任务助手，擅长理解用户的修改意图并更新任务信息。你总是输出有效的 JSON 格式。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', content);
      return simpleParseModification(userInput, currentTask);
    }
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return simpleParseModification(userInput, currentTask);
  }
}

/**
 * 生成任务总结
 * @param {Array} tasks - 任务列表
 * @returns {Object} 总结信息
 */
async function generateTaskSummary(tasks) {
  if (!openai) {
    return simpleGenerateSummary(tasks);
  }

  const tasksText = tasks.map(t => 
    `- [${t.status === 'completed' ? '✓' : ' '}] ${t.title} (优先级: ${t.priority}, 截止: ${t.dueDate || '无'})`
  ).join('\n');

  const prompt = `
请分析以下任务列表，生成总结：

${tasksText}

请严格按照以下 JSON 格式输出：
{
  "completionRate": "完成率（已完成/总数）",
  "completedTasks": ["已完成的任务标题"],
  "pendingTasks": ["未完成的任务标题"],
  "overdueTasks": ["已逾期任务标题"],
  "suggestions": ["针对未完成任务的一条建议"],
  "summaryText": "一段话总结当前任务状态（用于直接展示给用户）"
}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '你是一个任务总结助手，擅长分析任务列表并提供有用的总结和建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5
    });

    const content = response.choices[0].message.content;
    
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', content);
      return simpleGenerateSummary(tasks);
    }
  } catch (error) {
    console.error('OpenAI API error:', error.message);
    return simpleGenerateSummary(tasks);
  }
}

/**
 * 简单的规则解析（备用）
 */
function simpleParseTask(input) {
  // 提取时间
  const timePatterns = [
    /(\d{1,2})点(\d{0,2})/,
    /(\d{1,2})[:：](\d{2})/,
    /今天|明天|后天/
  ];
  
  // 提取优先级关键词
  const priorityKeywords = {
    high: ['紧急', '马上', '立刻', '尽快', '尽快', '很重要'],
    low: ['不急', '以后', '有空', '慢慢']
  };

  // 默认值
  const result = {
    title: input.slice(0, 50),
    description: '',
    priority: 'medium',
    dueDate: null,
    tags: [],
    reminder: null
  };

  return result;
}

function simpleParseModification(input, currentTask) {
  return {
    updates: {},
    explanation: `理解您的修改要求`
  };
}

function simpleGenerateSummary(tasks) {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const completionRate = total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%';

  return {
    completionRate,
    completedTasks: tasks.filter(t => t.status === 'completed').map(t => t.title),
    pendingTasks: tasks.filter(t => t.status === 'pending').map(t => t.title),
    overdueTasks: tasks.filter(t => t.status === 'overdue').map(t => t.title),
    suggestions: ['保持专注，继续完成剩余任务'],
    summaryText: `您共有 ${total} 个任务，已完成 ${completed} 个，完成率 ${completionRate}。`
  };
}

module.exports = {
  parseTaskFromNaturalLanguage,
  parseTaskModification,
  generateTaskSummary
};
