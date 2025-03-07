import z from 'zod';
import { Tool } from '@interface';

const CalculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number(),
});

export const calculator: Tool<z.infer<typeof CalculatorSchema>, number> = {
  name: 'Calculator',
  description: '계산이 가능한 계산기 입니다.',
  parameters: CalculatorSchema,
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
