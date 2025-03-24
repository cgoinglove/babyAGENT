import { graphStateNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { generateText } from 'ai';
import { models } from '@examples/models';
import { google } from 'googleapis';

export const youtubeCommentsAnalysisNode = graphStateNode({
  name: 'comments',
  metadata: {
    description: '유튜브 영상의 댓글을 분석하는 노드',
  },
  execute: async (state: YoutubeReportState, { stream }) => {
    const metadata = state.youtubeMetadata!;

    stream('댓글 조회중...');
    stream('\n\n');

    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY,
    });
    const googleResponse = await youtube.commentThreads.list({
      part: ['snippet'],
      maxResults: 20,
      videoId: metadata.id,
      order: 'relevance',
    });

    stream(`${googleResponse.data.items?.length}개의 댓글을 찾았습니다.`);
    const comments =
      googleResponse.data.items?.map((item) => {
        return {
          author: item.snippet?.topLevelComment?.snippet?.authorDisplayName ?? 'user',
          text: item.snippet?.topLevelComment?.snippet?.textOriginal ?? '',
          display: item.snippet?.topLevelComment?.snippet?.textDisplay ?? '',
          likeCount: item.snippet?.topLevelComment?.snippet?.likeCount ?? 0,
        };
      }) ?? [];

    const prompt = `
다음 유튜브 영상 "${metadata.title}"의 댓글들을 분석하여 핵심 내용만 간결하게 요약해주세요:    

${comments.map((c) => `- ${c.author}:"${c.text}"`).join('\n')}


주요 반응, 공통된 의견, 시청자들이 가장 인상 깊게 느낀 점, 질문이나 피드백 등을 포함해 3-5개 요점으로 정리해주세요.
    
    `.trim();

    stream('\n\n');

    stream('🔍 댓글 분석 중...');

    const response = await generateText({
      model: models.standard,
      prompt,
    });

    stream('\n\n');

    stream('✅ 댓글 분석 완료');

    state.update({
      commentsAnalysis: {
        comments,
        prompt,
        answer: response.text,
        tokens: response.usage.totalTokens,
      },
    });
  },
});
