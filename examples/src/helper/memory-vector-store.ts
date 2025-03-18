import { join } from 'path';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

/**
 * Represents the structure of vector data
 * @typedef {Object} VectorData
 * @property {string} data - The original text data
 * @property {number[]} vector - The vector representation of the data
 */
interface VectorData {
  data: string;
  vector: number[];
}

/**
 * Configuration options for the vector store
 * @typedef {Object} VectorStoreOptions
 * @property {boolean} [autoSave=true] - Automatically save changes to disk
 * @property {string} [filePath] - Path to store the vector data
 */
export interface VectorStoreOptions {
  autoSave?: boolean;
  filePath?: string;
}

/**
 * A lightweight in-memory vector store with persistence
 * @class
 */
export class LiteMemoryVectorStore {
  /** @private */
  private options: VectorStoreOptions;
  /** @private */
  private cache: VectorData[] = [];
  /** @private */
  private dirty: boolean = false;

  /**
   * Create a new MemoryVectorStoreLite instance
   * @constructor
   * @param {Function} vectorParsor - A function that converts text to a vector
   * @param {VectorStoreOptions} [options] - Configuration options for the vector store
   */
  constructor(
    private vectorParsor: (text: string) => Promise<number[]>,
    options?: VectorStoreOptions
  ) {
    this.options = {
      autoSave: true,
      filePath: join(process.cwd(), 'node_modules/__mvsl__/data.json'),
      ...options,
    };

    this.load();
  }

  /**
   * Add a new piece of data to the vector store
   * @param {string} data - The text data to add
   * @returns {Promise<VectorData>} The added vector data
   */
  async add(data: string): Promise<VectorData> {
    const vector = await this.vectorParsor(data);
    const vectorData = { data, vector };

    this.cache.push(vectorData);
    this.dirty = true;

    if (this.options.autoSave) {
      this.save();
    }

    return vectorData;
  }

  /**
   * Calculate the cosine similarity between two vectors
   * @private
   * @param {number[]} a - First vector
   * @param {number[]} b - Second vector
   * @returns {number} Similarity score (higher means more similar)
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Search for similar items in the vector store
   * @param {string} query - The search query
   * @param {number} [k=4] - Number of results to return
   * @param {Function} [filter] - Optional filter function to apply to results
   * @returns {Promise<VectorData[]>} Sorted array of most similar vector data
   */
  async similaritySearch(query: string, k: number = 4, filter?: (doc: VectorData) => boolean): Promise<VectorData[]> {
    const queryVector = await this.vectorParsor(query);

    let candidates = this.cache;
    if (filter) {
      candidates = candidates.filter(filter);
    }

    // Calculate similarities and sort
    const scoredResults = candidates.map((item) => ({
      item,
      score: this.cosineSimilarity(queryVector, item.vector),
    }));

    scoredResults.sort((a, b) => b.score - a.score);

    // Return top k results
    return scoredResults.slice(0, k).map((result) => result.item);
  }

  /**
   * Remove a specific piece of data from the store
   * @param {string} data - The text data to remove
   */
  async remove(data: string): Promise<void> {
    const initialLength = this.cache.length;
    this.cache = this.cache.filter((item) => item.data !== data);

    if (this.cache.length !== initialLength) {
      this.dirty = true;

      if (this.options.autoSave) {
        this.save();
      }
    }
  }

  /**
   * Clear all data from the vector store
   */
  async clear(): Promise<void> {
    if (this.cache.length > 0) {
      this.cache = [];
      this.dirty = true;

      if (this.options.autoSave) {
        this.save();
      }
    }
  }

  /**
   * Retrieve all stored vector data
   * @returns {VectorData[]} Array of all stored vector data
   */
  getAll(): VectorData[] {
    return [...this.cache];
  }

  /**
   * Get the number of items in the store
   * @returns {number} Total number of vector data items
   */
  count(): number {
    return this.cache.length;
  }

  /**
   * Save the current state of the vector store to disk
   */
  save(): void {
    if (!this.dirty || !this.options.filePath) return;

    try {
      // Create directory if it doesn't exist
      const dir = dirname(this.options.filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      writeFileSync(this.options.filePath, JSON.stringify(this.cache), 'utf8');
      this.dirty = false;
    } catch (error) {
      console.error('Error saving vector store:', error);
    }
  }

  /**
   * Load vector data from disk
   * @private
   */
  private load(): void {
    if (!this.options.filePath) return;

    try {
      if (existsSync(this.options.filePath)) {
        const data = readFileSync(this.options.filePath, 'utf8');
        this.cache = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading vector store:', error);
      this.cache = [];
    }
  }
}
