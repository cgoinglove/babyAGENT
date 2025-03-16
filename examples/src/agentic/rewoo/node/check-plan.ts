import { RewooState } from '../state';
import { graphNode } from 'ts-edge';

export const rewooCheckPlanNode = graphNode({
  name: '✅ Check Plan',
  metadata: {
    description: '계획을 확인하고 다음 계획을 선택합니다.',
  },
  execute: async (state: RewooState): Promise<RewooState> => {
    const plan = state.plan.list[state.planIndex];
    if (!plan) {
      return state;
    }
    plan.step = 'completed';
    if (state.debug) {
      console.log(`\n\n✅ CHECK PLAN NODE\n`);
      console.dir(plan, { depth: null });
    }
    state.planIndex++;
    return state;
  },
});
