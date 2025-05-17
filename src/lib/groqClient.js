/**
 * Groq API Client
 * A wrapper around the Groq API for handling LLM interactions with proper error handling,
 * rate limiting, and response caching.
 */

// Add debug logging
console.log("Loading groqClient.js module");

/**
 * @typedef {Object} GroqConfig
 * @property {string} apiKey - The Groq API key
 * @property {string} [model="llama3-8b-8192"] - The model to use for completions
 * @property {number} [maxRetries=3] - Maximum number of retry attempts
 * @property {number} [retryDelay=1000] - Delay between retries in milliseconds
 * @property {number} [cacheTTL=24*60*60*1000] - Cache TTL in milliseconds (default: 24 hours)
 */

/**
 * @typedef {Object} GroqResponse
 * @property {string} content - The generated text content
 * @property {Object} metadata - Response metadata including tokens used, latency, etc.
 */

/**
 * Creates a new Groq API client instance.
 * @param {GroqConfig} config - Configuration options for the client
 * @returns {Object} A Groq client instance with methods for API interaction
 * @example
 * const client = createGroqClient({
 *   apiKey: process.env.GROQ_API_KEY,
 *   model: 'llama3-8b-8192',
 *   maxRetries: 3
 * });
 */
export function createGroqClient(config = {}) {
  const {
    apiKey,
    model = 'llama3-8b-8192',
    maxRetries = 3,
    retryDelay = 1000,
    cacheTTL = 24 * 60 * 60 * 1000
  } = config;

  console.log("Creating Groq client with API key:", apiKey ? "Key provided" : "No key provided");

  // If no API key is provided, return a mock implementation
  if (!apiKey) {
    console.warn("No Groq API key provided, using mock implementation instead");
    return createMockGroqClient();
  }

  // In-memory response cache
  const cache = new Map();

  /**
   * Generates a completion using the Groq API.
   * @param {string} prompt - The input prompt
   * @param {Object} [options] - Additional options for the completion
   * @param {number} [options.temperature=0.2] - Sampling temperature (0-1)
   * @param {number} [options.maxTokens=100] - Maximum tokens to generate
   * @param {boolean} [options.useCache=true] - Whether to use cached responses
   * @returns {Promise<GroqResponse>} The generated completion
   * @throws {Error} If the API request fails
   * @example
   * const response = await client.generateCompletion(
   *   'What is the capital of France?',
   *   { temperature: 0.5 }
   * );
   */
  async function generateCompletion(prompt, options = {}) {
    const {
      temperature = 0.2,
      maxTokens = 100,
      useCache = true
    } = options;

    // Generate cache key
    const cacheKey = JSON.stringify({ prompt, temperature, maxTokens });
    
    // Check cache if enabled
    if (useCache) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        return cached.response;
      }
    }

    let lastError;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature,
            max_tokens: maxTokens
          })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Groq API error: ${error.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const result = {
          content: data.choices[0].message.content,
          metadata: {
            tokens: data.usage,
            latency: response.headers.get('x-latency'),
            model: data.model
          }
        };

        // Cache the result
        if (useCache) {
          cache.set(cacheKey, {
            response: result,
            timestamp: Date.now()
          });
        }

        return result;
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Cleans up expired cache entries.
   * @private
   */
  function cleanCache() {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > cacheTTL) {
        cache.delete(key);
      }
    }
  }

  // Clean cache periodically
  setInterval(cleanCache, cacheTTL);

  return {
    generateCompletion,
    cleanCache
  };
}

/**
 * Creates a mock Groq client implementation for development/testing
 */
function createMockGroqClient() {
  console.log("Created mock Groq client");
  
  async function generateCompletion(prompt, options = {}) {
    console.log("Mock Groq client called with prompt:", prompt);
    
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For chat prompts that expect JSON
    if (prompt.includes('You are a smart task assistant')) {
      return {
        content: `{"action": "other", "response": "This is a mock response. I can help you manage your tasks."}`,
        metadata: {
          tokens: { total: 20, completion: 15, prompt: 5 },
          latency: "100ms",
          model: "mock-model"
        }
      };
    }
    
    // Default response
    return {
      content: "This is a mock response from the Groq client.",
      metadata: {
        tokens: { total: 20, completion: 15, prompt: 5 },
        latency: "100ms",
        model: "mock-model"
      }
    };
  }
  
  function cleanCache() {
    // No-op for mock client
  }
  
  return {
    generateCompletion,
    cleanCache
  };
}

/**
 * Creates a task prioritization client using Groq.
 * @param {GroqConfig} config - Configuration for the Groq client
 * @returns {Object} A client for task prioritization
 * @example
 * const prioritizer = createTaskPrioritizer({
 *   apiKey: process.env.GROQ_API_KEY
 * });
 * const priority = await prioritizer.getPriority('Implement user authentication');
 */
export function createTaskPrioritizer(config) {
  const client = createGroqClient(config);

  /**
   * Determines the priority of a task using the Groq API.
   * @param {string} title - The task title
   * @param {string} [description] - Optional task description
   * @returns {Promise<'low'|'medium'|'high'>} The determined priority
   * @throws {Error} If the API request fails
   * @example
   * const priority = await prioritizer.getPriority(
   *   'Fix login bug',
   *   'Users unable to login with Google OAuth'
   * );
   */
  async function getPriority(title, description = '') {
    const prompt = `Task: ${title}\nDescription: ${description || '(No description provided)'}\n\nBased on the task description, assign a priority level from these options only: low, medium, high. Respond with only one of these three words.`;
    
    const response = await client.generateCompletion(prompt, {
      temperature: 0.2,
      maxTokens: 10,
      useCache: true
    });

    const priority = response.content.toLowerCase().trim();
    if (!['low', 'medium', 'high'].includes(priority)) {
      return 'medium'; // Default to medium if response is invalid
    }

    return priority;
  }

  return {
    getPriority
  };
} 