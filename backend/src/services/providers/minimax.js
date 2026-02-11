/**
 * MiniMax Provider
 * Supports MiniMax chat completion models
 * Documentation: https://api.minimax.chat/
 */

const https = require('https');

class MiniMaxProvider {
  constructor(config) {
    this.config = config;
    this.apiKey = config.apiKey;
    this.apiGroup = config.apiGroup || 'default';
    this.baseURL = 'https://api.minimax.chat/v1';
  }

  /**
   * Check if provider is available
   */
  isAvailable() {
    return this.apiKey !== null && this.apiKey !== undefined;
  }

  /**
   * Get provider name
   */
  getName() {
    return 'minimax';
  }

  /**
   * Get supported models
   */
  getSupportedModels() {
    return ['abab6.5-chat', 'abab6.5t-chat', 'abab6.5s-chat', 'abab5.5-chat'];
  }

  /**
   * Chat completion (Promise-based)
   */
  async complete(options) {
    const { messages, model = 'abab6.5s-chat', temperature = 0.3 } = options;

    if (!this.isAvailable()) {
      throw new Error('MiniMax API key not configured');
    }

    const payload = {
      model: model,
      messages: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      })),
      temperature: temperature,
      tokens_to_generate: 4096
    };

    const response = await this.makeRequest('/text/chatcompletion_v2', payload);

    return {
      content: response.choices[0].message.content,
      usage: {
        total_tokens: response.usage.total_tokens,
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens
      },
      provider: 'minimax',
      model: response.model
    };
  }

  /**
   * Make HTTP request to MiniMax API
   */
  makeRequest(endpoint, data) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseURL + endpoint);
      
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Api-Group': this.apiGroup
        }
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            if (json.base_resp && json.base_resp.status_code !== 0) {
              reject(new Error(json.base_resp.status_msg || 'MiniMax API error'));
            } else {
              resolve(json);
            }
          } catch (e) {
            reject(new Error('Failed to parse MiniMax response'));
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify(data));
      req.end();
    });
  }

  /**
   * Parse task from natural language
   */
  async parseTask(userInput) {
    const prompt = `You are a task assistant. Parse this input: "${userInput}".

Output in strict JSON format (no markdown, no other text):
{
  "title": "Task title",
  "description": "Description",
  "priority": "high/medium/low",
  "dueDate": "YYYY-MM-DD HH:mm or null",
  "tags": ["tag1"],
  "reminder": "Reminder time or null"
}`;

    const result = await this.complete({
      messages: [
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
    const prompt = `You are a task assistant.

Current task: ${JSON.stringify(currentTask)}
User request: ${userInput}

Output in strict JSON format:
{
  "updates": { "title": "...", "description": "...", "priority": "...", "dueDate": "...", "tags": [...] },
  "explanation": "One sentence"
}`;

    const result = await this.complete({
      messages: [
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
      `- [${t.status === 'completed' ? 'X' : ' '}] ${t.title} (${t.priority})`
    ).join('\n');

    const prompt = `Analyze these tasks:\n${tasksText}

Output in strict JSON format:
{
  "completionRate": "50%",
  "completedTasks": [],
  "pendingTasks": [],
  "suggestions": ["..."],
  "summaryText": "..."
}`;

    const result = await this.complete({
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.5
    });

    return this.parseJSON(result.content);
  }

  /**
   * Helper to parse JSON
   */
  parseJSON(content) {
    try {
      const clean = content.replace(/```json\n?|\n?```/g, '').replace(/^[^{]*(\{.*\})[^}]*$/, '$1').trim();
      return JSON.parse(clean);
    } catch (e) {
      console.error('MiniMax JSON parse error:', content);
      return null;
    }
  }
}

module.exports = MiniMaxProvider;
