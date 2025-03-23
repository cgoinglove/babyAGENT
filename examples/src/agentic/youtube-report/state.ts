import { Setter } from '@interface';
import { graphStore } from 'ts-edge';

export type YoutubeReportState = {
  userPrompt: string;
  startedAt: number;
  analysis?: {
    prompt: string;
    tokens: number;
    type: 'standard' | 'youtube';
    reason: string;
  };

  youtubeMetadata?: {
    id: string;
    title: string;
    channelId: string;
    categoryId: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
    tags: string[];
    lang: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    thumbnailUrl: {
      standard: string;
      maxres: string;
    };
    categoriesUrls: string[];
  };

  contextualAnalysis?: {
    prompt: string;
    tokens: number;
    answer: string;
  };
  relatedVideos?: {
    id: string;
    title: string;
    channelTitle: string;
    thumbnailUrl: string;
    publishedAt: string;
    isSameChannel: boolean;
  }[];

  thumbnailAnalysis?: {
    prompt: string;
    tokens: number;
    answer: string;
  };
  commentsAnalysis?: {
    comments: {
      author: string;
      text: string;
      display: string;
      likeCount: number;
    }[];
    prompt: string;
    tokens: number;
    answer: string;
  };

  scriptAnalysis?: {
    scripts: string[];
    prompt: string;
    tokens: number;
    answer: string;
  };

  summary?: {
    prompt: string;
    tokens: number;
    answer: string;
  };

  output?: {
    prompt: string;
    tokens: number;
    answer: string;
  };
  update: Setter<Omit<YoutubeReportState, 'update'>>;
};

export const youtubeReportStore = graphStore<YoutubeReportState>((set) => {
  return {
    userPrompt: '',
    startedAt: Date.now(),
    update: set,
  };
});
