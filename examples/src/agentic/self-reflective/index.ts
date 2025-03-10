import { createGraph } from 'ts-edge';
import { ReflectiveStage } from './state';
import { inputNode } from './node/input';
import { reasoningNode } from './node/reasoning';
import { actingNode } from './node/acting';
import { reflectingNode } from './node/reflective';
import { outputNode } from './node/output';

// Self-Reflection 워크플로우
const workflow = createGraph()
  .addNode(inputNode)
  .addNode(reasoningNode)
  .addNode(actingNode)
  .addNode(reflectingNode)
  .addNode(outputNode)

  // 시작: input -> reasoning
  .edge('input', 'reasoning')

  // 동적 엣지: 단계에 따라 다음 노드 결정
  .dynamicEdge('reasoning', (state) => {
    return state.stage === ReflectiveStage.ACTING ? 'acting' : 'reflecting';
  })

  // Acting -> Reflecting
  .edge('acting', 'reflecting')

  // 동적 엣지: 반성 결과에 따라 다음 노드 결정
  .dynamicEdge('reflecting', (state) => {
    return state.stage === ReflectiveStage.COMPLETED ? 'output' : 'reasoning';
  });

// 에이전트 생성 함수
export const createSelfReflectionAgent = () => workflow.compile('input', 'output');
