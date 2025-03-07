import z from 'zod';
import { Tool } from '@interface';

// 1. 가상 검색 엔진 도구
export const SearchEngineSchema = z.object({
  query: z.string(),
  limit: z.number().default(3).optional(),
});

export const searchEngine: Tool<
  z.infer<typeof SearchEngineSchema>,
  Array<{ title: string; snippet: string; url: string }>
> = {
  name: 'SearchEngine',
  description: '웹 검색을 시뮬레이션하는 가상 검색 엔진입니다',
  parameters: SearchEngineSchema,
  execute: ({ query, limit }) => {
    const mockResults = {
      AI: [
        {
          title: '인공지능(AI)이란 무엇인가?',
          snippet: '인공지능은 인간의 학습, 추론, 지각, 문제 해결 능력 등을 컴퓨터 프로그램으로 구현한 기술입니다.',
          url: 'https://example.com/ai-definition',
        },
        {
          title: '머신러닝과 딥러닝의 차이',
          snippet:
            '머신러닝은 AI의 하위 분야로 데이터로부터 패턴을 학습하는 알고리즘을 다루며, 딥러닝은 머신러닝의 하위 분야로 인공 신경망을 사용합니다.',
          url: 'https://example.com/ml-vs-dl',
        },
        {
          title: 'AI의 윤리적 문제와 도전',
          snippet: 'AI 기술의 발전으로 인해 발생하는 윤리적 이슈와 사회적 도전에 대한 고찰.',
          url: 'https://example.com/ai-ethics',
        },
        {
          title: '생성형 AI의 발전과 응용',
          snippet: 'GPT, DALL-E 등 최신 생성형 AI 모델의 발전과 다양한 산업 분야에서의 응용 사례.',
          url: 'https://example.com/generative-ai',
        },
        {
          title: 'AI와 일자리의 미래',
          snippet: 'AI 기술 발전이 노동 시장과 일자리에 미치는 영향과 미래 전망에 대한 분석.',
          url: 'https://example.com/ai-future-jobs',
        },
      ],
      기후변화: [
        {
          title: '기후변화의 원인과 영향',
          snippet: '지구 온난화를 일으키는 주요 요인과 생태계 및 인간 사회에 미치는 영향에 대한 설명.',
          url: 'https://example.com/climate-change-causes',
        },
        {
          title: '파리 기후 협약의 주요 내용',
          snippet: '지구 평균 온도 상승을 제한하기 위한 국제 협약인 파리 협정의 목표와 각국의 약속.',
          url: 'https://example.com/paris-agreement',
        },
        {
          title: '탄소중립을 위한 기술과 정책',
          snippet: '2050년까지 탄소중립을 달성하기 위한 신기술 개발과 필요한 정책적 지원.',
          url: 'https://example.com/carbon-neutral',
        },
        {
          title: '기후변화와 극단적 기상 현상',
          snippet: '기후변화로 인한 폭염, 홍수, 가뭄 등 극단적 기상 현상의 증가와 그 대응책.',
          url: 'https://example.com/extreme-weather',
        },
      ],
      건강: [
        {
          title: '건강한 식습관의 기본 원칙',
          snippet: '균형 잡힌 영양소 섭취와 건강한 식단 구성을 위한 가이드라인.',
          url: 'https://example.com/healthy-diet',
        },
        {
          title: '운동의 건강상 이점',
          snippet: '규칙적인 신체 활동이 심혈관 건강, 체중 관리, 정신 건강에 미치는 긍정적 영향.',
          url: 'https://example.com/exercise-benefits',
        },
        {
          title: '스트레스 관리 기법',
          snippet: '명상, 심호흡, 요가 등 일상 속 스트레스를 효과적으로 관리하는 방법.',
          url: 'https://example.com/stress-management',
        },
      ],
    };

    const results: any[] = [];
    for (const key in mockResults) {
      if (query.toLowerCase().includes(key.toLowerCase())) {
        results.push(...mockResults[key as keyof typeof mockResults]);
      }
    }

    // 결과가 없을 경우 기본 응답
    if (results.length === 0) {
      results.push({
        title: '검색 결과 없음',
        snippet: `'${query}'에 대한 검색 결과가 없습니다. 다른 키워드로 검색해 보세요.`,
        url: 'https://example.com/no-results',
      });
    }

    return results.slice(0, limit);
  },
};
