import { memoryVectorStore, models } from '@examples/models';
import { suite, test } from 'vitest';

suite.skip('vector', () => {
  test('default', async () => {
    const vectorstore = memoryVectorStore(models.embedding, {
      autoSave: false,
    });

    const dataList = [
      'Adidas Soccer Cleats',
      'Nike Sports Jacket',
      'Adidas Training Shorts',
      'Nike Basketball Sneakers',
      'Adidas Running Shoes',
      'Nike Casual T-Shirt',
      'Adidas Casual Hoodie',
      'Nike Sports Bag',
      'Adidas Leggings',
    ];

    for (const data of dataList) {
      await vectorstore.add(data);
    }

    const result = await vectorstore.similaritySearch('foot', 2);
    console.log(result.map((item) => item.data));
  });
});
