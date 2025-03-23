import { graphStateNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { generateText } from 'ai';
import { models } from '@examples/models';
import { YoutubeTranscript } from 'youtube-transcript';
export const youtubeTranscriptAnalysisNode = graphStateNode({
  name: 'scripts',
  metadata: {
    description: '유튜브 영상의 자막을 분석하여 내용을 요약하는 노드',
  },
  execute: async (state: YoutubeReportState, { stream }) => {
    const metadata = state.youtubeMetadata!;
    const videoId = metadata.id;

    stream('자막 조회중...');
    stream('\n\n');
    const transcriptResult = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: metadata.lang,
    });
    stream(`${transcriptResult.length}개의 내용을 찾았습니다.`);

    const transcript = transcriptResult.map((v) => v.text);

    const prompt = `
    
다음은 "${metadata.title}" 유튜브 영상의 자막입니다:

자막을 바탕으로 영상의 핵심 내용을 5단계로 요약해주세요.

영상에서 다루는 주요 주제, 중요한 정보, 결론 등을 포함하세요.

> ${transcript.join(' ')}
`.trim();

    stream('\n\n');
    stream('🔎 자막 분석 중...');

    const response = await generateText({
      model: models.standard,
      prompt,
    });

    stream('\n\n');
    stream('✅ 자막 분석 완료');

    state.update({
      scriptAnalysis: {
        scripts: transcript,
        prompt,
        answer: response.text,
        tokens: response.usage.totalTokens,
      },
    });
  },
});
