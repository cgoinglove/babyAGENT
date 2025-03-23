import { graphStateNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { generateText } from 'ai';
import { models } from '@examples/models';

export const standardOutputNode = graphStateNode({
  name: 'output',
  metadata: {
    description: '일반 질문에 대한 응답을 생성하는 노드',
  },
  execute: async (state: YoutubeReportState, { stream }) => {
    const userPrompt = state.userPrompt;
    const analysis = state.analysis!;

    stream('💬 일반 응답 생성 중...');

    const prompt = `


## 당신은 지능형 AI 어시스턴트입니다.

#### 사용자 질문:
> "${userPrompt}"

#### 분석 정보:
> ${analysis.reason}

### 응답 지침:
1. 사용자의 질문에 친절하고 정확하게 답변하세요.
2. 유튜브 분석 관련 질문이라면, 유효한 유튜브 URL을 포함하여 다시 질문하도록 안내하세요.
3. 자연스럽고 대화적인 톤으로 응답하세요.
4. 필요한 경우 추가 정보를 요청하여 더 정확한 응답을 제공하세요.
5. 답변은 간결하면서도 충분한 정보를 담고 있어야 합니다.


`.trim();

    const response = await generateText({
      model: models.beta,
      prompt: prompt,
    });
    state.update({
      output: {
        prompt,
        tokens: response.usage.totalTokens,
        answer: response.text,
      },
    });
  },
});
