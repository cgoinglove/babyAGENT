import { ollama } from 'ollama-ai-provider';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { LanguageModel, EmbeddingModel } from 'ai';

type CustomModel = {
  small: LanguageModel;
  medium: LanguageModel;
  large: LanguageModel;
  reasoning: LanguageModel;
  embedding: EmbeddingModel<string>;
};

export const OPEN_AI_PRESET: CustomModel = {
  small: openai('gpt-4o-mini'),
  medium: openai('gpt-4o-mini'),
  large: openai('gpt-4o'),
  reasoning: openai('o3-mini'),
  embedding: openai.embedding('text-embedding-3-small'),
};

export const GOOGLE_PRESET: CustomModel = {
  small: google('gemini-2.0-flash-lite-preview-02-05'),
  medium: google('gemini-2.0-flash-exp'),
  large: google('gemini-2.0-pro-exp-02-05'),
  reasoning: google('gemini-2.0-flash-thinking-exp-01-21'),
  embedding: google.embedding('text-embedding-004'),
};

export const OLLAMA_PRESET: CustomModel = {
  small: ollama('gemma3:1b'),
  medium: ollama('gemma3:4b'),
  large: ollama('gemma3:12b'),
  reasoning: ollama('deepseek-r1:8b'),
  embedding: ollama.embedding('nomic-embed-text'),
};

export const models = OPEN_AI_PRESET;
