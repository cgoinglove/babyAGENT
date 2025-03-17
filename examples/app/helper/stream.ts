export const STREAM_START_DELIMITER = '```stream_start\r\n';
export const STREAM_END_DELIMITER = 'stream_end\r\n```';

export function streamReader(reader: ReadableStreamDefaultReader<Uint8Array> | undefined) {
  if (!reader) {
    throw new Error('Reader is undefined');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  return {
    async next() {
      while (!buffer.includes(STREAM_START_DELIMITER) || !buffer.includes(STREAM_END_DELIMITER)) {
        const { done, value } = await reader.read();
        if (done) {
          return { value: undefined, done: true };
        }

        buffer += decoder.decode(value, { stream: true });
      }

      const startIndex = buffer.indexOf(STREAM_START_DELIMITER);
      const endIndex = buffer.indexOf(STREAM_END_DELIMITER, startIndex);

      const jsonStart = startIndex + STREAM_START_DELIMITER.length;
      const jsonString = buffer.substring(jsonStart, endIndex);

      buffer = buffer.substring(endIndex + STREAM_END_DELIMITER.length);

      try {
        return { value: JSON.parse(jsonString), done: false };
      } catch (e) {
        console.error('Error parsing JSON:', e, 'JSON string:', jsonString);
        return this.next();
      }
    },

    [Symbol.asyncIterator]() {
      return {
        next: async () => {
          const result = await this.next();
          return result;
        },
      };
    },
  };
}
