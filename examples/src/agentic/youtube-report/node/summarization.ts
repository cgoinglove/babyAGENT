import { graphMergeNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { generateText } from 'ai';
import { models } from '@examples/models';

export const youtubeSummarizationNode = graphMergeNode({
  name: 'summarization',
  branch: ['thumbnail', 'comments', 'scripts'],
  metadata: {
    description: '유튜브 영상의 핵심 내용을 요약하는 노드',
  },
  execute: async (nodes, { stream }) => {
    const state = nodes.comments as YoutubeReportState;
    stream('🔍 요약 중...');
    const { scriptAnalysis, commentsAnalysis, thumbnailAnalysis, youtubeMetadata } = state;

    const script = scriptAnalysis?.answer || '스크립트 분석 결과 없음';
    const comments = commentsAnalysis?.answer || '댓글 분석 결과 없음';
    const thumbnail = thumbnailAnalysis?.answer || '썸네일 분석 결과 없음';

    const systemDate = new Date().toString();

    const { title, channelTitle, commentCount, description, lang, likeCount, publishedAt, tags } = youtubeMetadata!;

    const prompt = `## 유튜브 영상 종합 분석 보고서 작성

#### 현재 시간: ${systemDate}

#### 영상 기본 정보:
- 제목: ${title}
- 채널: ${channelTitle}
- 게시일: ${publishedAt}
- 좋아요 수: ${likeCount}
- 댓글 수: ${commentCount}
- 언어: ${lang || '불명확'}
- 태그: ${tags ? tags.join(', ') : '없음'}

### 분석 데이터:
1) 스크립트/자막 분석:
${script}

2) 댓글 분석:
${comments}

3) 썸네일 분석:
${thumbnail}

4) 영상 설명:
${description}

### 요약 지침:
당신은 유튜브 컨텐츠 전문 분석가입니다. 위 데이터를 바탕으로 이 유튜브 영상에 대한 포괄적이고 통찰력 있는 종합 보고서를 작성해주세요. 보고서는 다음 섹션을 포함해야 합니다:

1. **핵심 요약** (영상의 주요 내용과 목적을 2-3문장으로 간결하게 요약)

2. **주요 내용 분석** (영상에서 다루는 핵심 주제와 정보를 5-7개 항목으로 구조화하여 설명)

3. **시청자 반응 분석** (댓글 분석을 바탕으로 시청자들의 주요 의견, 질문, 감정 요약)

4. **시각적 요소 분석** (썸네일과 영상 스타일이 주는 인상과 메시지)

5. **강점과 개선점** (영상의 두드러진 장점과 잠재적 개선 가능성)

6. **타겟 오디언스** (이 영상이 어떤 시청자층을 대상으로 하는지 분석)

7. **결론 및 가치 제안** (이 영상이 시청자에게 제공하는 핵심 가치와 차별점)

각 섹션은 구체적인 예시와 근거를 포함해야 하며, 단순 나열이 아닌 의미 있는 통찰을 제공해야 합니다. 분석은 객관적이면서도 영상 제작자에게 도움이 될 만한 건설적인 피드백을 담아주세요.

영상 유형(교육, 엔터테인먼트, 게임, 제품 리뷰 등)에 적합한 분석을 제공해주세요.


`.trim();

    const response = await generateText({
      model: models.standard,
      prompt,
    });

    stream(response.text);

    state.update({
      summary: {
        prompt,
        tokens: response.usage.totalTokens,
        answer: response.text,
      },
    });
  },
});
