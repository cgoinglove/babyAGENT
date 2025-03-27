import OpenAI from 'openai';
import { Uploadable } from 'openai/uploads.mjs';

const openai = new OpenAI();

export interface TextToSpeechOptions {
  /** @TODO 추가 옵션 */
  input: string;
}

export interface TextToSpeechResult {
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export interface SpeechToTextOptions {
  /** @TODO 추가 옵션 */
  file: Uploadable;
}

export interface SpeechToTextResult {
  text: string;
}

export const tts = async (options: TextToSpeechOptions): Promise<TextToSpeechResult> => {
  const mp3 = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    input: options.input,
    response_format: 'mp3',
    instructions: 'friendly and casual high tone',
  });

  return mp3;
};

export const stt = async (options: SpeechToTextOptions) => {
  const transcription = await openai.audio.transcriptions.create({
    file: options.file,
    model: 'gpt-4o-transcribe',
  });
  return {
    text: transcription.text,
  };
};
