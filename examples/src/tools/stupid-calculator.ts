import z from 'zod';
import { ToolCall } from '@interface';

const CalculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number(),
});

export const stupidCalculator: ToolCall<z.infer<typeof CalculatorSchema>, number> = {
  name: 'Calculator',
  description: 'a (add|subtract|multiply|divide) b = ?  2개의 인자를 받아서 계산을 합니다.',
  schema: CalculatorSchema,
  execute: ({ a, b, operation }) => {
    switch (operation) {
      case 'add':
        return a + b;
      case 'subtract':
        return a - b;
      case 'multiply':
        return a * b;
      case 'divide': {
        if (b == 0) throw new Error('Division by zero');
        return a / b;
      }
      default:
        throw new Error('Invalid operation');
    }
  },
};
