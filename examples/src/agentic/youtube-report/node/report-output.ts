import { graphMergeNode } from 'ts-edge';
import { YoutubeReportState } from '../state';

export const youtubeReportOutputNode = graphMergeNode({
  name: 'report-output',
  branch: ['summarization', 'contextual'],
  metadata: {
    description: '유튜브 보고서를 출력하는 노드',
  },
  execute: async (nodes, { stream }) => {
    const state = nodes.summarization as YoutubeReportState;

    const metadata = state.youtubeMetadata!;
    const summary = state.summary?.answer || '요약 데이터 없음';
    const contextualAnalysis = state.contextualAnalysis?.answer || '컨텍스트 분석 데이터 없음';
    const thumbnailAnalysis = state.thumbnailAnalysis?.answer || '';
    const scriptAnalysis = state.scriptAnalysis?.answer || '';

    // 인기 댓글 추출 (좋아요 기준 상위 4개)
    const topComments = state.commentsAnalysis?.comments?.sort((a, b) => b.likeCount - a.likeCount).slice(0, 4) || [];

    // 관련 영상 목록
    const relatedVideos = state.relatedVideos ?? [];

    // 현재 날짜와 실행 시간 계산
    const now = new Date();
    const formattedDate = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`;

    // 실행 시간 계산 (밀리초 단위)
    const startTime = state.startedAt || now.getTime();
    const executionTimeMs = now.getTime() - startTime;

    // 실행 시간을 분/초로 변환
    const executionTimeMinutes = Math.floor(executionTimeMs / 60000);
    const executionTimeSeconds = ((executionTimeMs % 60000) / 1000).toFixed(2);
    const executionTimeFormatted =
      executionTimeMinutes > 0 ? `${executionTimeMinutes}분 ${executionTimeSeconds}초` : `${executionTimeSeconds}초`;

    // 토큰 사용량 계산
    const tokensUsed =
      (state.analysis?.tokens || 0) +
      (state.thumbnailAnalysis?.tokens || 0) +
      (state.scriptAnalysis?.tokens || 0) +
      (state.commentsAnalysis?.tokens || 0) +
      (state.contextualAnalysis?.tokens || 0) +
      (state.summary?.tokens || 0);

    // 영상 URL 생성
    const videoUrl = `https://www.youtube.com/watch?v=${metadata.id}`;

    // 보고서 제목
    const reportTitle = `YouTube 영상 분석 보고서: ${metadata.title}`;

    // 마크다운 보고서 생성 시작 (순수 마크다운만 사용)
    let report = `# ${reportTitle}\n\n`;
    report += `*분석 날짜: ${formattedDate}*\n\n`;

    // 분석 메트릭스 추가
    report += `### 분석 메트릭스\n`;
    report += `- **실행 시간**: ${executionTimeFormatted}\n`;
    report += `- **사용된 토큰**: ${tokensUsed.toLocaleString()} 토큰\n`;
    report += `- **분석된 댓글**: ${state.commentsAnalysis?.comments?.length || 0}개\n`;
    report += `- **관련 영상**: ${relatedVideos.length}개\n\n`;

    // 목차
    report += `## 목차\n`;
    report += `1. [영상 정보](#영상-정보)\n`;
    report += `2. [영상 요약](#영상-요약)\n`;
    report += `3. [컨텍스트 분석](#컨텍스트-분석)\n`;
    report += `4. [인기 댓글](#인기-댓글)\n`;
    report += `5. [관련 영상](#관련-영상)\n\n`;

    // 1. 영상 정보
    report += `## 영상 정보\n\n`;
    report += `[![썸네일](${metadata.thumbnailUrl.maxres || metadata.thumbnailUrl.standard})](${videoUrl})\n\n`;
    report += `**제목**: ${metadata.title}\n\n`;
    report += `**채널**: ${metadata.channelTitle}\n\n`;
    report += `**게시일**: ${new Date(metadata.publishedAt).toLocaleDateString()}\n\n`;
    report += `**조회수**: ${metadata.viewCount.toLocaleString()}회\n\n`;
    report += `**좋아요**: ${metadata.likeCount.toLocaleString()}개\n\n`;
    report += `**댓글수**: ${metadata.commentCount.toLocaleString()}개\n\n`;

    if (metadata.tags && metadata.tags.length > 0) {
      report += `**태그**: ${metadata.tags.join(', ')}\n\n`;
    }

    if (metadata.description) {
      report += `**설명**:\n\n`;
      report += `\`\`\`\n${metadata.description.substring(0, 500)}${metadata.description.length > 500 ? '...' : ''}\n\`\`\`\n\n`;
    }

    // 2. 영상 요약
    report += `## 영상 요약\n\n`;
    report += `${summary}\n\n`;

    if (thumbnailAnalysis) {
      report += `### 썸네일 분석\n\n`;
      report += `${thumbnailAnalysis}\n\n`;
    }

    if (scriptAnalysis) {
      report += `### 스크립트 분석\n\n`;
      report += `${scriptAnalysis}\n\n`;
    }

    // 3. 컨텍스트 분석
    report += `## 컨텍스트 분석\n\n`;
    report += `${contextualAnalysis}\n\n`;

    // 4. 인기 댓글 - 순수 마크다운 형식으로 변경
    report += `## 인기 댓글\n\n`;
    if (topComments.length > 0) {
      // 각 댓글을 마크다운 인용구와 함께 표시
      topComments.forEach((comment, index) => {
        report += `### 댓글 ${index + 1}\n\n`;
        report += `> ${comment.text}\n\n`;
        report += `**작성자**: ${comment.author} | **좋아요**: ${comment.likeCount}\n\n`;
        report += `---\n\n`; // 구분선 추가
      });
    } else {
      report += `이 영상에는 댓글이 없거나 댓글 데이터를 가져오지 못했습니다.\n\n`;
    }

    // 5. 관련 영상 - 순수 마크다운 형식으로 변경
    report += `## 관련 영상\n\n`;
    if (relatedVideos.length > 0) {
      relatedVideos.forEach((video, index) => {
        report += `### ${index + 1}. ${video.title}\n\n`;

        // 썸네일 이미지와 링크
        if (video.thumbnailUrl) {
          report += `[![${video.title}](${video.thumbnailUrl})](https://www.youtube.com/watch?v=${video.id})\n\n`;
        }

        report += `**채널**: ${video.channelTitle}\n\n`;
        report += `**게시일**: ${new Date(video.publishedAt).toLocaleDateString()}\n\n`;

        if (video.isSameChannel) {
          report += `**같은 채널의 영상**\n\n`;
        }

        report += `---\n\n`; // 구분선 추가
      });
    } else {
      report += `관련 영상 데이터를 가져오지 못했습니다.\n\n`;
    }

    // 면책 조항
    report += `---\n\n`;
    report += `> *이 보고서는 AI 분석을 통해 자동 생성되었으며, 정확도는 보장되지 않습니다. (생성 시간: ${executionTimeFormatted} | 토큰: ${tokensUsed.toLocaleString()})*\n`;

    // 보고서 스트리밍 출력
    stream(report);

    // 상태 업데이트
    state.update({
      output: {
        prompt: '',
        tokens: 0,
        answer: report,
      },
    });

    return state;
  },
});
