/**
 * Simple Fallback Provider
 * Rule-based parsing without any AI API
 */

class SimpleProvider {
  constructor(config) {
    this.config = {};
  }

  isAvailable() {
    return true; // Always available as fallback
  }

  getName() {
    return 'simple';
  }

  getSupportedModels() {
    return ['rule-based'];
  }

  async complete(options) {
    throw new Error('Simple provider does not support generic completion');
  }

  /**
   * Simple task parsing
   */
  parseTask(userInput) {
    const result = {
      title: userInput.slice(0, 50),
      description: '',
      priority: this.extractPriority(userInput),
      dueDate: this.extractDate(userInput),
      tags: this.extractTags(userInput),
      reminder: null
    };

    return result;
  }

  /**
   * Simple modification parsing
   */
  parseModification(userInput, currentTask) {
    return {
      updates: {},
      explanation: 'Understood your modification request'
    };
  }

  /**
   * Simple summary generation
   */
  generateSummary(tasks) {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completionRate: `${rate}%`,
      completedTasks: tasks.filter(t => t.status === 'completed').map(t => t.title),
      pendingTasks: tasks.filter(t => t.status === 'pending').map(t => t.title),
      overdueTasks: tasks.filter(t => t.status === 'overdue').map(t => t.title),
      suggestions: ['Keep focused on your pending tasks'],
      summaryText: `You have ${total} tasks, ${completed} completed (${rate}% completion rate).`
    };
  }

  /**
   * Extract priority from input
   */
  extractPriority(input) {
    const high = ['紧急', '马上', '立刻', '尽快', '很重要', '重要', 'urgent', 'asap', 'important'];
    const low = ['不急', '以后', '有空', '慢慢', 'later', 'sometime'];
    
    const lower = input.toLowerCase();
    if (high.some(k => lower.includes(k))) return 'high';
    if (low.some(k => lower.includes(k))) return 'low';
    return 'medium';
  }

  /**
   * Extract date from input
   */
  extractDate(input) {
    // Simple pattern matching for Chinese/English date expressions
    const now = new Date();
    let date = null;

    if (/\b今天\b/i.test(input)) {
      date = new Date(now);
    } else if (/\b明天\b/i.test(input)) {
      date = new Date(now);
      date.setDate(date.getDate() + 1);
    } else if (/\b后天\b/i.test(input)) {
      date = new Date(now);
      date.setDate(date.getDate() + 2);
    }

    if (date) {
      // Try to extract time
      const timeMatch = input.match(/(\d{1,2})[:：](\d{2})/);
      if (timeMatch) {
        date.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]));
      } else {
        const hourMatch = input.match(/(\d{1,2})点/);
        if (hourMatch) {
          date.setHours(parseInt(hourMatch[1]), 0);
        }
      }
    }

    return date ? this.formatDate(date) : null;
  }

  /**
   * Extract tags from input
   */
  extractTags(input) {
    const tags = [];
    const tagPatterns = [
      /#(\w+)/g,
      /【([^】]+)】/g
    ];

    for (const pattern of tagPatterns) {
      let match;
      while ((match = pattern.exec(input)) !== null) {
        tags.push(match[1]);
      }
    }

    return tags.length > 0 ? tags : [];
  }

  /**
   * Format date to YYYY-MM-DD HH:mm
   */
  formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}

module.exports = SimpleProvider;
