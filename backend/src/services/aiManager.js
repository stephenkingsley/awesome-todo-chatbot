/**
 * AI Provider Manager
 * Manages multiple AI providers with fallback and selection logic
 */

const OpenAIProvider = require('./providers/openai');
const MiniMaxProvider = require('./providers/minimax');
const SimpleProvider = require('./providers/simple');

class AIManager {
  constructor() {
    this.providers = {};
    this.activeProvider = null;
    this.init();
  }

  /**
   * Initialize all providers based on environment variables
   */
  init() {
    // Initialize OpenAI (priority: HIGH)
    if (process.env.OPENAI_API_KEY) {
      this.providers.openai = new OpenAIProvider({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL
      });
      console.log('✅ OpenAI provider initialized');
    }

    // Initialize MiniMax (priority: MEDIUM)
    if (process.env.MINIMAX_API_KEY) {
      this.providers.minimax = new MiniMaxProvider({
        apiKey: process.env.MINIMAX_API_KEY,
        apiGroup: process.env.MINIMAX_API_GROUP || 'default'
      });
      console.log('✅ MiniMax provider initialized');
    }

    // Initialize Simple fallback (priority: LOW - always available)
    this.providers.simple = new SimpleProvider({});
    console.log('✅ Simple fallback provider initialized');

    // Set active provider
    this.selectProvider(process.env.AI_PROVIDER || 'auto');
  }

  /**
   * Select AI provider
   * @param {string} providerName - 'openai', 'minimax', 'simple', or 'auto' for automatic selection
   */
  selectProvider(providerName) {
    if (providerName === 'auto') {
      // Priority order: OpenAI > MiniMax > Simple
      if (this.providers.openai?.isAvailable()) {
        this.activeProvider = this.providers.openai;
      } else if (this.providers.minimax?.isAvailable()) {
        this.activeProvider = this.providers.minimax;
      } else {
        this.activeProvider = this.providers.simple;
      }
    } else if (this.providers[providerName]) {
      this.activeProvider = this.providers[providerName];
    } else {
      console.warn(`Provider '${providerName}' not available, falling back to simple`);
      this.activeProvider = this.providers.simple;
    }

    console.log(`🎯 Active AI provider: ${this.activeProvider.getName()}`);
  }

  /**
   * Get current provider info
   */
  getProviderInfo() {
    if (!this.activeProvider) {
      return { name: 'none', available: false };
    }

    return {
      name: this.activeProvider.getName(),
      available: this.activeProvider.isAvailable(),
      models: this.activeProvider.getSupportedModels()
    };
  }

  /**
   * Get all available providers
   */
  getAvailableProviders() {
    const available = [];
    for (const [name, provider] of Object.entries(this.providers)) {
      if (provider.isAvailable()) {
        available.push({
          name,
          models: provider.getSupportedModels()
        });
      }
    }
    return available;
  }

  /**
   * Switch provider dynamically
   */
  switchProvider(providerName) {
    this.selectProvider(providerName);
    return this.getProviderInfo();
  }

  /**
   * Parse task from natural language
   */
  async parseTask(userInput, options = {}) {
    const provider = options.provider ? 
      (this.providers[options.provider] || this.activeProvider) : 
      this.activeProvider;

    try {
      if (provider.getName() === 'simple') {
        return provider.parseTask(userInput);
      }
      return await provider.parseTask(userInput);
    } catch (error) {
      console.error(`Error with ${provider.getName()} provider:`, error.message);
      // Fallback to simple provider
      return this.providers.simple.parseTask(userInput);
    }
  }

  /**
   * Parse task modification
   */
  async parseModification(userInput, currentTask, options = {}) {
    const provider = options.provider ? 
      (this.providers[options.provider] || this.activeProvider) : 
      this.activeProvider;

    try {
      if (provider.getName() === 'simple') {
        return provider.parseModification(userInput, currentTask);
      }
      return await provider.parseModification(userInput, currentTask);
    } catch (error) {
      console.error(`Error with ${provider.getName()} provider:`, error.message);
      return this.providers.simple.parseModification(userInput, currentTask);
    }
  }

  /**
   * Generate task summary
   */
  async generateSummary(tasks, options = {}) {
    const provider = options.provider ? 
      (this.providers[options.provider] || this.activeProvider) : 
      this.activeProvider;

    try {
      if (provider.getName() === 'simple') {
        return provider.generateSummary(tasks);
      }
      return await provider.generateSummary(tasks);
    } catch (error) {
      console.error(`Error with ${provider.getName()} provider:`, error.message);
      return this.providers.simple.generateSummary(tasks);
    }
  }

  /**
   * Generic chat completion
   */
  async complete(messages, options = {}) {
    const provider = options.provider ? 
      (this.providers[options.provider] || this.activeProvider) : 
      this.activeProvider;

    if (provider.getName() === 'simple') {
      throw new Error('Simple provider does not support generic completion');
    }

    return await provider.complete({
      messages,
      model: options.model,
      temperature: options.temperature || 0.3
    });
  }
}

// Export singleton instance
const aiManager = new AIManager();

module.exports = {
  AIManager,
  aiManager,
  
  // Convenience exports
  parseTask: (input, options) => aiManager.parseTask(input, options),
  parseModification: (input, task, options) => aiManager.parseModification(input, task, options),
  generateSummary: (tasks, options) => aiManager.generateSummary(tasks, options),
  complete: (messages, options) => aiManager.complete(messages, options),
  
  // Provider management
  getProviderInfo: () => aiManager.getProviderInfo(),
  getAvailableProviders: () => aiManager.getAvailableProviders(),
  switchProvider: (name) => aiManager.switchProvider(name)
};
