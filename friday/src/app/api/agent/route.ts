import '@shared/env/global';
import { models } from '@friday/ai/llm';
import { tts } from '@friday/ai/speech';
import { generateText } from 'ai';
import { safe } from 'ts-safe';

// TODO: 브라우저 SpeechRecognition API의 인식률이 낮은 경우를 위한 STT 대체 로직 추가 검토
// STT는 일단 제거하고 브라우저 API로 대체하며, 나중에 필요시 하이브리드 접근법 고려

// 텍스트 -> LLM -> TTS 파이프라인
const textToSpeechPipeline = safe.pipe(
  (text: string) => {
    return generateText({
      model: models.small,
      system:
        'You are Friday, an AI voice assistant designed for natural conversations. Keep your responses concise, clear, and conversational. Avoid complex explanations or long lists. Use simple sentences that are easy to listen to and understand. Provide all essential information without assuming follow-up questions. When input is ambiguous, interpret it in the most relevant way possible. Remember that your responses will be spoken aloud, so optimize your language for speech rather than reading.',
      prompt: text,
    });
  },
  (answer) => {
    return tts({
      input: answer.text,
    });
  }
);

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response('텍스트가 필요합니다.', { status: 400 });
    }

    // 텍스트 -> 음성 파이프라인 실행
    const result = await textToSpeechPipeline(text);
    const audioBuffer = await (await result.unwrap()).arrayBuffer();

    // 응답 반환
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('텍스트 처리 중 오류:', error);
    return new Response('텍스트 처리 중 오류가 발생했습니다.', { status: 500 });
  }
}
