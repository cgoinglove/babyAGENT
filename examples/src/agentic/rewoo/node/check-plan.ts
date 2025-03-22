import { RewooState } from '../state';
import { graphStateNode } from 'ts-edge';

export const rewooCheckPlanNode = graphStateNode({
  name: '✅ Check Plan',
  metadata: {
    description: '계획을 확인하고 다음 계획을 선택합니다.',
  },
  execute: async (state: RewooState, { stream }) => {
    const plan = state.getCurrentPlan();
    if (!plan) {
      return state;
    }
    plan.step = 'completed';
    state.next();
  },
});
