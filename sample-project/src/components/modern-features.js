// Modern JavaScript features that may not be baseline-compatible

class DataManager {
  // Private class fields (ES2022)
  #privateData = new Map();
  #apiKey = 'secret-key';

  constructor(config) {
    // Nullish coalescing operator (??) - ES2020
    this.timeout = config?.timeout ?? 5000;
    this.retries = config?.retries ?? 3;
    
    // Optional chaining (?.) - ES2020
    this.endpoint = config?.api?.endpoint ?? '/api/data';
  }

  async fetchData(id) {
    try {
      // Private field access
      const key = this.#apiKey;
      
      const response = await fetch(`${this.endpoint}/${id}`, {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store in private field
      this.#privateData.set(id, data);
      
      return data;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error;
    }
  }

  getRecentItems(count = 10) {
    const allData = Array.from(this.#privateData.values());
    
    // Array.prototype.at() - ES2022
    const latest = allData.at(-1);
    
    return allData.slice(-count);
  }

  // Static block (ES2022)
  static {
    console.log('DataManager class initialized');
  }
}

// Top-level await (ES2022) - can cause issues in some environments
const config = await fetch('/config.json').then(r => r.json());
const manager = new DataManager(config);

export { DataManager, manager };