import { ReflectiveState } from '../state';
import { graphStateNode } from 'ts-edge';

// 입력 노드: 초기 상태 설정
export const inputNode = graphStateNode({
  name: 'input',
  async execute(state: ReflectiveState, { stream }) {
    stream(`\n\n📝 INPUT NODE\n`);
    stream(`질문    : ${state.userPrompt}\n`);
    stream(`사용가능 도구 : '${state.tools.map((v) => v.name).join(',')}'\n`);
  },
});
