import { graphStateNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { generateText } from 'ai';
import { models } from '@examples/models';

export const youtubeThumbnailAnalysisNode = graphStateNode({
  name: 'thumbnail',
  metadata: {
    description: '유튜브 영상의 썸네일 이미지를 분석하는 노드',
  },
  execute: async (state: YoutubeReportState, { stream }) => {
    const metadata = state.youtubeMetadata!;

    const thumbnailUrl = metadata.thumbnailUrl.standard || metadata.thumbnailUrl.maxres;

    if (!thumbnailUrl) {
      state.update({
        thumbnailAnalysis: {
          prompt: '',
          tokens: 0,
          answer: 'thumbnail url not found',
        },
      });
      return;
    }

    stream('🖼️ 썸네일 분석 중...');

    const prompt = `

## 당신은 유튜브 영상 썸네일 분석 전문가입니다.

아래 제공된 유튜브 영상 썸네일을 보고, 유튜브 영상 분석 및 리포트 작성을 위한 참고용으로 간략히 분석해주세요.

#### 분석할 영상 정보:
- 채널 이름: ${metadata.channelTitle}
- 영상 제목: ${metadata.title}

#### 썸네일 분석 지침:

1. 강조 요소(텍스트, 인물, 물건, 동작)는 무엇인가요?
2. 썸네일이 제목과 얼마나 잘 연결되어 있나요?
    
    `.trim();

    const response = await generateText({
      model: models.standard,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: new URL(thumbnailUrl),
            },
          ],
        },
      ],
    });

    stream('\n\n');
    stream('✅ 썸네일 분석 완료');
    const tokens = response.usage.totalTokens;
    const answer = response.text;

    state.update({
      thumbnailAnalysis: {
        prompt,
        tokens,
        answer,
      },
    });
  },
});
