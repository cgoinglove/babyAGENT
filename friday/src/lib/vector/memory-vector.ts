import { MemoryVectorParser } from 'memory-vector-store';
import { EmbeddingModel } from 'ai';
import { embed } from 'ai';

import { MemoryVectorStoreOptions, memoryVectorStore } from 'memory-vector-store';
import { models } from '@friday/ai/llm';

export const mvs = (model: EmbeddingModel<string> = models.embedding, option?: Partial<MemoryVectorStoreOptions>) => {
  const vectorParser: MemoryVectorParser = async (text) => {
    const result = await embed({
      model,
      value: text,
    });

    return result.embedding;
  };
  return memoryVectorStore(vectorParser, option);
};
