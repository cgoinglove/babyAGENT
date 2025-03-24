import { graphStateNode } from 'ts-edge';
import { YoutubeReportState } from '../state';

import { streamObject } from 'ai';
import { models } from '@examples/models';
import { z } from 'zod';

// 분류 결과를 위한 스키마
const ClassifierSchema = z.object({
  type: z
    .enum(['youtube', 'standard'])
    .describe('Query type: youtube=YouTube video analysis request, standard=general question'),
  reason: z.string().describe('Brief explanation for classification decision'),
});

export const analysisNode = graphStateNode({
  name: 'analysis',
  metadata: {
    description: '사용자 질문에서 유튜브 URL을 감지하고 의도를 파악하여 분류하는 노드',
  },
  execute: async (state: YoutubeReportState, { stream }) => {
    const userPrompt = state.userPrompt;

    state.update({
      startedAt: Date.now(),
    });
    const hasYoutubeUrl = userPrompt.includes('youtube.com') || userPrompt.includes('youtu.be');
    const prompt = `

# 당신은 사용자 질문을 분석하여 유튜브 영상 분석 요청인지 일반 질문인지 분류하는 AI입니다.

#### 분석 지침

1. 사용자가 유튜브 영상 분석을 요청하는 의도가 있는지 파악하세요.
2. ${hasYoutubeUrl ? '사용자 질문에 유튜브 관련 URL이 포함되어 있습니다.' : '사용자 질문에 유튜브 URL이 없기 때문에 strandard로 분류합니다.'}

#### 사용자 질문:
${userPrompt}
    
    
`.trim();

    const response = await streamObject({
      model: models.standard,
      schema: ClassifierSchema,
      prompt,
    });
    for await (const chunk of response.textStream) {
      stream(chunk);
    }

    const analysis = await response.object;
    const useToken = (await response.usage).totalTokens;

    state.update({
      analysis: {
        prompt,
        tokens: useToken,
        type: analysis.type.trim() as 'youtube' | 'standard',
        reason: analysis.reason.trim(),
      },
    });
  },
});
