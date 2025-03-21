import { MemoryVectorParser } from 'memory-vector-store';
import { EmbeddingModel } from 'ai';
import { embed } from 'ai';
import { models } from '.';
import { MemoryVectorStoreOptions, memoryVectorStore } from 'memory-vector-store';

export const createVectorStore = (
  model: EmbeddingModel<string> = models.embedding,
  option?: Partial<MemoryVectorStoreOptions>
) => {
  const vectorParsor: MemoryVectorParser = async (text) => {
    const result = await embed({
      model,
      value: text,
    });

    return result.embedding;
  };

  return memoryVectorStore(vectorParsor, option);
};
