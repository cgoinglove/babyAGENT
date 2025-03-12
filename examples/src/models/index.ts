import { ollama } from 'ollama-ai-provider';
import { xai } from '@ai-sdk/xai';
import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, LanguageModelV1 } from 'ai';
import { ZodSchema } from 'zod';

/**
 * STUPID_MODEL: 의도적으로 수준이 낮은 모델을 사용함으로써
 * 프롬프트 엔지니어링의 효과를 검증하기 위한 목적으로 선택된 모델입니다.
 * 일반적으로 성능이 낮은 모델에서도 효과적인 프롬프팅 기법은
 * 더 큰 모델에서도 잘 작동한다는 가설을 테스트합니다.
 */
export const STUPID_MODEL = 'qwen2.5-coder:1.5b' as const;

export const STANDARD_MODEL = 'mistral' as const;

export const models = {
  stupid: ollama(STUPID_MODEL),
  custom: {
    /** 1~3B */
    basic: ollama(STUPID_MODEL),
    /** 6~7B */
    standard: ollama(STANDARD_MODEL),
    /** 추론가능모델 */
    smart: ollama('deepseek-r1:7b'), // object 안됨
  },

  ollama: {
    mistral: ollama('mistral'),
    llama3: ollama('amigo/llama3.2korean'), // 한국말잘함
    deepseekr1: ollama('deepseek-r1:7b'),
  },
  grok: {
    grok2: xai('grok-2-1212'),
    beta: xai('grok-beta'),
  },
  openai: {
    o1mini: openai('o1-mini'),
    o3mini: openai('o3-mini'),
    gpt4omini: openai('gpt-4o-mini'),
    gpt4o: openai('gpt-4o'),
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
export const pureLLM = (model: LanguageModelV1) => (prompt: string) => {
  return generateText({
    prompt,
    model,
  }).then((res) => res.text);
};

export const objectLLM =
  (model: LanguageModelV1) =>
  <T>(prompt: string, schema: ZodSchema<T>) => {
    return generateObject({
      prompt,
      schema,
      model,
    }).then((res) => res.object as T);
  };
