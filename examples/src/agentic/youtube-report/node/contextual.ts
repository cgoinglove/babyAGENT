import { graphMergeNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { generateText } from 'ai';
import { models } from '@examples/models';

export const youtubeContextualEnrichmentNode = graphMergeNode({
  name: 'contextual',
  branch: ['related', 'comments'],
  metadata: {
    description: '관련 영상과 댓글 데이터를 통합하여 영상의 맥락적 정보를 풍부하게 하는 노드',
  },
  execute: async ({ related }, { stream }) => {
    const state = related as YoutubeReportState;
    stream('🔄 컨텍스트 데이터 통합 중...');

    // 필요한 데이터 추출
    const metadata = state.youtubeMetadata!;
    const commentsAnalysis = state.commentsAnalysis?.answer || '댓글 분석 데이터 없음';
    const relatedVideos = state.relatedVideos || [];

    // 관련 영상 정보 포맷팅
    const relatedVideosFormatted = relatedVideos
      .slice(0, 5)
      .map((video, index) => `${index + 1}. "${video.title}" (${video.channelTitle})`)
      .join('\n');

    stream('\n\n');

    stream('📊 맥락 분석 생성 중...');

    const prompt = `
    
## 유튜브 영상의 맥락적 위치 분석

#### 영상 정보:
- 제목: ${metadata.title}
- 채널: ${metadata.channelTitle}
- 태그: ${metadata.tags ? metadata.tags.join(', ') : '없음'}

#### 시청자 의견 요약:
${commentsAnalysis}

#### 관련 영상 목록:
${relatedVideosFormatted}

#### 분석 지침:
당신은 유튜브 콘텐츠 생태계 전문가입니다. 위 정보를 바탕으로 이 영상의 맥락적 위치와 의미를 분석해주세요:

1. **콘텐츠 생태계 위치**: 이 영상이 속한 콘텐츠 생태계(주제, 장르, 커뮤니티)에서 차지하는 위치를 파악하세요.

2. **시청자 요구 분석**: 댓글 분석을 바탕으로 시청자들이 이 콘텐츠에서 찾고자 하는 가치와 미충족된 요구를 파악하세요.

3. **경쟁/유사 콘텐츠 분석**: 관련 영상 목록을 바탕으로 경쟁 또는 보완적 콘텐츠 동향을 파악하세요.

4. **틈새시장 기회**: 이 영상과 관련 콘텐츠 사이에 존재하는 틈새 기회나 발전 방향을 제시하세요.

5. **관련 콘텐츠 추천**: 이 영상을 시청한 사람들에게 가장 가치 있을 3가지 관련 콘텐츠를 추천하고 이유를 설명하세요.

응답은 마크다운 형식으로 각 섹션을 명확히 구분하여 작성하세요. 분석은 데이터에 기반하되, 실질적인 통찰력을 제공해야 합니다.

`.trim();

    const response = await generateText({
      model: models.standard,
      prompt,
    });
    stream('\n\n');
    stream('🔍 맥락 분석 완료');

    // 상태 업데이트
    state.update({
      contextualAnalysis: {
        prompt,
        tokens: response.usage.totalTokens,
        answer: response.text,
      },
    });
  },
});
