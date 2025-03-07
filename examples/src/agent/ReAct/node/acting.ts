import { node } from 'ts-edge';
import { ReactState } from '../state';

export const actingNode = node({
  name: '🛠️ acting',
  async execute(state: ReactState): Promise<ReactState> {
    // search Tool
    const tool = state.tools.find((tool) => tool.name == state.action.tool);
    if (!tool) throw new Error('Tool Not Found');

    // Tool 실행
    const result = await tool.execute(state.action.input);

    // 결과 저장
    state.action.output = result;

    return state;
  },
});
