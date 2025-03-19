import { join } from 'path';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { Locker } from '@shared/util';

const _debounce = (() => {
  const cache = new Map<string, ReturnType<typeof setTimeout>>();
  return (key: string, func: () => void, delay: number) => {
    const timeout = cache.get(key);
    if (timeout) {
      clearTimeout(timeout);
    }
    cache.set(key, setTimeout(func, delay));
  };
})();

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
  debug?: boolean;
  maxFileSizeMB?: number;
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
  private cache: Map<string, VectorData> = new Map();
  /** @private */
  private dirty: boolean = false;

  private saveLock = new Locker();

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
    this.saveLock.unLock();
    this.options = {
      autoSave: true,
      maxFileSizeMB: 500, // 기본값 500MB
      filePath: (options?.autoSave ?? true) ? join(process.cwd(), 'node_modules/__mvsl__/data.json') : undefined,
      ...options,
    };

    this.load();
  }

  private truncateLog(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
  /**
   * Add a new piece of data to the vector store
   * @param {string} data - The text data to add
   * @returns {Promise<VectorData>} The added vector data
   */
  async add(data: string): Promise<VectorData> {
    if (this.cache.has(data)) {
      if (this.options.debug) console.log(`[LiteMemoryVectorStore] Cache hit for: "${this.truncateLog(data)}"`);
      return this.cache.get(data)!;
    }

    if (this.options.debug) console.log(`[LiteMemoryVectorStore] Adding new item: "${this.truncateLog(data)}"`);
    const vector = await this.vectorParsor(data);
    const vectorData = { data, vector };

    this.cache.set(data, vectorData);
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
    await this.saveLock.wait();
    const queryVector = this.cache.get(query)?.vector ?? (await this.vectorParsor(query));

    let candidates = Array.from(this.cache.values());
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
    const initialLength = this.cache.size;
    this.cache.delete(data);

    if (this.cache.size !== initialLength) {
      this.dirty = true;

      if (this.options.autoSave) {
        this.save();
      }
    }
  }

  /**
   * Clear all data from the vector store
   */
  clear(): void {
    if (this.cache.size > 0) {
      this.cache.clear();
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
    return Array.from(this.cache.values());
  }

  /**
   * Get the number of items in the store
   * @returns {number} Total number of vector data items
   */
  count(): number {
    return this.cache.size;
  }

  /**
   * Save the current state of the vector store to disk
   */
  async save(): Promise<void> {
    if (!this.dirty || !this.options.filePath) return Promise.resolve();

    this.saveLock.lock();
    _debounce(
      this.options.filePath,
      () => {
        try {
          const dir = dirname(this.options.filePath!);
          if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
          }

          const allData = this.getAll();
          const maxSizeBytes = (this.options.maxFileSizeMB || 500) * 1024 * 1024;

          const serializedData = allData.map(this.serializeItem);
          let jsonData = JSON.stringify(serializedData);
          let dataSize = Buffer.byteLength(jsonData, 'utf8');

          if (dataSize > maxSizeBytes && serializedData.length > 0) {
            if (this.options.debug) {
              console.log(
                `[LiteMemoryVectorStore] Data size (${this.formatSize(dataSize)}) exceeds limit (${this.formatSize(maxSizeBytes)})`
              );
            }

            while (dataSize > maxSizeBytes && serializedData.length > 0) {
              serializedData.shift();
              jsonData = JSON.stringify(serializedData);
              dataSize = Buffer.byteLength(jsonData, 'utf8');
            }

            if (this.options.debug) {
              console.log(
                `[LiteMemoryVectorStore] Trimmed to ${serializedData.length} items (${this.formatSize(dataSize)})`
              );
            }
            this.cache.clear();
            for (const item of serializedData.map(this.deserializeItem)) {
              this.cache.set(item.data, item);
            }
          }

          writeFileSync(this.options.filePath!, jsonData, 'utf8');
          this.dirty = false;

          if (this.options.debug) {
            console.log(
              `[LiteMemoryVectorStore] Save completed. ${serializedData.length} items saved (${this.formatSize(dataSize)})`
            );
          }
        } catch (error) {
          console.error('Error saving vector store:', error);
        } finally {
          this.saveLock.unLock();
        }
      },
      100
    );
    return this.saveLock.wait();
  }
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
        const vectorDatas = JSON.parse(data ?? '[]').map(this.deserializeItem);
        for (const vectorData of vectorDatas) {
          this.cache.set(vectorData.data, vectorData);
        }
        if (this.options.debug) console.log(`[LiteMemoryVectorStore] Loaded ${this.cache.size} items.`);
      } else if (this.options.debug) {
        console.log(`[LiteMemoryVectorStore] No data file found at: ${this.options.filePath}`);
      }
    } catch (error) {
      console.error('Error loading vector store:', error);
      this.cache = new Map();
    }
  }

  private serializeItem(data: VectorData): [string, number[]] {
    return [data.data, data.vector];
  }

  private deserializeItem(data: [string, number[]]): VectorData {
    return { data: data[0], vector: data[1] };
  }
}
