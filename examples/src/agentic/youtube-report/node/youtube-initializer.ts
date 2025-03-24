import { google } from 'googleapis';
import { graphStateNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { safe } from 'ts-safe';
import { extractYoutubeVideoId } from './helper';
export const youtubeInitializerNode = graphStateNode({
  name: 'youtube initializer',
  metadata: {
    description: '유튜브 영상 분석을 위한 초기화 노드',
  },
  async execute(state: YoutubeReportState, context) {
    let standardReason = '';

    const googleApiKey = process.env.GOOGLE_API_KEY;
    const videoIdResult = safe(state.userPrompt).map(extractYoutubeVideoId);
    if (!googleApiKey) {
      standardReason =
        '시스템에 YouTube API 키가 구성되어 있지 않아 YouTube 분석을 수행할 수 없습니다. 대신 일반적인 정보로 응답해 주세요. 사용자에게 시스템 관리자에게 API 키 설정을 문의하라고 안내해주세요.';
      context.stream('⚠️ YouTube API 키가 설정되지 않았습니다.');
    } else if (!videoIdResult.isOk) {
      standardReason =
        '사용자가 제공한 URL에서 유효한 YouTube 비디오 ID를 추출할 수 없습니다. 유효한 YouTube URL 형식(예: youtube.com/watch?v=VIDEO_ID 또는 youtu.be/VIDEO_ID)에 대해 안내하고, 올바른 링크로 다시 시도해달라고 요청해주세요.';
      context.stream('⚠️ 유효한 YouTube URL을 찾을 수 없습니다.');
    }
    console.log({ standardReason });
    if (standardReason) {
      return state.update((prev) => ({
        analysis: {
          prompt: prev.analysis!.prompt,
          tokens: prev.analysis!.tokens,
          type: 'standard',
          reason: standardReason,
        },
      }));
    }

    const videoId = videoIdResult.unwrap();

    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY,
    });

    const response = await youtube.videos.list({
      id: [videoId],
      part: ['snippet', 'statistics', 'topicDetails'],
    });
    const { visitorId, items } = response.data;
    const item = items?.[0];
    context.stream(
      JSON.stringify({
        id: visitorId,
        title: item?.snippet?.title,
        channelTitle: item?.snippet?.channelTitle,
        thumbnailUrl: item?.snippet?.thumbnails?.default?.url,
        viewCount: item?.statistics?.viewCount,
        likeCount: item?.statistics?.likeCount,
      })
    );

    const metadata = response.data?.items?.[0];

    if (!metadata) {
      throw new Error('유튜브 메타데이터를 찾을 수 없습니다.');
    }

    const { snippet, statistics, topicDetails } = metadata;

    state.update({
      youtubeMetadata: {
        id: videoId,
        channelId: snippet?.channelId || '',
        categoryId: snippet?.categoryId || '',
        publishedAt: snippet?.publishedAt || '',
        title: snippet?.title || '',
        description: snippet?.description || '',
        channelTitle: snippet?.channelTitle || '',
        tags: snippet?.tags ?? [],
        thumbnailUrl: {
          standard: snippet?.thumbnails?.standard?.url || '',
          maxres: snippet?.thumbnails?.maxres?.url || '',
        },
        lang: snippet?.defaultLanguage || 'ko',
        viewCount: Number(statistics?.viewCount || 0),
        likeCount: Number(statistics?.likeCount || 0),
        commentCount: Number(statistics?.commentCount || 0),
        categoriesUrls: topicDetails?.topicCategories ?? [],
      },
    });

    console.dir(metadata, { depth: null });
  },
});
