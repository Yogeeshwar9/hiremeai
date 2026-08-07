import axios from 'axios';

const API_BASE_URL = 'https://hiremeai-plum.vercel.app';

export async function streamChat(question, onChunk, signal) {
  const response = await axios.post(`${API_BASE_URL}/chat`,
    { question },
    {
      responseType: 'arraybuffer',
      signal,
    }
  );

  if (!response.data) {
    throw new Error('Unable to start the response stream.');
  }

  const decoder = new TextDecoder();
  const answer = decoder.decode(response.data);
  onChunk(answer);
  return answer;
}
