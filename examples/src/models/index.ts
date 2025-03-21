import '@shared/env/global';
import { ollama } from 'ollama-ai-provider';
// import { xai } from '@ai-sdk/xai';
// import { openai } from '@ai-sdk/openai';
// import { anthropic } from '@ai-sdk/anthropic';
import { type EmbeddingModel } from 'ai';

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
};
