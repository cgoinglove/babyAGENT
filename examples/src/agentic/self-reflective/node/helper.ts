import { ReflectiveState } from '../state';

export const getHistoryText = (history: ReflectiveState['history']) => {
  if (!history.length) return '';
  return JSON.stringify(
    history.map((h) => {
      return {
        reason: h.reasoing_output,
        tool: h.tool.name
          ? {
              name: h.tool.name,
              input: h.tool.input,
              output: h.tool.output,
            }
          : null,
        reflection: h.reflection_output,
      };
    }),
    null,
    2
  );
};
