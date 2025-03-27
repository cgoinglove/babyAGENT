import { test } from 'vitest';
import fs from 'fs';
import { generateText } from 'ai';
import { stt, tts } from '@friday/ai/speech';
import { models } from '@friday/ai/llm';
import { join } from 'path';

test('v-1', async () => {
  const currentDir = join(process.cwd(), '__test__/speach');
  console.time('stt');
  const transcription = await stt({
    file: fs.createReadStream(join(currentDir, 'query.mp3')),
  });
  console.timeEnd('stt');
  console.log(transcription.text);

  console.time('generate');
  const answer = await generateText({
    model: models.small,
    system:
      'You are Friday, an AI voice assistant designed for natural conversations. Keep your responses concise, clear, and conversational. Avoid complex explanations or long lists. Use simple sentences that are easy to listen to and understand. Provide all essential information without assuming follow-up questions. When input is ambiguous, interpret it in the most relevant way possible. Remember that your responses will be spoken aloud, so optimize your language for speech rather than reading.',
    prompt: transcription.text,
  }).then((res) => res.text);
  console.log(answer);
  console.timeEnd('generate');

  console.time('tts');
  const response = await tts({
    input: answer,
  });

  console.timeEnd('tts');
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(join(currentDir, 'answer.mp3'), buffer);
});
