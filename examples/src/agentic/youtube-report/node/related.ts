import { graphStateNode } from 'ts-edge';
import { YoutubeReportState } from '../state';
import { google } from 'googleapis';
import { generateText } from 'ai';
import { models } from '@examples/models';

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

    const query = await generateText({
      model: models.standard,
      prompt: `다음 유튜브 영상의 제목과 태그를 보고 관련 영상을 찾기 위한 검색어를 생성해주세요. 검색어만 출력하세요. 부가 설명 없이 키워드만 간결하게 작성해주세요. 최대 10글자 이내로 작성해주세요. 영상제목을 보고 카테고리만 추출해도 됩니다.

    제목: "${metadata.title}"
    태그: "${Array.from(new Set(metadata.tags)).join(', ')}"`,
    }).then((res) => res.text);

    const relatedVideos = await Promise.allSettled([
      youtube.search.list({
        part: ['snippet'],
        channelId: metadata.channelId,
        maxResults: 3,
        type: ['video'],
      }),

      youtube.search.list({
        part: ['snippet'],
        q: query,
        maxResults: 3,
        type: ['video'],
        relevanceLanguage: metadata.lang || 'en',
      }),
    ]).then((res) => {
      return res
        .filter((v) => v.status == 'fulfilled')
        .flatMap((v) => v.value.data.items ?? [])
        .filter((v) => v.id?.videoId != metadata.id)
        .map((v) => ({
          id: v.id?.videoId || '',
          title: v.snippet?.title || '',
          channelTitle: v.snippet?.channelTitle || '',
          thumbnailUrl: v.snippet?.thumbnails?.high?.url || '',
          publishedAt: v.snippet?.publishedAt || '',
          isSameChannel: v.snippet?.channelId === metadata.channelId,
        }));
    });

    stream(
      JSON.stringify({
        query,
        relatedVideos,
      })
    );

    state.update({
      relatedVideos,
    });
  },
});
