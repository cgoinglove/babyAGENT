import { graphStateNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { google } from 'googleapis';

export const youtubeRelatedListNode = graphStateNode({
  name: 'related',
  metadata: {
    description: '현재 유튜브 영상과 관련된 추천 콘텐츠 목록을 조회하는 노드',
  },
  execute: async (state: YoutubeReportState, { stream }) => {
    const metadata = state.youtubeMetadata!;

    const youtube = google.youtube({
      version: 'v3',
      auth: process.env.GOOGLE_API_KEY,
    });

    const relatedVideos = await Promise.allSettled([
      youtube.search.list({
        part: ['snippet'],
        channelId: metadata.channelId,
        maxResults: 2,
        type: ['video'],
        videoCategoryId: metadata.categoryId,
      }),

      youtube.search.list({
        part: ['snippet'],
        q: metadata.title,
        maxResults: 2,
        type: ['video'],
        relevanceLanguage: metadata.lang || 'en',
      }),
    ]).then((res) => {
      return res
        .filter((v) => v.status == 'fulfilled')
        .flatMap((v) => v.value.data.items ?? [])
        .map((v) => ({
          id: v.id?.videoId || '',
          title: v.snippet?.title || '',
          channelTitle: v.snippet?.channelTitle || '',
          thumbnailUrl: v.snippet?.thumbnails?.high?.url || '',
          publishedAt: v.snippet?.publishedAt || '',
          isSameChannel: v.snippet?.channelId === metadata.channelId,
        }));
    });

    stream(JSON.stringify(relatedVideos));

    state.update({
      relatedVideos,
    });
  },
});
