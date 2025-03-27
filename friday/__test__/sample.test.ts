// import { test } from 'vitest';
// import fs from 'fs';
// import OpenAI from 'openai';
// import { generateText } from 'ai';
// import { models } from '@examples/models';

// const openai = new OpenAI();

// test('v-1', async () => {
//   console.time('query');
//   const transcription = await openai.audio.transcriptions.create({
//     file: fs.createReadStream('query.mp3'),
//     model: 'gpt-4o-transcribe',
//   });
//   console.timeEnd('query');
//   console.log(transcription.text);

//   console.time('generate');
//   const answer = await generateText({
//     model: models.stupid,
//     prompt: transcription.text,
//   }).then((res) => res.text);

//   console.log(answer);
//   console.timeEnd('generate');

//   console.time('tts');
//   const mp3 = await openai.audio.speech.create({
//     model: 'gpt-4o-mini-tts',
//     voice: 'alloy',
//     input: answer,
//   });
//   console.timeEnd('tts');
//   const buffer = Buffer.from(await mp3.arrayBuffer());
//   await fs.promises.writeFile('answer.mp3', buffer);
// });
