import { graphStateNode } from 'ts-edge';
import { ReActState } from '../state';

export const inputNode = graphStateNode({
  name: 'input',
  execute(state: ReActState, { stream }) {
    stream(`질문    : ${state.userPrompt}`);
    stream(`사용가능 도구 : '${state.tools.map((v) => v.name).join(',')}'`);
  },
});
