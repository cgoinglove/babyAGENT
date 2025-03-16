import { RewooState } from '../state';

export const parsePlans = (plans: RewooState['plan']['list']): string => {
  return JSON.stringify(
    plans.map((plan) => {
      const data: Record<string, any> = {
        plan: plan.plan,
        reason: plan.reasoning?.answer,
      };
      if (plan.acting?.name) {
        data.tool = plan.acting.name;
        data.tool_input = plan.acting.input;
        data.tool_output = plan.acting.output;
      }

      return data;
    }),
    null,
    2
  );
};
