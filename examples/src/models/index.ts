import '@shared/env/global';
import { ollama } from 'ollama-ai-provider';
// import { xai } from '@ai-sdk/xai';
// import { openai } from '@ai-sdk/openai';
// import { anthropic } from '@ai-sdk/anthropic';
import { generateObject, generateText, embed, type LanguageModel, type EmbeddingModel } from 'ai';
import { ZodSchema } from 'zod';
import { memoryVectorStore, MemoryVectorParser, MemoryVectorStoreOptions } from 'memory-vector-store';

/**
 * STUPID_MODEL: 의도적으로 수준이 낮은 모델을 사용함으로써
 * 프롬프트 엔지니어링의 효과를 검증하기 위한 목적으로 선택된 모델입니다.
 * 일반적으로 성능이 낮은 모델에서도 효과적인 프롬프팅 기법은
 * 더 큰 모델에서도 잘 작동한다는 가설을 테스트합니다.
 */
export const STUPID_MODEL = 'gemma3:1b' as const;

export const STANDARD_MODEL = 'gemma3:4b' as const;

export const VECTOR_EMBEDDING_MODEL = 'nomic-embed-text' as const;

export const models = {
  /** @ollama */
  stupid: ollama(STUPID_MODEL),
  standard: ollama(STANDARD_MODEL),
  smart: ollama('gemma3:12b'),
  reasoning: ollama('deepseek-r1:8b'),
  // vector
  embedding: ollama.embedding(VECTOR_EMBEDDING_MODEL) as EmbeddingModel<string>,

  /** @claude */
  // standard: anthropic('claude-3-5-haiku-latest'),
  // smart: anthropic('claude-3-7-sonnet-20250219'),

  /** @grok */
  // standard: xai('grok-2-1212'),

  /** @openai */
  // stupid: gpt4omini: openai('gpt-4o-mini'),
  // standard: gpt4o: openai('gpt-4o'),
  // reasoning: o3mini: openai('o3-mini'),
  // embedding:openai.embedding('text-embedding-3-small')

  /** @deprecated */
  custom: {
    basic: ollama(STUPID_MODEL),
    standard: ollama(STANDARD_MODEL),
    smart: ollama('gemma3:12b'),
    reasoning: ollama('deepseek-r1:8b'),
  },
};

/**
 * LLM 모델에 대한 원시(raw) 문자열 인터페이스를 제공합니다.
 *
 * @param {Model} model - 사용할 LLM 모델
 * @returns {PureLLmFunction} 단순 string -> string 함수
 *
 * @description
 * 이 함수는 의도적으로 최소한의 인터페이스만 제공합니다.
 * 모든 고급 기능(스키마 파싱, 도구 사용, 프롬프트 엔지니어링)은
 * 이 기본 인터페이스 위에 직접 구현해볼 수 있도록 합니다.
 *
 * 내부적으로는 Vercel AI 패키지를 사용하지만, 모든 추상화를 제거하고
 * 사용자가 string to string 같은 로우 프롬프트 형식을 직접 다루도록 강제합니다.
 *
 * 이는 LLM의 내부 작동 방식을 이해하고 학습하기 위한 의도적인 제약입니다.
 */
export const pureLLM = (model: LanguageModel) => (prompt: string) => {
  return generateText({
    prompt,
    model,
  }).then((res) => res.text);
};

export const objectLLM =
  (model: LanguageModel) =>
  <T>(prompt: string, schema: ZodSchema<T>) => {
    return generateObject({
      prompt,
      schema,
      model,
    }).then((res) => res.object as T);
  };

export const createVectorStore = (model: EmbeddingModel<string>, option?: Partial<MemoryVectorStoreOptions>) => {
  const vectorParsor: MemoryVectorParser = async (text) => {
    const result = await embed({
      model,
      value: text,
    });

    return result.embedding;
  };

  return memoryVectorStore(vectorParsor, option);
};
