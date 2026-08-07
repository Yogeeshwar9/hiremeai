import axios from 'axios';

const API_BASE_URL = 'https://hiremeai-plum.vercel.app';

export async function streamChat(question, onChunk, signal) {
  const response = await axios.post(`${API_BASE_URL}/chat`,
    { question },
    {
      responseType: 'stream',
      signal,
    }
  );

  if (!response.data) {
    throw new Error('Unable to start the response stream.');
  }

  const decoder = new TextDecoder();
  let answer = '';

  return new Promise((resolve, reject) => {
    response.data.on('data', (chunk) => {
      answer += decoder.decode(chunk, { stream: true });
      onChunk(answer);
    });

    response.data.on('end', () => {
      answer += decoder.decode();
      resolve(answer);
    });

    response.data.on('error', (error) => {
      reject(error);
    });
  });
}
