import { node } from 'ts-edge';
import { ReactState } from '../state';
import { Tool } from '@interface';
import { objectLLM, models } from '@examples/models';
import { z } from 'zod';

export const reasoningNode = node({
  name: '🧠 reasoning',
  async execute(state: ReactState): Promise<ReactState> {
    // 도구 정보 포맷팅
    const toolsDescription = state.tools.map((tool: Tool) => `- ${tool.name}: ${tool.description}`).join('\n');

    const llm = objectLLM(models.stupid);

    const ReasoningSchema = z.object({
      // 다음 계획
      nextPlan: z.string(),
      // 제공된 tool 들의 이름과 빈값  빈값시 툴 사용 안함
      toolName: z.enum(['', ...state.tools.map((v) => v.name)] as [string, ...string[]]),
    });

    let response: z.infer<typeof ReasoningSchema>;

    if (!state.thought) {
      // 초기 상태
      response = await llm(createInitialPrompt(state.userPrompt, toolsDescription), ReasoningSchema);
    } else {
      // 도구 사용 후 결과를 가지고 다시 추론
      response = await llm(
        createActionResultPrompt(
          state.userPrompt, // 유저 질문
          state.thought, // 이전 생각
          state.action.tool || '', // 사용한 툴
          state.action.input || '', // 툴 인풋
          state.action.output || '', // 툴의 결과
          toolsDescription // 사용 가능한 툴
        ),
        ReasoningSchema
      );
    }

    // 새 상태 생성
    const newState = { ...state, thought: response.nextPlan };

    // 도구 사용 여부에 따른 상태 업데이트
    if (response.toolName === '') {
      // 도구 사용 안 함 (최종 답변)
      newState.observation = 'complete';
    } else {
      // 도구 사용함
      newState.action = {
        tool: response.toolName, // 사용할 툴 이름
      };
      newState.observation = 'use_action';
    }

    return newState;
  },
});

// 초기 프롬프트
function createInitialPrompt(userQuestion: string, tools: string): string {
  return `당신은 문제 해결을 위해 단계적으로 생각하고 도구를 사용하는 에이전트입니다.
  다음 사용자 질문을 해결하세요:
  
  "${userQuestion}"
  
  사용 가능한 도구:
  ${tools}
  
  먼저 사용자 질문을 분석하고, 도구 사용이 필요한지 결정하세요.

  도구는 1가지만 사용이 가능합니다. 
  
  nextPlan 내용 작성 가이드:
  1. 도구를 사용할 경우 (toolName이 빈 문자열이 아닐 경우):
     - 왜 이 도구가 필요한지 명확히 설명하세요
     - 이 도구를 통해 얻고자 하는 정보나 결과를 구체적으로 기술하세요
     - 도구 사용 후 어떤 분석을 할 계획인지 포함하세요
  
  2. 최종 답변을 제공할 경우 (toolName이 빈 문자열일 경우):
     - 질문에 대한 최종 결론과 그 근거를 상세히 설명하세요
     - 사용자가 이해하기 쉬운 방식으로 정보를 정리하세요
     - 가능한 추가 정보나 맥락도 포함하세요
  
  다음 형식의 JSON 객체로 응답하세요:
  {
    "nextPlan": "위 가이드라인에 따른 상세한 사고 과정",
    "toolName": "사용할 도구 이름 (도구가 필요 없으면 빈 문자열 \"\")"
  }`;
}

// 액션 결과 프롬프트
function createActionResultPrompt(
  userQuestion: string,
  previousThought: string,
  toolName: string,
  toolInput: string,
  toolOutput: string,
  tools: string
): string {
  return `다음 사용자 질문을 해결하고 있습니다:
  "${userQuestion}"

  이전 사고 과정: ${previousThought}
  방금 사용한 도구: ${toolName}
  도구 실행 입력: ${toolInput}
  도구 실행 결과: ${toolOutput}
  
  이 결과를 바탕으로, 다음 단계를 결정하세요.

  이전 도구사용의 결과로 사용자의 질문을 해결 할 수 있다면. 최종 답변을 제공하세요.

  사용 가능한 도구:
  ${tools}

  도구는 1가지만 사용이 가능합니다. 
  
  nextPlan 내용 작성 가이드:
  1. 추가 도구가 필요한 경우 (toolName이 빈 문자열이 아닐 경우):
     - 도구 실행 결과를 분석하고 어떤 추가 정보가 필요한지 설명하세요
     - 새로운 도구를 선택한 이유와 이를 통해 얻고자 하는 정보를 구체적으로 기술하세요
     - 이 도구 사용 후 전체 문제 해결 접근법이 어떻게 진행될지 설명하세요
  
  2. 최종 답변을 제공할 경우 (toolName이 빈 문자열일 경우):
     - 지금까지의 도구 사용 결과를 종합적으로 분석하세요
     - 사용자 질문에 대한 명확한 결론과 근거를 제시하세요
     - 관련 맥락과 중요 정보를 포함하여 최종 응답의 완성도를 높이세요
     - 도구 결과를 언급할 때는 구체적인 데이터나 수치를 인용하세요
  

  이전 계획과 도구사용 내용을 고려하여 다음 계획을 위해 형식의 JSON 객체로 응답하세요:
  {
    "nextPlan": "이전 사용된 도구와 결과를 반영한 새로운 계획 위 가이드라인에 따른 상세한 사고 과정",
    "toolName": "사용할 도구 이름 (도구가 더 필요 없으면 빈 문자열 \"\")"
  }`;
}
