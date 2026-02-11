/**
 * OpenAI Provider
 * Supports GPT-3.5-turbo, GPT-4, and other OpenAI models
 */

const OpenAI = require('openai');

class OpenAIProvider {
  constructor(config) {
    this.client = null;
    this.config = config;
    
    if (config.apiKey) {
      this.client = new OpenAI({ 
        apiKey: config.apiKey,
        baseURL: config.baseURL // Support custom base URL for proxies
      });
    }
  }

  /**
   * Check if provider is available
   */
  isAvailable() {
    return this.client !== null;
  }

  /**
   * Get provider name
   */
  getName() {
    return 'openai';
  }

  /**
   * Get supported models
   */
  getSupportedModels() {
    return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'];
  }

  /**
   * Chat completion
   */
  async complete(options) {
    const { messages, model, temperature = 0.3, maxTokens } = options;
    
    if (!this.isAvailable()) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await this.client.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens: maxTokens
    });

    return {
      content: response.choices[0].message.content,
      usage: response.usage,
      provider: 'openai',
      model: response.model
    };
  }

  /**
   * Parse task from natural language
   */
  async parseTask(userInput) {
    const prompt = `
You are a task assistant. Parse the user input and extract task information.

Please output in strict JSON format (no other text):
{
  "title": "Task title (concise)",
  "description": "Task description (optional)",
  "priority": "high/medium/low",
  "dueDate": "YYYY-MM-DD HH:mm format",
  "tags": ["tag1", "tag2"],
  "reminder": "Reminder time"
}

User input: ${userInput}

Remember:
- If user only says "meeting", title is "meeting"
- If user says "3pm tomorrow", dueDate is tomorrow at 3pm
- priority based on urgency
`;

    const result = await this.complete({
      messages: [
        { role: 'system', content: 'You are a task assistant. Always output valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    return this.parseJSON(result.content);
  }

  /**
   * Parse task modification
   */
  async parseModification(userInput, currentTask) {
    const prompt = `
You are a task assistant. Parse the user's modification request.

Current task:
- Title: ${currentTask.title}
- Description: ${currentTask.description || 'none'}
- Priority: ${currentTask.priority}
- Due Date: ${currentTask.dueDate || 'not set'}
- Status: ${currentTask.status}

User request: ${userInput}

Output in strict JSON format:
{
  "updates": {
    "title": "Updated title",
    "description": "Updated description",
    "priority": "high/medium/low",
    "dueDate": "YYYY-MM-DD HH:mm",
    "reminder": "Reminder time",
    "tags": ["tag1"]
  },
  "explanation": "One sentence explaining the modification"
}
`;

    const result = await this.complete({
      messages: [
        { role: 'system', content: 'You are a task assistant. Always output valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });

    return this.parseJSON(result.content);
  }

  /**
   * Generate task summary
   */
  async generateSummary(tasks) {
    const tasksText = tasks.map(t => 
      `- [${t.status === 'completed' ? '✓' : ' '}] ${t.title} (priority: ${t.priority}, due: ${t.dueDate || 'none'})`
    ).join('\n');

    const prompt = `
Analyze the task list and generate a summary:

${tasksText}

Output in strict JSON format:
{
  "completionRate": "completion rate",
  "completedTasks": ["completed task titles"],
  "pendingTasks": ["pending task titles"],
  "suggestions": ["one suggestion"],
  "summaryText": "A paragraph summarizing the current task status"
}
`;

    const result = await this.complete({
      messages: [
        { role: 'system', content: 'You are a task summary assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5
    });

    return this.parseJSON(result.content);
  }

  /**
   * Helper to parse JSON response
   */
  parseJSON(content) {
    try {
      const clean = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(clean);
    } catch (e) {
      console.error('OpenAI JSON parse error:', content);
      return null;
    }
  }
}

module.exports = OpenAIProvider;
