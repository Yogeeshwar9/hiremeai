const API_BASE_URL = 'https://hiremeai-c3in.vercel.app';

export async function streamChat(question, onChunk, signal) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
    signal,
  })

  if (!response.ok || !response.body) {
    throw new Error('Unable to start the response stream.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let answer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    answer += decoder.decode(value, { stream: true })
    onChunk(answer)
  }

  answer += decoder.decode()
  return answer
}
